"""Wrappers for SearxNG web search."""

from __future__ import annotations

from typing import Any, Dict, List

import httpx

from ..config import Settings as AppSettings


class SearchNotConfigured(Exception):
    """Raised when SearxNG is not configured."""


async def search_web(settings: AppSettings, query: str, *, timeout: float = 15.0, max_results: int = 5) -> List[Dict[str, Any]]:
    """Perform a web search using SearxNG and return the results."""

    if not settings.searxng_base_url:
        raise SearchNotConfigured("SearxNG not configured (RAG_SEARXNG_BASE_URL missing)")

    url = settings.searxng_base_url
    params = {
        "q": query,
        "format": "json",
        "safesearch": 1,
        "engines": "general",
        "language": "fr",
    }

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        payload = response.json()

    results = payload.get("results", []) if isinstance(payload, dict) else []
    if not isinstance(results, list):
        return []

    simplified: List[Dict[str, Any]] = []
    for result in results[:max_results]:
        if not isinstance(result, dict):
            continue
        simplified.append(
            {
                "title": result.get("title"),
                "content": result.get("content"),
                "url": result.get("url"),
            }
        )

    return simplified

