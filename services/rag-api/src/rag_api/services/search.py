"""Wrappers for SearxNG web search."""

from __future__ import annotations

from typing import Any, Dict, List

import asyncio

from ..config import Settings as AppSettings
from ..tools.searx import create_searx_wrapper


class SearchNotConfigured(Exception):
    """Raised when SearxNG is not configured."""


async def search_web(
    settings: AppSettings,
    query: str,
    *,
    max_results: int = 5,
) -> List[Dict[str, Any]]:
    """Perform a web search using SearxNG (via LangChain wrapper)."""

    if not settings.searxng_base_url:
        raise SearchNotConfigured("SearxNG not configured (RAG_SEARXNG_BASE_URL missing)")

    wrapper = create_searx_wrapper(host=settings.searxng_base_url, num_results=max_results)

    def _run() -> List[Dict[str, Any]]:
        raw = wrapper.run(query)
        if isinstance(raw, str):
            return [{"title": None, "content": raw, "url": None}]
        if isinstance(raw, list):
            return raw  # langchain already returns structured list
        return []

    results = await asyncio.to_thread(_run)

    simplified: List[Dict[str, Any]] = []
    for item in results[:max_results]:
        if isinstance(item, dict):
            simplified.append(
                {
                    "title": item.get("title"),
                    "content": item.get("content") or item.get("snippet"),
                    "url": item.get("url"),
                }
            )
    return simplified
