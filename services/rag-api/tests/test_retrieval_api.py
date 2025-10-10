from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Callable

import pytest
import pytest_asyncio
import httpx
from httpx import AsyncClient

from rag_api.api import create_app
from rag_api.config import Settings, get_settings


BASE_ENV = {
    "RAG_OLLAMA_BASE_URL": "http://localhost",
    "RAG_POSTGRES_DSN": "postgresql+psycopg://kb:kb@postgres:5432/kb",
    "RAG_RATE_LIMIT": "120/minute",
    "RAG_MAX_TEXT_CHARS": "20000",
    "RAG_MAX_JSON_BYTES": "262144",
    "RAG_MAX_CONCURRENT_JOBS": "5",
}


def _build_settings_from_env() -> Settings:
    get_settings.cache_clear()
    return Settings()


@asynccontextmanager
async def _create_client(settings: Settings) -> AsyncIterator[AsyncClient]:
    app = create_app(settings)
    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.fixture
def client_factory(monkeypatch) -> Callable[..., AsyncIterator[AsyncClient]]:
    @asynccontextmanager
    async def _factory(**overrides: str) -> AsyncIterator[AsyncClient]:
        for key, value in BASE_ENV.items():
            monkeypatch.setenv(key, value)
        for key, value in overrides.items():
            monkeypatch.setenv(key, value)

        settings = _build_settings_from_env()

        async with _create_client(settings) as client:
            yield client

    return _factory


@pytest_asyncio.fixture
async def client(client_factory: Callable[..., AsyncIterator[AsyncClient]]):
    async with client_factory() as instance:
        yield instance


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_jobs_requires_filter(client: AsyncClient):
    response = await client.get("/api/v1/retrieval/jobs")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_list_jobs_success(monkeypatch, client: AsyncClient):
    captured: dict[str, Any] = {}

    def fake_list_jobs(settings, *, document_id=None, kb_id=None, limit=20):
        captured["document_id"] = document_id
        captured["kb_id"] = kb_id
        captured["limit"] = limit
        return [
            {
                "id": "job-1",
                "document_id": "doc-1",
                "kb_id": "kb-1",
                "status": "queued",
                "queued_at": "2024-01-01T00:00:00Z",
                "started_at": None,
                "finished_at": None,
                "error_message": None,
                "metadata": {"example": True},
                "updated_at": "2024-01-01T00:00:05Z",
                "url": "https://example.com",
                "url_status": "queued",
                "url_updated_at": "2024-01-01T00:00:04Z",
                "document_title": "Example",
            }
        ]

    monkeypatch.setattr("rag_api.routes.retrieval.list_jobs", fake_list_jobs)

    response = await client.get("/api/v1/retrieval/jobs?documentId=doc-1&limit=10")

    assert response.status_code == 200
    payload = response.json()
    assert payload["jobs"][0]["id"] == "job-1"
    assert captured == {"document_id": "doc-1", "kb_id": None, "limit": 10}


@pytest.mark.asyncio
async def test_get_job_not_found(monkeypatch, client: AsyncClient):
    monkeypatch.setattr("rag_api.routes.retrieval.get_job", lambda *args, **kwargs: None)

    response = await client.get("/api/v1/retrieval/jobs/job-404")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_job_success(monkeypatch, client: AsyncClient):
    def fake_get_job(settings, job_id):
        return {
            "id": job_id,
            "document_id": "doc-1",
            "kb_id": "kb-1",
            "status": "synced",
            "queued_at": "2024-01-01T00:00:00Z",
            "started_at": "2024-01-01T00:00:01Z",
            "finished_at": "2024-01-01T00:00:02Z",
            "error_message": None,
            "metadata": None,
            "updated_at": "2024-01-01T00:00:03Z",
            "url": "https://example.com",
            "url_status": "synced",
            "url_updated_at": "2024-01-01T00:00:03Z",
            "document_title": "Example",
        }

    monkeypatch.setattr("rag_api.routes.retrieval.get_job", fake_get_job)

    response = await client.get("/api/v1/retrieval/jobs/job-123")

    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == "job-123"
    assert payload["status"] == "synced"


@pytest.mark.asyncio
async def test_text_ingestion_payload_too_large(client_factory):
    async with client_factory(RAG_MAX_TEXT_CHARS="1024", RAG_MAX_JSON_BYTES="4096") as test_client:
        response = await test_client.post(
            "/api/v1/retrieval/process/text",
            json={
                "name": "doc",
                "content": "a" * 1500,
                "collection_name": "kb_test",
            },
        )

    assert response.status_code == 413
    assert "payload" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_web_ingestion_queue_full(monkeypatch, client_factory):
    async with client_factory(RAG_MAX_CONCURRENT_JOBS="1") as test_client:
        monkeypatch.setattr(
            "rag_api.routes.retrieval.count_active_jobs",
            lambda settings, kb_id=None: settings.max_concurrent_jobs,
        )

        response = await test_client.post(
            "/api/v1/retrieval/process/web",
            json={
                "url": "https://example.com",
                "collection_name": "kb_test",
                "document_id": "doc-1",
            },
        )

    assert response.status_code == 429, response.json()
    assert "queue" in response.json()["detail"].lower()
