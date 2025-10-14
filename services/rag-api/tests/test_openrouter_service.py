from __future__ import annotations

import json

import httpx
import pytest

from rag_api.config import Settings
from rag_api.services.openrouter import rerank_documents


def _settings(**overrides) -> Settings:
    base = dict(
        environment="test",
        server_host="0.0.0.0",
        server_port=8000,
        openrouter_api_key="sk-test",
        openrouter_rerank_model="cohere/rerank-english-v3.0",
        openrouter_api_url="https://openrouter.ai/api/v1",
    )
    base.update(overrides)
    return Settings(**base)


def test_rerank_documents_orders_results(monkeypatch):
    called = {}

    def fake_post(url, headers, json, timeout):
        called["url"] = url
        called["headers"] = headers
        called["json"] = json

        class _Response:
            status_code = 200

            def raise_for_status(self):
                pass

            def json(self):
                return {"results": [{"index": 1}, {"index": 0}]}

        return _Response()

    monkeypatch.setattr(httpx, "post", fake_post)

    settings = _settings(openrouter_site_url="http://localhost:3001")

    docs = [
        {"text": "Premier document", "score": 0.9},
        {"text": "Second document", "score": 0.8},
    ]

    reranked = rerank_documents(settings, query="test", documents=docs)

    assert reranked[0]["text"] == "Second document"
    assert called["headers"]["HTTP-Referer"].rstrip("/") == "http://localhost:3001"
    assert called["json"]["model"] == "cohere/rerank-english-v3.0"
    assert called["json"]["input"][0] == "Premier document"


def test_rerank_skips_when_config_missing(monkeypatch):
    called = False

    def fake_post(*args, **kwargs):
        nonlocal called
        called = True
        raise AssertionError("Should not be called")

    monkeypatch.setattr(httpx, "post", fake_post)

    settings = _settings(openrouter_api_key=None)

    docs = [{"text": "Doc"}]
    result = rerank_documents(settings, query="q", documents=docs)

    assert result == docs
    assert called is False
