"""Helpers for fetching web content and extracting text via Tika."""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any, Dict, Tuple

import httpx

from ..config import Settings as AppSettings
from .search import SearchNotConfigured, search_web

LOGGER = logging.getLogger(__name__)

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)


class WebIngestionError(Exception):
    """Raised when web ingestion fails."""


async def fetch_url_content(
    url: str,
    *,
    timeout: float = 20.0,
    retries: int = 2,
    backoff_base: float = 0.5,
) -> Tuple[bytes, str, str | None]:
    """Fetch a URL and return raw bytes, final URL and content-type."""

    last_error: httpx.HTTPError | None = None

    for attempt in range(retries + 1):
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=timeout) as client:
                response = await client.get(url, headers={"User-Agent": DEFAULT_USER_AGENT})
                response.raise_for_status()
                content_type = response.headers.get("content-type")
                return response.content, str(response.url), content_type
        except httpx.HTTPError as exc:  # pragma: no cover - network failure
            last_error = exc
            LOGGER.warning(
                "web_ingestion.fetch_retry url=%s attempt=%s/%s error=%s",
                url,
                attempt + 1,
                retries,
                exc,
            )
            if attempt == retries:
                break
            await asyncio.sleep(backoff_base * (2 ** attempt))

    assert last_error is not None  # for mypy
    raise last_error


async def extract_text_with_tika(
    settings: AppSettings,
    *,
    html_bytes: bytes,
    content_type: str | None,
    timeout: float = 30.0,
    retries: int = 2,
    allow_plaintext_fallback: bool = True,
) -> str:
    """Extract plain text from HTML using the configured Tika server."""

    if not settings.tika_base_url:
        raise WebIngestionError("Tika server is not configured (RAG_TIKA_BASE_URL missing)")

    url = settings.tika_base_url.rstrip("/") + "/tika"
    headers = {
        "Accept": "text/plain",
        "Content-Type": content_type or "text/html; charset=utf-8",
    }

    last_error: httpx.HTTPError | None = None

    for attempt in range(retries + 1):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.put(url, headers=headers, content=html_bytes)
                response.raise_for_status()
                text = response.text
            return _normalize_text(text)
        except httpx.HTTPError as exc:  # pragma: no cover - network failure
            last_error = exc
            LOGGER.warning(
                "web_ingestion.tika_retry attempt=%s/%s error=%s",
                attempt + 1,
                retries,
                exc,
            )
            if attempt == retries:
                break
            await asyncio.sleep(0.5 * (attempt + 1))

    if allow_plaintext_fallback:
        LOGGER.warning("web_ingestion.tika_fallback error=%s", last_error)
        return _fallback_extract_text(html_bytes)

    assert last_error is not None
    raise WebIngestionError(f"Tika extraction failed after retries: {last_error}") from last_error


def extract_title(html_bytes: bytes) -> str | None:
    """Best-effort extraction of the HTML <title>."""

    try:
        html = html_bytes.decode("utf-8", errors="ignore")
    except Exception:  # pragma: no cover
        return None

    match = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return None

    title = _normalize_text(match.group(1))
    return title or None


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _fallback_extract_text(html_bytes: bytes) -> str:
    """Very small HTML → text fallback used when Tika is unavailable."""

    try:
        html = html_bytes.decode("utf-8", errors="ignore")
    except Exception:  # pragma: no cover
        return ""

    # Strip scripts/styles
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    # Remove all remaining tags
    text = re.sub(r"<[^>]+>", " ", html)
    return _normalize_text(text)


async def ingest_url_document(
    settings: AppSettings,
    *,
    kb_id: str,
    document_id: str,
    url: str,
    collection_name: str,
    ingest_text_fn,
) -> None:
    """Fetch, extract and ingest a web document into the vector store."""

    try:
        html_bytes, final_url, content_type = await fetch_url_content(url)
    except httpx.HTTPError as exc:  # pragma: no cover - network failure
        raise WebIngestionError(f"Failed to fetch URL {url}: {exc}") from exc

    title = extract_title(html_bytes)

    try:
        text = await extract_text_with_tika(
            settings,
            html_bytes=html_bytes,
            content_type=content_type,
        )
    except httpx.HTTPError as exc:  # pragma: no cover
        raise WebIngestionError(f"Tika extraction failed for {url}: {exc}") from exc

    if not text:
        raise WebIngestionError(f"No textual content extracted from {url}")

    metadata: Dict[str, Any] = {
        "ingest_method": "web",
        "source_url": final_url,
        "original_url": url,
        "content_type": content_type,
    }
    if title:
        metadata["title"] = title

    # Optionally enrich with search snippets for additional context
    search_snippets = []
    try:
        results = await search_web(settings, title or url, max_results=3)
        for item in results:
            snippet = item.get("content")
            if snippet:
                search_snippets.append(_normalize_text(snippet))
        if search_snippets:
            metadata["search_snippets"] = search_snippets
    except SearchNotConfigured:
        pass
    except httpx.HTTPError as exc:  # pragma: no cover
        LOGGER.warning("SearxNG lookup failed for %s: %s", url, exc)

    await asyncio.to_thread(
        ingest_text_fn,
        settings,
        kb_id=kb_id,
        document_id=document_id,
        content=text,
        collection_name=collection_name,
        metadata=metadata,
    )

    LOGGER.info("Ingested URL %s into collection %s", final_url, collection_name)
    return metadata
