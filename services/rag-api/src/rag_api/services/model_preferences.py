"""Persistence helpers for Ollama model default selections."""

from __future__ import annotations

from typing import TYPE_CHECKING

import psycopg
from psycopg.rows import dict_row

if TYPE_CHECKING:  # pragma: no cover - typed import only
    from ..config import Settings


def _require_dsn(settings: "Settings") -> str:
    if not settings.postgres_dsn:
        raise ValueError("Postgres DSN is required to access model preferences")
    return settings.postgres_dsn


def get_model_preferences(settings: "Settings", provider: str = "ollama") -> dict[str, str | None]:
    """Fetch persisted model defaults for the given provider."""

    dsn = _require_dsn(settings)

    with psycopg.connect(dsn, autocommit=True, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "chatModel", "embeddingModel" FROM "ModelPreference" WHERE "provider" = %s',
                (provider,),
            )
            row = cur.fetchone() or {}

    chat_model = row.get("chatModel")  # type: ignore[arg-type]
    embedding_model = row.get("embeddingModel")  # type: ignore[arg-type]

    return {
        "chat_model": chat_model if isinstance(chat_model, str) else None,
        "embedding_model": embedding_model if isinstance(embedding_model, str) else None,
    }


def upsert_model_preferences(
    settings: "Settings",
    *,
    chat_model: str | None = None,
    embedding_model: str | None = None,
    provider: str = "ollama",
) -> dict[str, str | None]:
    """Persist new defaults and return the resulting values."""

    dsn = _require_dsn(settings)

    with psycopg.connect(dsn, autocommit=True, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT "chatModel", "embeddingModel" FROM "ModelPreference" WHERE "provider" = %s',
                (provider,),
            )
            existing = cur.fetchone() or {}

            next_chat = chat_model if chat_model is not None else existing.get("chatModel")
            next_embedding = (
                embedding_model if embedding_model is not None else existing.get("embeddingModel")
            )

            cur.execute(
                (
                    'INSERT INTO "ModelPreference" ("provider", "chatModel", "embeddingModel", "createdAt", "updatedAt") '
                    "VALUES (%s, %s, %s, NOW(), NOW()) "
                    "ON CONFLICT (\"provider\") DO UPDATE SET "
                    '"chatModel" = EXCLUDED."chatModel", "embeddingModel" = EXCLUDED."embeddingModel", '
                    '"updatedAt" = NOW() '
                    'RETURNING "chatModel", "embeddingModel"'
                ),
                (provider, next_chat, next_embedding),
            )

            persisted = cur.fetchone() or {}

    chat_value = persisted.get("chatModel")  # type: ignore[arg-type]
    embed_value = persisted.get("embeddingModel")  # type: ignore[arg-type]

    return {
        "chat_model": chat_value if isinstance(chat_value, str) else None,
        "embedding_model": embed_value if isinstance(embed_value, str) else None,
    }
