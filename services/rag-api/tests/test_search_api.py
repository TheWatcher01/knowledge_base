from fastapi.testclient import TestClient

from rag_api.api import create_app
from rag_api.config import Settings, get_settings


def test_web_search_returns_results(monkeypatch):
    monkeypatch.setenv("RAG_AUTH_TOKEN", "")
    monkeypatch.setenv("RAG_SYNC_SERVICE_TOKEN", "")
    monkeypatch.delenv("RAG_SEARXNG_BASE_URL", raising=False)
    get_settings.cache_clear()
    settings = Settings(
        searxng_base_url="http://searxng",
        auth_token=None,
    )

    async def fake_search(_settings, query, max_results=5):
        assert query == "hello"
        assert max_results == 3
        return [
            {"title": "Title", "content": "Snippet", "url": "https://example.com"},
        ]

    monkeypatch.setattr("rag_api.routes.search.search_web", fake_search)

    app = create_app(settings)
    client = TestClient(app)

    response = client.post(
        "/api/v1/search/web",
        json={"query": "hello", "max_results": 3},
        headers={"Authorization": "Bearer anything"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["results"][0]["url"] == "https://example.com"


def test_web_search_requires_config(monkeypatch):
    monkeypatch.setenv("RAG_AUTH_TOKEN", "")
    monkeypatch.setenv("RAG_SYNC_SERVICE_TOKEN", "")
    monkeypatch.delenv("RAG_SEARXNG_BASE_URL", raising=False)
    get_settings.cache_clear()
    settings = Settings(searxng_base_url=None, auth_token=None)
    app = create_app(settings)
    client = TestClient(app)

    response = client.post("/api/v1/search/web", json={"query": "hello"})

    assert response.status_code == 503
