"""Utilities for interacting with the Postgres/pgvector store."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, Optional

import re

import psycopg
from psycopg import sql
from psycopg.conninfo import conninfo_to_dict

from llama_index.vector_stores.postgres import PGVectorStore

from ..config import Settings

_COLLECTION_SANITIZE_RE = re.compile(r"[^a-z0-9_]")


@lru_cache(maxsize=1)
def _parsed_conninfo(dsn: str) -> Dict[str, Any]:
    """Parse and cache the Postgres DSN into connection parameters."""

    return conninfo_to_dict(dsn)


def normalize_collection_name(name: str) -> str:
    """Return a Postgres-safe identifier for vector store collections."""

    sanitized = (name or "").strip()
    if not sanitized:
        raise ValueError("Collection name cannot be empty")

    sanitized = sanitized.lower()
    sanitized = sanitized.replace("-", "_")
    sanitized = _COLLECTION_SANITIZE_RE.sub("_", sanitized)
    sanitized = re.sub(r"_+", "_", sanitized)

    # Avoid leading underscores or digits that would require quoting.
    if sanitized[0].isdigit():
        sanitized = f"kb_{sanitized}"

    sanitized = sanitized.strip("_") or "kb_collection"

    return sanitized


def ensure_vector_extension(settings: Settings) -> None:
    """Ensure the pgvector extension is installed for the configured database."""

    if not settings.postgres_dsn:
        raise ValueError("Postgres DSN is required to use the vector store.")

    params = _parsed_conninfo(settings.postgres_dsn)

    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector")


def build_pgvector_store(
    settings: Settings,
    collection_name: str,
    embed_dim: int,
    *,
    hnsw_kwargs: Optional[Dict[str, Any]] = None,
) -> PGVectorStore:
    """Instantiate a PGVectorStore for the provided collection name."""

    if not settings.postgres_dsn:
        raise ValueError("Postgres DSN is required to use the vector store.")

    params = _parsed_conninfo(settings.postgres_dsn)

    normalized_name = normalize_collection_name(collection_name)

    _migrate_legacy_collection(settings, normalized_name)

    return PGVectorStore.from_params(
        database=params.get("dbname"),
        host=params.get("host"),
        port=int(params.get("port" or 5432)),
        user=params.get("user"),
        password=params.get("password"),
        table_name=normalized_name,
        embed_dim=embed_dim,
        hnsw_kwargs=hnsw_kwargs,
    )


def _relation_exists(cur: psycopg.Cursor, name: str, kind: str) -> bool:
    cur.execute(
        """
        SELECT EXISTS (
            SELECT 1
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = %s AND c.relname = %s AND c.relkind = %s
        )
        """,
        ("public", name, kind),
    )
    exists = cur.fetchone()
    return bool(exists and exists[0])


def _rename_index_if_exists(cur: psycopg.Cursor, old: str, new: str) -> None:
    if _relation_exists(cur, new, "i"):
        return
    if not _relation_exists(cur, old, "i"):
        return
    cur.execute(
        sql.SQL("ALTER INDEX {} RENAME TO {}").format(
            sql.Identifier("public", old),
            sql.Identifier(new),
        )
    )


def _migrate_legacy_collection(settings: Settings, collection_name: str) -> None:
    legacy_collection = collection_name.replace("_", "-")
    if legacy_collection == collection_name:
        return

    old_table = f"data_{legacy_collection}"
    new_table = f"data_{collection_name}"

    old_index_prefix = legacy_collection
    new_index_prefix = collection_name

    if not settings.postgres_dsn:
        return

    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            old_table_exists = _relation_exists(cur, old_table, "r")
            new_table_exists = _relation_exists(cur, new_table, "r")

            if old_table_exists and not new_table_exists:
                cur.execute(
                    sql.SQL("ALTER TABLE {} RENAME TO {}").format(
                        sql.Identifier("public", old_table),
                        sql.Identifier(new_table),
                    )
                )

                old_seq = f"{old_table}_id_seq"
                new_seq = f"{new_table}_id_seq"
                if _relation_exists(cur, old_seq, "S") and not _relation_exists(cur, new_seq, "S"):
                    cur.execute(
                        sql.SQL("ALTER SEQUENCE {} RENAME TO {}").format(
                            sql.Identifier("public", old_seq),
                            sql.Identifier(new_seq),
                        )
                    )

                _rename_index_if_exists(
                    cur,
                    f"{old_table}_embedding_idx",
                    f"{new_table}_embedding_idx",
                )

                for suffix in ("_idx", "_idx_1"):
                    _rename_index_if_exists(
                        cur,
                        f"{old_index_prefix}{suffix}",
                        f"{new_index_prefix}{suffix}",
                    )
