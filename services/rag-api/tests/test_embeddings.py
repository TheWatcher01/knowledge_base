import pytest

from rag_api.config import Settings
from rag_api.services import embedding_provider


def _base_settings(**overrides):
    params = {
        "ollama_base_url": "http://localhost:11434",
        "ollama_embedding_model": "mxbai-embed-large",
        "enable_fallback_embeddings": True,
        "fallback_embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_backend": "auto",
    }
    params.update(overrides)
    return Settings(**params)


def setup_function(_: object) -> None:
    embedding_provider.clear_embedding_backends()


def teardown_function(_: object) -> None:
    embedding_provider.clear_embedding_backends()


def test_prefers_ollama(monkeypatch):
    class FakeBackend:
        def __init__(self):
            self.called = False

        def get_text_embedding(self, text: str):
            self.called = True
            return [0.0, 1.0, 2.0]

    fake_backend = FakeBackend()

    def fake_ollama(base, model: str):
        assert str(base).startswith("http")
        assert model
        return fake_backend

    monkeypatch.setattr(embedding_provider, "_ollama_embedding", fake_ollama)
    monkeypatch.setattr(embedding_provider, "_huggingface_embedding", lambda *_: object())

    settings = _base_settings()
    backend = embedding_provider.get_embedding_backend(settings)
    assert backend is fake_backend


def test_fallback_when_ollama_fails(monkeypatch):
    sentinel = object()

    def failing_ollama(*_, **__):  # pragma: no cover - invoked intentionally
        raise RuntimeError("boom")

    monkeypatch.setattr(embedding_provider, "_ollama_embedding", failing_ollama)
    monkeypatch.setattr(embedding_provider, "_huggingface_embedding", lambda *_: sentinel)
    monkeypatch.setattr(embedding_provider, "_detect_hf_device", lambda *_: "cpu")

    settings = _base_settings()
    backend = embedding_provider.get_embedding_backend(settings)
    assert backend is sentinel


def test_error_when_no_backend(monkeypatch):
    def failing_ollama(*_, **__):  # pragma: no cover - invoked intentionally
        raise RuntimeError("boom")

    monkeypatch.setattr(embedding_provider, "_ollama_embedding", failing_ollama)
    monkeypatch.setattr(embedding_provider, "_detect_hf_device", lambda *_: "cpu")

    settings = _base_settings(enable_fallback_embeddings=False)

    with pytest.raises(ValueError):
        embedding_provider.get_embedding_backend(settings)


def test_huggingface_forced(monkeypatch):
    sentinel = object()

    monkeypatch.setattr(embedding_provider, "_huggingface_embedding", lambda model, device: (model, device))
    monkeypatch.setattr(embedding_provider, "_detect_hf_device", lambda *_: "cuda")

    settings = _base_settings(embedding_backend="huggingface", fallback_embedding_device=None)
    backend = embedding_provider.get_embedding_backend(settings)
    assert backend == (settings.fallback_embedding_model, "cuda")
