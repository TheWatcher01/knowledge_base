"""Retrieval helpers for querying PGVector collections."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Dict, List

from llama_index.core.schema import MetadataMode, NodeWithScore

from ..config import Settings as AppSettings
from ..logging import logger
from .embedding_provider import get_embedding_backend
from .openrouter import rerank_documents
from .vector_store import build_pgvector_store, ensure_vector_extension


log = logger("retrieval")


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
    rerank_model: str | None = None,
) -> List[Dict[str, Any]]:
    """Return the most similar documents for the given query."""

    ensure_vector_extension(settings)

    embed_model = get_embedding_backend(settings)
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

    documents = [
        _serialize_node(node)
        for node in results.nodes
        if node
    ]

    requested_model = (rerank_model or "").strip()
    disable_rerank = rerank_model is not None and requested_model == ""
    model_override = requested_model or None

    if (
        documents
        and not disable_rerank
        and settings.openrouter_api_key
        and (model_override or settings.openrouter_rerank_model)
    ):
        try:
            return rerank_documents(
                settings,
                query=query,
                documents=documents,
                model_name=model_override,
            )
        except Exception as exc:  # pragma: no cover - defensive
            log.warning("openrouter.rerank_error", error=str(exc))
            return documents

    return documents


def _serialize_node(node: NodeWithScore) -> Dict[str, Any]:
    text = node.node.get_content(metadata_mode=MetadataMode.LLM)
    metadata = node.node.metadata or {}
    return {
        "text": text,
        "score": node.score,
        "metadata": metadata,
    }
