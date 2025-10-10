from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Callable

import httpx
import pytest
import pytest_asyncio

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


def _build_settings() -> Settings:
    get_settings.cache_clear()
    return Settings()


@asynccontextmanager
async def _client_for_settings(settings: Settings) -> AsyncIterator[httpx.AsyncClient]:
    app = create_app(settings)
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.fixture
def client_factory(monkeypatch) -> Callable[..., AsyncIterator[httpx.AsyncClient]]:
    @asynccontextmanager
    async def _factory(**overrides: str) -> AsyncIterator[httpx.AsyncClient]:
        for key, value in BASE_ENV.items():
            monkeypatch.setenv(key, value)
        for key, value in overrides.items():
            monkeypatch.setenv(key, value)

        settings = _build_settings()

        async with _client_for_settings(settings) as client:
            yield client

    return _factory


@pytest_asyncio.fixture
async def client(client_factory: Callable[..., AsyncIterator[httpx.AsyncClient]]):
    async with client_factory() as instance:
        yield instance


@pytest.mark.asyncio
async def test_text_ingestion_rejects_large_payload(client):
    response = await client.post(
        "/api/v1/retrieval/process/text",
        json={
            "name": "doc-1",
            "content": "x" * 25_000,
            "collection_name": "kb_123",
        },
    )

    assert response.status_code == 413
    assert "payload" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_web_ingestion_rejects_when_queue_full(monkeypatch, client_factory):
    async with client_factory(RAG_MAX_CONCURRENT_JOBS="1") as test_client:
        monkeypatch.setattr(
            "rag_api.routes.retrieval.count_active_jobs",
            lambda settings, kb_id=None: settings.max_concurrent_jobs,
        )
        called = {}

        def _unexpected(*args, **kwargs):
            called.setdefault("create_job", True)
            raise AssertionError("create_job should not be called when queue is full")

        monkeypatch.setattr("rag_api.routes.retrieval.create_job", _unexpected)

        response = await test_client.post(
            "/api/v1/retrieval/process/web",
            json={
                "url": "https://example.com",
                "collection_name": "kb_123",
            },
        )

    assert response.status_code == 429
    assert "queue" in response.json()["detail"].lower()
    assert "create_job" not in called


@pytest.mark.asyncio
async def test_list_jobs_success(monkeypatch, client):
    monkeypatch.setattr(
        "rag_api.routes.retrieval.list_jobs",
        lambda settings, document_id=None, kb_id=None, limit=20: [
            {
                "id": "job-1",
                "document_id": "doc-1",
                "kb_id": "kb-1",
                "status": "queued",
                "queued_at": "2024-01-01T00:00:00Z",
                "started_at": None,
                "finished_at": None,
                "error_message": None,
                "metadata": None,
                "updated_at": "2024-01-01T00:00:01Z",
                "url": "https://example.com",
                "url_status": "queued",
                "url_updated_at": "2024-01-01T00:00:01Z",
                "document_title": "Example",
            }
        ],
    )

    response = await client.get("/api/v1/retrieval/jobs?document_id=doc-1")

    assert response.status_code == 200
    data = response.json()
    assert data["jobs"][0]["id"] == "job-1"


@pytest.mark.asyncio
async def test_get_job_not_found(monkeypatch, client):
    monkeypatch.setattr("rag_api.routes.retrieval.get_job", lambda settings, job_id: None)

    response = await client.get("/api/v1/retrieval/jobs/unknown")

    assert response.status_code == 404
