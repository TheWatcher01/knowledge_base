from __future__ import annotations

from ..logging import logger

import json
import uuid
from functools import lru_cache
from typing import Any, Dict, List, Optional

import psycopg
from psycopg.rows import dict_row

from ..config import Settings as AppSettings

log = logger("jobs")

DDL_STATEMENTS = [
    (
        """
        CREATE TABLE IF NOT EXISTS "UrlIngestionJob" (
            "id" UUID PRIMARY KEY,
            "documentId" TEXT NOT NULL,
            "status" TEXT NOT NULL,
            "queuedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "startedAt" TIMESTAMPTZ,
            "finishedAt" TIMESTAMPTZ,
            "errorMessage" TEXT,
            "metadata" JSONB,
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT "UrlIngestionJob_documentId_fkey" FOREIGN KEY ("documentId")
                REFERENCES "UrlEntry"("documentId") ON DELETE CASCADE
        )
        """
    ),
    (
        """
        CREATE INDEX IF NOT EXISTS "UrlIngestionJob_documentId_idx" ON "UrlIngestionJob"("documentId")
        """
    ),
]


@lru_cache(maxsize=1)
def _ensure_table_for_dsn(dsn: str) -> bool:
    with psycopg.connect(dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            for statement in DDL_STATEMENTS:
                cur.execute(statement)
    return True


def _ensure_table(settings: AppSettings) -> None:
    if not settings.postgres_dsn:
        raise ValueError("Postgres DSN is required to manage ingestion jobs")

    _ensure_table_for_dsn(settings.postgres_dsn)


def create_job(settings: AppSettings, document_id: str, *, url: str) -> tuple[str, bool]:
    """Create a job entry for the document. Returns (job_id, created)."""

    _ensure_table(settings)

    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "id" FROM "UrlIngestionJob" WHERE "documentId" = %s AND "status" IN (%s, %s) ORDER BY "queuedAt" DESC LIMIT 1',
                (document_id, "queued", "processing"),
            )
            row = cur.fetchone()
            if row:
                job_id = str(row[0])
                log.info("jobs.already_running", document_id=document_id, job_id=job_id)
                return job_id, False

            job_id = str(uuid.uuid4())
            cur.execute(
                'INSERT INTO "UrlIngestionJob" ("id", "documentId", "status", "metadata") VALUES (%s, %s, %s, %s)',
                (job_id, document_id, "queued", json.dumps({"url": url})),
            )

    log.info("jobs.created", document_id=document_id, job_id=job_id, url=url)
    return job_id, True


def mark_job_processing(settings: AppSettings, job_id: str) -> None:
    _ensure_table(settings)
    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE "UrlIngestionJob" SET "status" = %s, "startedAt" = NOW(), "finishedAt" = NULL, "updatedAt" = NOW() WHERE "id" = %s',
                ("processing", job_id),
            )
    log.info("jobs.processing", job_id=job_id)


def mark_job_completed(settings: AppSettings, job_id: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    _ensure_table(settings)
    metadata_json = json.dumps(metadata) if metadata else None
    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            if metadata_json is not None:
                cur.execute(
                    'UPDATE "UrlIngestionJob" SET "status" = %s, "finishedAt" = NOW(), "errorMessage" = NULL, "metadata" = COALESCE("metadata", %s::jsonb) || %s::jsonb, "updatedAt" = NOW() WHERE "id" = %s',
                    ("synced", "{}", metadata_json, job_id),
                )
            else:
                cur.execute(
                    'UPDATE "UrlIngestionJob" SET "status" = %s, "finishedAt" = NOW(), "errorMessage" = NULL, "updatedAt" = NOW() WHERE "id" = %s',
                    ("synced", job_id),
                )
    log.info("jobs.completed", job_id=job_id)


def mark_job_failed(settings: AppSettings, job_id: str, error_message: str) -> None:
    _ensure_table(settings)
    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE "UrlIngestionJob" SET "status" = %s, "finishedAt" = NOW(), "errorMessage" = %s, "updatedAt" = NOW() WHERE "id" = %s',
                ("error", error_message, job_id),
            )
    log.warning("jobs.failed", job_id=job_id, error=error_message)


def get_latest_job(settings: AppSettings, document_id: str) -> Optional[Dict[str, Any]]:
    _ensure_table(settings)
    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "id", "status", "queuedAt", "startedAt", "finishedAt", "errorMessage", "metadata", "updatedAt" FROM "UrlIngestionJob" WHERE "documentId" = %s ORDER BY "queuedAt" DESC LIMIT 1',
                (document_id,),
            )
            row = cur.fetchone()

    if not row:
        return None

    job_id, status, queued_at, started_at, finished_at, error_message, metadata, updated_at = row
    return {
        "id": str(job_id),
        "status": status,
        "queued_at": queued_at.isoformat() if queued_at else None,
        "started_at": started_at.isoformat() if started_at else None,
        "finished_at": finished_at.isoformat() if finished_at else None,
        "error_message": error_message,
        "metadata": metadata,
        "updated_at": updated_at.isoformat() if updated_at else None,
    }


def list_jobs(
    settings: AppSettings,
    *,
    document_id: str | None = None,
    kb_id: str | None = None,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    """Return recent ingestion jobs filtered by document or knowledge base."""

    if not document_id and not kb_id:
        raise ValueError("document_id or kb_id must be provided")

    if limit < 1:
        raise ValueError("limit must be positive")

    effective_limit = min(limit, 100)

    _ensure_table(settings)

    with psycopg.connect(settings.postgres_dsn, autocommit=True, row_factory=dict_row) as conn:  # type: ignore[arg-type]
        with conn.cursor() as cur:
            conditions: List[str] = []
            params: List[Any] = []

            if document_id:
                conditions.append('job."documentId" = %s')
                params.append(document_id)

            if kb_id:
                conditions.append('doc."kbId" = %s')
                params.append(kb_id)

            where_clause = f" WHERE {' AND '.join(conditions)}" if conditions else ""

            cur.execute(
                f'''
                    SELECT
                        job."id" AS job_id,
                        job."documentId" AS document_id,
                        job."status" AS job_status,
                        job."queuedAt" AS queued_at,
                        job."startedAt" AS started_at,
                        job."finishedAt" AS finished_at,
                        job."errorMessage" AS error_message,
                        job."metadata" AS metadata,
                        job."updatedAt" AS job_updated_at,
                        url."status" AS url_status,
                        url."updatedAt" AS url_updated_at,
                        url."url" AS url,
                        doc."kbId" AS kb_id,
                        doc."title" AS document_title
                    FROM "UrlIngestionJob" AS job
                    INNER JOIN "UrlEntry" AS url ON url."documentId" = job."documentId"
                    INNER JOIN "Document" AS doc ON doc."id" = job."documentId"
                    {where_clause}
                    ORDER BY job."queuedAt" DESC
                    LIMIT %s
                ''',
                (*params, effective_limit),
            )
            rows = cur.fetchall()

    return [_normalise_row(row) for row in rows]


def get_job(settings: AppSettings, job_id: str) -> Optional[Dict[str, Any]]:
    """Return a single job by identifier."""

    _ensure_table(settings)

    with psycopg.connect(settings.postgres_dsn, autocommit=True, row_factory=dict_row) as conn:  # type: ignore[arg-type]
        with conn.cursor() as cur:
            cur.execute(
                '''
                    SELECT
                        job."id" AS job_id,
                        job."documentId" AS document_id,
                        job."status" AS job_status,
                        job."queuedAt" AS queued_at,
                        job."startedAt" AS started_at,
                        job."finishedAt" AS finished_at,
                        job."errorMessage" AS error_message,
                        job."metadata" AS metadata,
                        job."updatedAt" AS job_updated_at,
                        url."status" AS url_status,
                        url."updatedAt" AS url_updated_at,
                        url."url" AS url,
                        doc."kbId" AS kb_id,
                        doc."title" AS document_title
                    FROM "UrlIngestionJob" AS job
                    INNER JOIN "UrlEntry" AS url ON url."documentId" = job."documentId"
                    INNER JOIN "Document" AS doc ON doc."id" = job."documentId"
                    WHERE job."id" = %s
                ''',
                (job_id,),
            )
            row = cur.fetchone()

    if not row:
        return None

    return _normalise_row(row)


def count_active_jobs(settings: AppSettings, *, kb_id: str | None = None) -> int:
    """Count queued or processing jobs, optionally for a given knowledge base."""

    _ensure_table(settings)

    query = (
        'SELECT COUNT(*) FROM "UrlIngestionJob" AS job '
        'INNER JOIN "Document" AS doc ON doc."id" = job."documentId" '
        'WHERE job."status" IN (%s, %s)'
    )
    params: List[Any] = ["queued", "processing"]

    if kb_id:
        query += ' AND doc."kbId" = %s'
        params.append(kb_id)

    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            row = cur.fetchone()

    return int(row[0]) if row else 0


def _normalise_row(row: Dict[str, Any]) -> Dict[str, Any]:
    def _iso(value: Any) -> str | None:
        if value is None:
            return None
        if hasattr(value, "isoformat"):
            return value.isoformat()  # type: ignore[no-any-return]
        return str(value)

    return {
        "id": str(row["job_id"]),
        "document_id": row["document_id"],
        "kb_id": row["kb_id"],
        "status": row["job_status"],
        "queued_at": _iso(row["queued_at"]),
        "started_at": _iso(row["started_at"]),
        "finished_at": _iso(row["finished_at"]),
        "error_message": row.get("error_message"),
        "metadata": row.get("metadata"),
        "updated_at": _iso(row["job_updated_at"]),
        "url": row.get("url"),
        "url_status": row.get("url_status"),
        "url_updated_at": _iso(row.get("url_updated_at")),
        "document_title": row.get("document_title"),
    }
