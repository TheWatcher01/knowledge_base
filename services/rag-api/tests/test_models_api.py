from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncIterator

import httpx
import pytest

from rag_api.api import create_app
from rag_api.config import Settings


@asynccontextmanager
async def _client(settings: Settings) -> AsyncIterator[httpx.AsyncClient]:
    app = create_app(settings)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


class _DummySettings(Settings):
    model_config = Settings.model_config


@pytest.mark.asyncio
async def test_list_models_success(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    def _fake_run(*args, **kwargs):  # noqa: ANN001
        return "[\n  {\"name\": \"llama3.1:8b\", \"size\": \"4.7 GB\", \"modified_at\": \"2024-10-01\"}\n]"

    monkeypatch.setattr("rag_api.routes.models._run_ollama_command", _fake_run)

    async with _client(settings) as client:
        response = await client.get("/api/v1/models")

    assert response.status_code == 200
    body = response.json()
    assert body["models"][0]["name"] == "llama3.1:8b"


@pytest.mark.asyncio
async def test_pull_model_success(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    def _fake_pull(*args, **kwargs):  # noqa: ANN001
        return "Pulling model"

    monkeypatch.setattr("rag_api.routes.models._run_ollama_command", _fake_pull)

    async with _client(settings) as client:
        response = await client.post("/api/v1/models/pull", json={"name": "llama3.1:8b"})

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "pulled"
    assert body["name"] == "llama3.1:8b"


@pytest.mark.asyncio
async def test_delete_model_success(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)
    monkeypatch.setattr("rag_api.routes.models._run_ollama_command", lambda *args, **kwargs: "")

    async with _client(settings) as client:
        response = await client.delete("/api/v1/models/test-model")

    assert response.status_code == 200
    assert response.json()["status"] == "deleted"


@pytest.mark.asyncio
async def test_update_model_defaults(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"
    settings.ollama_llm_model = "llama3"
    settings.ollama_embedding_model = "nomic-embed"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)
    cleared = {"value": False}

    def _clear():
        cleared["value"] = True

    monkeypatch.setattr("rag_api.routes.models.clear_embedding_cache", _clear)

    async with _client(settings) as client:
        response = await client.patch(
            "/api/v1/models/defaults",
            json={"chat_model": "llama3.1", "embedding_model": "text-embed"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["chat_model"] == "llama3.1"
    assert body["embedding_model"] == "text-embed"
    assert settings.ollama_llm_model == "llama3.1"
    assert settings.ollama_embedding_model == "text-embed"
    assert cleared["value"] is True


@pytest.mark.asyncio
async def test_update_model_defaults_requires_payload(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    async with _client(settings) as client:
        response = await client.patch("/api/v1/models/defaults", json={})

    assert response.status_code == 400
    assert "Provide" in response.text
