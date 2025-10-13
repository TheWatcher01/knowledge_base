"""Retrieval helpers for querying PGVector collections."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, List

from llama_index.core.schema import MetadataMode, NodeWithScore

from ..config import Settings as AppSettings
from .ingestion import get_embedding_model
from .vector_store import build_pgvector_store, ensure_vector_extension


@lru_cache(maxsize=32)
def _default_hnsw_kwargs() -> Dict[str, Any]:
    return {
        "hnsw_m": 16,
        "hnsw_ef_construction": 64,
        "hnsw_ef_search": 40,
        "hnsw_dist_method": "vector_cosine_ops",
    }


def query_documents(
    settings: AppSettings,
    *,
    collection_name: str,
    query: str,
    limit: int,
) -> List[Dict[str, Any]]:
    """Return the most similar documents for the given query."""

    ensure_vector_extension(settings)

    embed_model = get_embedding_model(settings)
    query_embedding = embed_model.get_text_embedding(query)
    embed_dim = len(query_embedding)

    vector_store = build_pgvector_store(
        settings,
        collection_name=collection_name,
        embed_dim=embed_dim,
        hnsw_kwargs=_default_hnsw_kwargs(),
    )

    results = vector_store.query(
        query,
        query_embedding=query_embedding,
        similarity_top_k=limit,
    )

    if results is None or results.nodes is None:
        return []

    return [
        _serialize_node(node)
        for node in results.nodes
        if node
    ]


def _serialize_node(node: NodeWithScore) -> Dict[str, Any]:
    text = node.node.get_content(metadata_mode=MetadataMode.LLM)
    metadata = node.node.metadata or {}
    return {
        "text": text,
        "score": node.score,
        "metadata": metadata,
    }
