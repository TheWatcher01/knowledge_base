"""Utilities for interacting with the Postgres/pgvector store."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, Optional

import psycopg
from psycopg.conninfo import conninfo_to_dict

from llama_index.vector_stores.postgres import PGVectorStore

from ..config import Settings


@lru_cache(maxsize=1)
def _parsed_conninfo(dsn: str) -> Dict[str, Any]:
    """Parse and cache the Postgres DSN into connection parameters."""

    return conninfo_to_dict(dsn)


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

    return PGVectorStore.from_params(
        database=params.get("dbname"),
        host=params.get("host"),
        port=int(params.get("port" or 5432)),
        user=params.get("user"),
        password=params.get("password"),
        table_name=collection_name,
        embed_dim=embed_dim,
        hnsw_kwargs=hnsw_kwargs,
    )

