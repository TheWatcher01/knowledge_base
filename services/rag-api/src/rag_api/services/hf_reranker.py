"""HuggingFace-based reranker built on SentenceTransformers CrossEncoder."""

from __future__ import annotations

from functools import lru_cache
from typing import Dict, List

from sentence_transformers import CrossEncoder

from ..config import Settings as AppSettings


@lru_cache(maxsize=None)
def _load_cross_encoder(model_name: str, device: str | None) -> CrossEncoder:
    kwargs = {}
    if device:
        kwargs["device"] = device
    return CrossEncoder(model_name, **kwargs)


def rerank_with_huggingface(
    settings: AppSettings,
    query: str,
    documents: List[Dict[str, object]],
    *,
    model_name: str | None = None,
) -> List[Dict[str, object]]:
    """Return documents sorted by relevance using a SentenceTransformers cross-encoder."""

    target_model = (model_name or settings.hf_rerank_model or "").strip()
    if not target_model:
        raise ValueError("HuggingFace reranker model is not configured")

    encoder = _load_cross_encoder(target_model, settings.hf_rerank_device)

    if not documents:
        return []

    pairs = [[query, str(doc.get("text", ""))] for doc in documents]
    scores = encoder.predict(pairs)

    enriched: List[Dict[str, object]] = []
    for doc, score in zip(documents, scores):
        cloned = dict(doc)
        cloned["score"] = float(score)
        enriched.append(cloned)

    enriched.sort(key=lambda item: item.get("score", 0), reverse=True)
    return enriched
