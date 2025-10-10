from __future__ import annotations

from ..logging import logger

import json
import uuid
from functools import lru_cache
from typing import Any, Dict, Optional

import psycopg

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
