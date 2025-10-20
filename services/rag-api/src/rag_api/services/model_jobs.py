"""Persistence helpers for Ollama model pull jobs."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from uuid import uuid4

import psycopg
from psycopg.rows import dict_row

if TYPE_CHECKING:  # pragma: no cover - used for type checking only
    from ..config import Settings


def _require_dsn(settings: "Settings") -> str:
    if not settings.postgres_dsn:
        raise ValueError("Postgres DSN is required to manage model jobs")
    return settings.postgres_dsn


def _serialize_job(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "provider": row.get("provider"),
        "model": row.get("model"),
        "status": row.get("status"),
        "summary": row.get("summary"),
        "error": row.get("error"),
        "queued_at": _iso_or_none(row.get("queuedAt")),
        "started_at": _iso_or_none(row.get("startedAt")),
        "finished_at": _iso_or_none(row.get("finishedAt")),
        "created_at": _iso_or_none(row.get("createdAt")),
        "updated_at": _iso_or_none(row.get("updatedAt")),
    }


def _iso_or_none(value: Any) -> str | None:
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, str):
        return value
    return None


def create_model_job(settings: "Settings", *, provider: str, model: str) -> dict[str, Any]:
    dsn = _require_dsn(settings)
    job_id = str(uuid4())

    with psycopg.connect(dsn, autocommit=True, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                (
                    'INSERT INTO "ModelJob" ("id", "provider", "model", "updatedAt") '
                    'VALUES (%s, %s, %s, NOW()) '
                    'RETURNING "id", "provider", "model", "status", "summary", "error", '
                    '"queuedAt", "startedAt", "finishedAt", "createdAt", "updatedAt"'
                ),
                (job_id, provider, model),
            )
            row = cur.fetchone() or {}

    return _serialize_job(row)


def mark_model_job_started(settings: "Settings", job_id: str) -> None:
    dsn = _require_dsn(settings)
    with psycopg.connect(dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE "ModelJob" SET "status" = %s, "startedAt" = NOW(), "updatedAt" = NOW() WHERE "id" = %s',
                ("running", job_id),
            )


def mark_model_job_succeeded(settings: "Settings", job_id: str, summary: str) -> None:
    dsn = _require_dsn(settings)
    with psycopg.connect(dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                (
                    'UPDATE "ModelJob" SET "status" = %s, "summary" = %s, "error" = NULL, '
                    '"finishedAt" = NOW(), "updatedAt" = NOW() WHERE "id" = %s'
                ),
                ("succeeded", summary, job_id),
            )


def mark_model_job_failed(settings: "Settings", job_id: str, error: str) -> None:
    dsn = _require_dsn(settings)
    with psycopg.connect(dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                (
                    'UPDATE "ModelJob" SET "status" = %s, "error" = %s, "finishedAt" = NOW(), '
                    '"updatedAt" = NOW() WHERE "id" = %s'
                ),
                ("failed", error, job_id),
            )


def list_model_jobs(settings: "Settings", *, provider: str, limit: int = 20) -> list[dict[str, Any]]:
    dsn = _require_dsn(settings)

    with psycopg.connect(dsn, autocommit=True, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                (
                    'SELECT "id", "provider", "model", "status", "summary", "error", '
                    '"queuedAt", "startedAt", "finishedAt", "createdAt", "updatedAt" '
                    'FROM "ModelJob" WHERE "provider" = %s ORDER BY "queuedAt" DESC LIMIT %s'
                ),
                (provider, limit),
            )
            rows = cur.fetchall() or []

    return [_serialize_job(row) for row in rows]


def get_model_job(settings: "Settings", job_id: str) -> dict[str, Any] | None:
    dsn = _require_dsn(settings)

    with psycopg.connect(dsn, autocommit=True, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                (
                    'SELECT "id", "provider", "model", "status", "summary", "error", '
                    '"queuedAt", "startedAt", "finishedAt", "createdAt", "updatedAt" '
                    'FROM "ModelJob" WHERE "id" = %s'
                ),
                (job_id,),
            )
            row = cur.fetchone()

    if not row:
        return None

    return _serialize_job(row)
