"""Lightweight BM25 retrieval on top of the PGVector chunk table."""

from __future__ import annotations

import json
from typing import Dict, List, Tuple

import psycopg
from psycopg import sql
from rank_bm25 import BM25Okapi

from ..config import Settings as AppSettings


def _load_corpus(
    settings: AppSettings,
    collection_name: str,
    *,
    limit: int,
) -> List[Tuple[str, Dict[str, object]]]:
    if not settings.postgres_dsn:
        return []

    table = f"data_{collection_name}"
    rows: List[Tuple[str, Dict[str, object]]] = []
    try:
        with psycopg.connect(settings.postgres_dsn) as conn:
            with conn.cursor() as cur:
                query = sql.SQL("SELECT text, metadata_ FROM {} WHERE text IS NOT NULL LIMIT %s").format(
                    sql.Identifier("public", table)
                )
                cur.execute(query, (limit,))
                for text, metadata in cur.fetchall():  # type: ignore[misc]
                    meta_dict: Dict[str, object]
                    if metadata is None:
                        meta_dict = {}
                    elif isinstance(metadata, dict):
                        meta_dict = metadata  # type: ignore[assignment]
                    else:
                        meta_dict = json.loads(metadata)
                    rows.append((text, meta_dict))
    except Exception:
        return []
    return rows


def bm25_search(
    settings: AppSettings,
    *,
    collection_name: str,
    query: str,
    limit: int = 5,
    corpus_limit: int = 2000,
) -> List[Dict[str, object]]:
    """Return BM25-scored documents for the collection."""

    corpus = _load_corpus(settings, collection_name, limit=corpus_limit)
    if not corpus:
        return []

    tokenized_corpus = [text.split() for text, _ in corpus]
    bm25 = BM25Okapi(tokenized_corpus)
    tokenized_query = query.split()
    scores = bm25.get_scores(tokenized_query)

    items: List[Tuple[float, str, Dict[str, object]]] = []
    for score, (text, metadata) in zip(scores, corpus):
        items.append((float(score), text, metadata))

    items.sort(key=lambda entry: entry[0], reverse=True)

    results: List[Dict[str, object]] = []
    for score, text, metadata in items[:limit]:
        results.append({
            "text": text,
            "metadata": metadata,
            "score": score,
        })
    return results
