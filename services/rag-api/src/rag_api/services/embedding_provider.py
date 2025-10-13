"""Embedding provider with Ollama primary and HuggingFace fallback."""

from __future__ import annotations

import logging
from functools import lru_cache

from llama_index.core.base.embeddings.base import BaseEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.embeddings.ollama import OllamaEmbedding

from ..config import Settings as AppSettings

LOGGER = logging.getLogger(__name__)


@lru_cache(maxsize=None)
def _ollama_embedding(base_url: str, model: str) -> OllamaEmbedding:
    LOGGER.debug("Creating Ollama embedding backend model=%s base=%s", model, base_url)
    backend = OllamaEmbedding(model_name=model, base_url=str(base_url))
    try:
        backend.get_text_embedding("healthcheck")
    except Exception as exc:  # pragma: no cover - network failure
        LOGGER.warning("Ollama embedding healthcheck failed: %s", exc)
        raise
    return backend


@lru_cache(maxsize=None)
def _huggingface_embedding(model: str, device: str | None) -> HuggingFaceEmbedding:
    LOGGER.debug("Creating HuggingFace embedding backend model=%s device=%s", model, device)
    kwargs: dict[str, str] = {}
    if device:
        kwargs["device"] = device
    return HuggingFaceEmbedding(model_name=model, **kwargs)


def get_embedding_backend(settings: AppSettings) -> BaseEmbedding:
    """Return the embedding backend, falling back to HuggingFace when Ollama n'est pas disponible."""

    if settings.ollama_base_url:
        try:
            return _ollama_embedding(settings.ollama_base_url, settings.ollama_embedding_model)
        except Exception as exc:  # pragma: no cover - network hiccup fallback
            LOGGER.warning("Ollama embedding backend unavailable, fallback engaged: %s", exc)

    if settings.enable_fallback_embeddings:
        model = settings.fallback_embedding_model
        device = settings.fallback_embedding_device or None
        try:
            return _huggingface_embedding(model, device)
        except Exception as exc:  # pragma: no cover - propagate to caller
            LOGGER.error("Fallback embedding backend failed: model=%s error=%s", model, exc)
            raise

    raise ValueError("No embedding backend available (ollama disabled and fallback disabled)")


def clear_embedding_backends() -> None:
    """Purge caches (utilisé en tests ou lorsqu'on change la configuration)."""

    _ollama_embedding.cache_clear()
    _huggingface_embedding.cache_clear()
