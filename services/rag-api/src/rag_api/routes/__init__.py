"""Route modules for the RAG API."""

from . import chat, health, models, retrieval, search  # noqa: F401

__all__ = [
    "chat",
    "health",
    "models",
    "retrieval",
    "search",
]
