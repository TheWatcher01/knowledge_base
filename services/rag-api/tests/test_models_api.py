from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

import httpx
import pytest
from fastapi import HTTPException

from rag_api.api import create_app
from rag_api.config import Settings
from rag_api.dependencies.auth import verify_bearer_token


@asynccontextmanager
async def _client(settings: Settings) -> AsyncIterator[httpx.AsyncClient]:
    settings.auth_token = None
    app = create_app(settings)
    app.dependency_overrides[verify_bearer_token] = lambda: None
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

    async def _fake_ollama_json(settings, method, path, json_body=None, timeout=60.0):  # noqa: ANN001
        return [{"name": "llama3.1:8b", "size": "4.7 GB", "modified_at": "2024-10-01"}]

    monkeypatch.setattr("rag_api.routes.models._ollama_json", _fake_ollama_json)

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
async def test_pull_model_accepts_huggingface_names(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)
    monkeypatch.setattr(
        "rag_api.routes.models.create_model_job",
        lambda s, provider, model: {
            "id": "job-hf",
            "provider": provider,
            "model": model,
            "status": "queued",
        },
    )

    captured: dict[str, str] = {}

    def _fake_background(settings, job_id, model_name):  # noqa: ANN001
        captured["job_id"] = job_id
        captured["model"] = model_name
        return None

    monkeypatch.setattr("rag_api.routes.models._background_pull_job", _fake_background)

    async with _client(settings) as client:
        response = await client.post(
            "/api/v1/models/pull",
            json={"name": "https://huggingface.co/bigcode/starcoder2"},
        )

    assert response.status_code == 202
    assert captured["model"] == "hf.co/bigcode/starcoder2"
    assert captured["job_id"] == "job-hf"


@pytest.mark.asyncio
async def test_pull_model_without_persistence(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    async def _fake_fallback(settings, model_name):  # noqa: ANN001
        return {
            "id": "transient-test",
            "provider": "ollama",
            "model": model_name,
            "status": "succeeded",
            "summary": "done",
            "error": None,
            "queued_at": "2025-10-18T00:00:00Z",
            "started_at": "2025-10-18T00:00:00Z",
            "finished_at": "2025-10-18T00:00:01Z",
            "created_at": "2025-10-18T00:00:00Z",
            "updated_at": "2025-10-18T00:00:01Z",
        }

    def _raise(*_, **__):  # noqa: ANN001
        raise ValueError("no dsn")

    monkeypatch.setattr("rag_api.routes.models.create_model_job", _raise)
    monkeypatch.setattr("rag_api.routes.models._pull_without_persistence", _fake_fallback)

    async with _client(settings) as client:
        response = await client.post("/api/v1/models/pull", json={"name": "llama3.1:8b"})

    assert response.status_code == 202
    body = response.json()
    assert body["job"]["id"] == "transient-test"
    assert body["job"]["status"] == "succeeded"


@pytest.mark.asyncio
async def test_pull_model_rejects_invalid_name(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    async with _client(settings) as client:
        response = await client.post("/api/v1/models/pull", json={"name": "hf.co/"})

    assert response.status_code == 400
    assert "Invalid model name" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_model_success(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    class _Response:
        status_code = 200
        text = ""

        @staticmethod
        def raise_for_status():
            return None

    async def _fake_request(settings, method, path, json_body=None, timeout=60.0):  # noqa: ANN001
        return _Response()

    monkeypatch.setattr("rag_api.routes.models._ollama_request", _fake_request)

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
async def test_list_model_jobs_missing_persistence(monkeypatch):
    settings = _DummySettings()
    settings.ollama_base_url = "http://ollama:11434"

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    def _raise_value_error(*args, **kwargs):  # noqa: ANN001
        raise ValueError("Persistence disabled")

    monkeypatch.setattr("rag_api.routes.models.list_model_jobs", _raise_value_error)

    async with _client(settings) as client:
        response = await client.get("/api/v1/models/jobs")

    assert response.status_code == 200
    assert response.json()["jobs"] == []


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
    async def _noop(settings, model_name):  # noqa: ANN001
        return None

    monkeypatch.setattr("rag_api.routes.models._assert_model_installed", _noop)

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
    async def _noop(settings, model_name):  # noqa: ANN001
        return None

    monkeypatch.setattr("rag_api.routes.models._assert_model_installed", _noop)

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

    async def _raise(settings, model_name):  # noqa: ANN001
        raise HTTPException(status_code=404, detail="Model 'llama3.1' is not installed")

    monkeypatch.setattr("rag_api.routes.models._assert_model_installed", _raise)

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
    settings.postgres_dsn = None

    monkeypatch.setattr("rag_api.routes.models.get_settings", lambda: settings)

    async with _client(settings) as client:
        response = await client.get("/api/v1/models/defaults")

    assert response.status_code == 200
    body = response.json()
    assert body["chat_model"] == "llama3"
    assert body["embedding_model"] == "nomic-embed"
