from __future__ import annotations

from rag_api.config import get_settings


def test_get_settings_loads_persisted_defaults(monkeypatch):
    monkeypatch.setenv("RAG_POSTGRES_DSN", "postgresql+psycopg://kb:kb@postgres:5432/kb")

    monkeypatch.setattr(
        "rag_api.config.get_model_preferences",
        lambda settings: {"chat_model": "persisted-chat", "embedding_model": "persisted-embed"},
    )

    get_settings.cache_clear()

    settings = get_settings()

    assert settings.ollama_llm_model == "persisted-chat"
    assert settings.ollama_embedding_model == "persisted-embed"
