"""Low-level helpers for updating ingestion status in Postgres."""

from __future__ import annotations

from typing import Any, Dict

import psycopg

from ..config import Settings as AppSettings


def update_url_status(settings: AppSettings, document_id: str, status: str) -> None:
    if not settings.postgres_dsn:
        raise ValueError("Postgres DSN is required to update URL status")

    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE "UrlEntry" SET "status" = %s, "updatedAt" = NOW() WHERE "documentId" = %s',
                (status, document_id),
            )


def get_url_status(settings: AppSettings, document_id: str) -> Dict[str, Any] | None:
    if not settings.postgres_dsn:
        raise ValueError("Postgres DSN is required to read URL status")

    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "status", "updatedAt" FROM "UrlEntry" WHERE "documentId" = %s',
                (document_id,),
            )
            row = cur.fetchone()

    if not row:
        return None

    status, updated_at = row
    return {
        "status": status,
        "updated_at": updated_at.isoformat() if updated_at else None,
    }

