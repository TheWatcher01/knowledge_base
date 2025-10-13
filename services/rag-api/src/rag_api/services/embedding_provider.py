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


def _detect_hf_device(settings: AppSettings) -> str | None:
    if settings.fallback_embedding_device:
        return settings.fallback_embedding_device

    try:  # pragma: no branch - optional dependency
        import torch

        if torch.cuda.is_available():  # type: ignore[attr-defined]
            return "cuda"
    except ImportError:  # pragma: no cover - torch optional
        LOGGER.debug("torch not installed, defaulting HuggingFace device to cpu")

    return "cpu"


def get_embedding_backend(settings: AppSettings) -> BaseEmbedding:
    """Return embedding backend according to configuration and availability."""

    mode = settings.embedding_backend.lower()

    def _try_ollama() -> BaseEmbedding:
        if not settings.ollama_base_url:
            raise ValueError("Ollama base URL not configured")
        return _ollama_embedding(settings.ollama_base_url, settings.ollama_embedding_model)

    def _try_huggingface() -> BaseEmbedding:
        if not settings.enable_fallback_embeddings:
            raise ValueError("HuggingFace fallback disabled")
        model = settings.fallback_embedding_model
        device = _detect_hf_device(settings)
        return _huggingface_embedding(model, device)

    if mode == "ollama":
        return _try_ollama()

    if mode == "huggingface":
        return _try_huggingface()

    # auto mode
    if settings.ollama_base_url:
        try:
            backend = _try_ollama()
            LOGGER.debug("Using Ollama embedding backend (auto mode)")
            return backend
        except Exception as exc:  # pragma: no cover - runtime failure
            LOGGER.warning("Ollama embedding backend unavailable, falling back to HuggingFace: %s", exc)

    try:
        backend = _try_huggingface()
        LOGGER.debug("Using HuggingFace embedding backend (auto mode)")
        return backend
    except Exception as exc:  # pragma: no cover - propagate error
        LOGGER.error("No embedding backend available: %s", exc)
        raise ValueError("No embedding backend available (Ollama failed and fallback disabled/failed)") from exc


def clear_embedding_backends() -> None:
    """Purge caches (utilisé en tests ou lorsqu'on change la configuration)."""

    _ollama_embedding.cache_clear()
    _huggingface_embedding.cache_clear()
