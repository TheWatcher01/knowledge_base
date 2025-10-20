"""Retrieval helpers for querying PGVector collections."""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Any, Dict, List

from llama_index.core.schema import BaseNode, MetadataMode, NodeWithScore
from llama_index.core.vector_stores.types import VectorStoreQuery, VectorStoreQueryMode, VectorStoreQueryResult

from ..config import Settings as AppSettings
from ..logging import logger
from .bm25 import bm25_search
from .embedding_provider import clear_embedding_backends, get_embedding_backend
from .hf_reranker import rerank_with_huggingface
from .openrouter import rerank_documents as rerank_with_openrouter
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

    def _run_with_embeddings(conf: Settings) -> VectorStoreQueryResult | None:
        embed_model = get_embedding_backend(conf)
        query_embedding = embed_model.get_text_embedding(query)
        embed_dim = len(query_embedding)

        vector_store = build_pgvector_store(
            settings,
            collection_name=collection_name,
            embed_dim=embed_dim,
            hnsw_kwargs=_default_hnsw_kwargs(),
        )

        query_obj = VectorStoreQuery(
            query_embedding=query_embedding,
            similarity_top_k=limit,
            query_str=query,
            mode=VectorStoreQueryMode.DEFAULT,
        )

        return vector_store.query(query_obj)

    try:
        results = _run_with_embeddings(settings)
    except Exception as exc:  # pragma: no cover - defensive guard for vector store failures
        message = str(exc)
        if "different vector dimensions" in message.lower() and settings.enable_fallback_embeddings:
            log.warning("retrieval.vector_query_dimension_mismatch", error=message)
            clear_embedding_backends()
            fallback_settings = settings.model_copy(update={"embedding_backend": "huggingface"})
            try:
                results = _run_with_embeddings(fallback_settings)
            except Exception as retry_exc:  # pragma: no cover - secondary failure
                log.warning("retrieval.vector_query_failed", error=str(retry_exc))
                return []
        else:
            log.warning("retrieval.vector_query_failed", error=message)
            return []

    if results is None or results.nodes is None:
        return []

    documents = [
        _serialize_node(node)
        for node in results.nodes
        if node
    ]

    if settings.hybrid_retrieval_enabled:
        try:
            bm25_documents = bm25_search(
                settings,
                collection_name=collection_name,
                query=query,
                limit=limit,
                corpus_limit=settings.hybrid_bm25_corpus_limit,
            )
        except Exception as exc:  # pragma: no cover - defensive
            log.warning("bm25.search_failed", error=str(exc))
            bm25_documents = []

        if bm25_documents:
            documents = _merge_hybrid_results(
                vector_docs=documents,
                bm25_docs=bm25_documents,
                vector_weight=settings.hybrid_vector_weight,
            )

    requested_model = (rerank_model or "").strip()
    disable_rerank = rerank_model is not None and requested_model == ""
    model_override = requested_model or None

    if not documents or disable_rerank or settings.rerank_backend == "disabled":
        return documents

    backend_order: List[str]
    configured_backend = settings.rerank_backend.lower()
    if configured_backend == "auto":
        backend_order = ["openrouter", "huggingface"]
    else:
        backend_order = [configured_backend]

    for backend in backend_order:
        if backend == "openrouter":
            if not settings.openrouter_api_key:
                continue
            target_model = model_override or settings.openrouter_rerank_model
            if not target_model:
                continue
            try:
                return rerank_with_openrouter(
                    settings,
                    query=query,
                    documents=documents,
                    model_name=target_model,
                )
            except Exception as exc:  # pragma: no cover - defensive
                log.warning("openrouter.rerank_error", error=str(exc), model=target_model)
                continue

        if backend == "huggingface":
            target_model = model_override or settings.hf_rerank_model
            if not target_model:
                continue
            try:
                return rerank_with_huggingface(
                    settings,
                    query=query,
                    documents=documents,
                    model_name=target_model,
                )
            except Exception as exc:  # pragma: no cover - defensive
                log.warning("huggingface.rerank_error", error=str(exc), model=target_model)
                continue

    return documents


def _serialize_node(node: NodeWithScore | BaseNode) -> Dict[str, Any]:
    source: BaseNode
    score: float | None = None

    if isinstance(node, NodeWithScore):
        source = node.node
        score = node.score
    else:
        source = node  # type: ignore[assignment]
        score = getattr(node, "score", None)

    text = source.get_content(metadata_mode=MetadataMode.LLM)
    metadata = source.metadata or {}
    return {
        "text": text,
        "score": score,
        "metadata": metadata,
    }


def _normalize_scores(documents: List[Dict[str, Any]]) -> Dict[str, float]:
    values: List[float] = []
    for doc in documents:
        raw = doc.get("score")
        if isinstance(raw, (int, float)):
            values.append(float(raw))

    if not values:
        return {id(doc): 0.0 for doc in documents}

    min_score = min(values)
    max_score = max(values)
    if max_score - min_score < 1e-9:
        return {id(doc): 1.0 for doc in documents}

    normalized: Dict[int, float] = {}
    for doc in documents:
        raw = doc.get("score")
        if isinstance(raw, (int, float)):
            normalized[id(doc)] = (float(raw) - min_score) / (max_score - min_score)
        else:
            normalized[id(doc)] = 0.0
    return normalized


def _merge_hybrid_results(
    *,
    vector_docs: List[Dict[str, Any]],
    bm25_docs: List[Dict[str, Any]],
    vector_weight: float,
) -> List[Dict[str, Any]]:
    bm25_weight = max(0.0, min(1.0, 1.0 - vector_weight))
    vector_weight = max(0.0, min(1.0, vector_weight))

    vector_scores = _normalize_scores(vector_docs)
    bm25_scores = _normalize_scores(bm25_docs)

    combined: Dict[str, Dict[str, Any]] = {}

    def _key(doc: Dict[str, Any]) -> str:
        text = doc.get("text")
        metadata = doc.get("metadata")
        return f"{text!r}-{json.dumps(metadata, sort_keys=True) if isinstance(metadata, dict) else repr(metadata)}"

    for doc in vector_docs:
        key = _key(doc)
        payload = dict(doc)
        payload["_vector_score"] = vector_scores.get(id(doc), 0.0)
        payload.setdefault("_bm25_score", 0.0)
        combined[key] = payload

    for doc in bm25_docs:
        key = _key(doc)
        payload = combined.get(key, dict(doc))
        payload.setdefault("_vector_score", 0.0)
        payload["_bm25_score"] = bm25_scores.get(id(doc), 0.0)
        combined[key] = payload

    results: List[Dict[str, Any]] = []
    for payload in combined.values():
        score = (
            vector_weight * float(payload.get("_vector_score", 0.0))
            + bm25_weight * float(payload.get("_bm25_score", 0.0))
        )
        payload["score"] = score
        payload.pop("_vector_score", None)
        payload.pop("_bm25_score", None)
        results.append(payload)

    results.sort(key=lambda item: item.get("score", 0.0), reverse=True)
    return results
