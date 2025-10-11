from __future__ import annotations

import asyncio
from typing import Any

import httpx
import pytest

from rag_api.services.web_ingestion import (
    WebIngestionError,
    extract_text_with_tika,
    fetch_url_content,
)


class _FailingClient:
    def __init__(self, *, error: Exception | None = None, response: Any | None = None):
        self.error = error
        self.response = response
        self.calls = 0

    async def __aenter__(self) -> "_FailingClient":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> bool:
        return False

    async def get(self, *args, **kwargs):
        self.calls += 1
        if self.error:
            raise self.error
        return self.response

    async def put(self, *args, **kwargs):
        self.calls += 1
        if self.error:
            raise self.error
        return self.response


class _DummyResponse:
    def __init__(self, *, status_code: int = 200, text: str = "", content: bytes = b"", url: str = "https://example.com", headers: dict[str, str] | None = None):
        self.status_code = status_code
        self.text = text
        self.content = content
        self.headers = headers or {"content-type": "text/html"}
        self.url = url

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("error", request=None, response=None)


@pytest.mark.asyncio
async def test_fetch_url_content_retries_then_succeeds(monkeypatch):
    attempts = 0

    def fake_async_client(*args, **kwargs):  # noqa: ANN001
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            return _FailingClient(error=httpx.HTTPError("boom"))
        return _FailingClient(response=_DummyResponse(content=b"<html></html>"))

    monkeypatch.setattr("rag_api.services.web_ingestion.httpx.AsyncClient", fake_async_client)

    content, final_url, content_type = await fetch_url_content("https://example.com", retries=1)

    assert content == b"<html></html>"
    assert final_url == "https://example.com"
    assert content_type == "text/html"


@pytest.mark.asyncio
async def test_extract_text_with_tika_fallback(monkeypatch):
    def fake_async_client(*args, **kwargs):  # noqa: ANN001
        return _FailingClient(error=httpx.HTTPError("tika down"))

    monkeypatch.setattr("rag_api.services.web_ingestion.httpx.AsyncClient", fake_async_client)

    settings = type("Settings", (), {"tika_base_url": "http://tika:9998"})()

    text = await extract_text_with_tika(
        settings,
        html_bytes=b"<html><head><title>Example</title></head><body><p>Hello world</p></body></html>",
        content_type="text/html",
        allow_plaintext_fallback=True,
        retries=1,
    )

    assert text == "Example Hello world"


@pytest.mark.asyncio
async def test_extract_text_with_tika_raises_without_fallback(monkeypatch):
    def fake_async_client(*args, **kwargs):  # noqa: ANN001
        return _FailingClient(error=httpx.HTTPError("tika down"))

    monkeypatch.setattr("rag_api.services.web_ingestion.httpx.AsyncClient", fake_async_client)

    settings = type("Settings", (), {"tika_base_url": "http://tika:9998"})()

    with pytest.raises(WebIngestionError):
        await extract_text_with_tika(
            settings,
            html_bytes=b"<html><body>fallback disabled</body></html>",
            content_type="text/html",
            allow_plaintext_fallback=False,
            retries=0,
    )
