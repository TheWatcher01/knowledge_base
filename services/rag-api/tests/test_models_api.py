from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

import httpx
import pytest
from fastapi import HTTPException

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
async def test_get_model_defaults_uses_persistence(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"
    settings.ollama_llm_model = "llama3"
    settings.ollama_embedding_model = "nomic-embed"
    settings.postgres_dsn = "postgresql+psycopg://user:pass@localhost/db"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    monkeypatch.setattr(
        "rag_api.routes.models.get_model_preferences",
        lambda s, provider="ollama": {"chat_model": "persisted", "embedding_model": "embed"},
    )

    async with _client(settings) as client:
        response = await client.get("/api/v1/models/defaults")

    assert response.status_code == 200
    body = response.json()
    assert body["chat_model"] == "persisted"
    assert body["embedding_model"] == "embed"
    assert settings.ollama_llm_model == "persisted"
    assert settings.ollama_embedding_model == "embed"


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
    monkeypatch.setattr(
        "rag_api.routes.models.create_model_job",
        lambda s, provider, model: {
            "id": "job-123",
            "provider": provider,
            "model": model,
            "status": "queued",
        },
    )
    invoked: dict[str, str] = {}
    def _fake_background(settings, job_id, model_name):  # noqa: ANN001
        invoked["job_id"] = job_id
        invoked["model"] = model_name
        return None

    monkeypatch.setattr("rag_api.routes.models._background_pull_job", _fake_background)

    async with _client(settings) as client:
        response = await client.post("/api/v1/models/pull", json={"name": "llama3.1:8b"})

    assert response.status_code == 202
    body = response.json()
    assert body["job"]["id"] == "job-123"
    assert body["job"]["status"] == "queued"
    assert invoked["job_id"] == "job-123"
    assert invoked["model"] == "llama3.1:8b"


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
async def test_list_model_jobs(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)
    monkeypatch.setattr(
        "rag_api.routes.models.list_model_jobs",
        lambda s, provider, limit: [
            {
                "id": "job-1",
                "provider": provider,
                "model": "llama3",
                "status": "queued",
                "summary": None,
                "error": None,
                "queued_at": "2025-10-11T13:45:00Z",
                "started_at": None,
                "finished_at": None,
                "created_at": "2025-10-11T13:45:00Z",
                "updated_at": "2025-10-11T13:45:00Z",
            }
        ],
    )

    async with _client(settings) as client:
        response = await client.get("/api/v1/models/jobs")

    assert response.status_code == 200
    body = response.json()
    assert body["jobs"][0]["id"] == "job-1"


@pytest.mark.asyncio
async def test_get_model_job(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)
    monkeypatch.setattr(
        "rag_api.routes.models.get_model_job",
        lambda s, job_id: {"id": job_id, "provider": "ollama", "model": "demo", "status": "running"},
    )

    async with _client(settings) as client:
        response = await client.get("/api/v1/models/jobs/job-1")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


@pytest.mark.asyncio
async def test_get_model_job_not_found(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)
    monkeypatch.setattr("rag_api.routes.models.get_model_job", lambda s, job_id: None)

    async with _client(settings) as client:
        response = await client.get("/api/v1/models/jobs/job-unknown")

    assert response.status_code == 404


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

    monkeypatch.setattr("rag_api.routes.models.clear_embedding_backends", _clear)
    monkeypatch.setattr(
        "rag_api.routes.models._run_ollama_command",
        lambda *args, **kwargs: "{}" if args[1] == "show" else "",
    )

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
async def test_update_model_defaults_persists(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"
    settings.ollama_llm_model = "llama3"
    settings.ollama_embedding_model = "nomic-embed"
    settings.postgres_dsn = "postgresql+psycopg://user:pass@localhost/db"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    cleared = {"value": False}

    monkeypatch.setattr(
        "rag_api.routes.models.clear_embedding_backends",
        lambda: cleared.__setitem__("value", True),
    )

    captured: dict[str, tuple[str | None, str | None]] = {}

    def _fake_upsert(s, *, chat_model=None, embedding_model=None, provider="ollama"):
        captured["values"] = (chat_model, embedding_model)
        return {"chat_model": "persisted-chat", "embedding_model": "persisted-embed"}

    monkeypatch.setattr("rag_api.routes.models.upsert_model_preferences", _fake_upsert)
    monkeypatch.setattr(
        "rag_api.routes.models._run_ollama_command",
        lambda *args, **kwargs: "{}" if args[1] == "show" else "",
    )

    async with _client(settings) as client:
        response = await client.patch(
            "/api/v1/models/defaults",
            json={"chat_model": "llama3.1", "embedding_model": "text-embed"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["chat_model"] == "persisted-chat"
    assert body["embedding_model"] == "persisted-embed"
    assert captured["values"] == ("llama3.1", "text-embed")
    assert settings.ollama_llm_model == "persisted-chat"
    assert settings.ollama_embedding_model == "persisted-embed"
    assert cleared["value"] is True


@pytest.mark.asyncio
async def test_update_model_defaults_rejects_missing_model(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    def _fake_run(*args, **kwargs):  # noqa: ANN001
        if args[1] == "show":
            raise HTTPException(status_code=502, detail="model not found")
        return ""

    monkeypatch.setattr("rag_api.routes.models._run_ollama_command", _fake_run)

    async with _client(settings) as client:
        response = await client.patch(
            "/api/v1/models/defaults",
            json={"chat_model": "llama3.1"},
        )

    assert response.status_code == 404
    assert "not installed" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_update_model_defaults_requires_payload(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    async with _client(settings) as client:
        response = await client.patch("/api/v1/models/defaults", json={})

    assert response.status_code == 400
    assert "Provide" in response.text


@pytest.mark.asyncio
async def test_get_model_defaults(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"
    settings.ollama_llm_model = "llama3"
    settings.ollama_embedding_model = "nomic-embed"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    async with _client(settings) as client:
        response = await client.get("/api/v1/models/defaults")

    assert response.status_code == 200
    body = response.json()
    assert body["chat_model"] == "llama3"
    assert body["embedding_model"] == "nomic-embed"
