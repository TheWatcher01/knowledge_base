"""Helpers for interacting with OpenRouter-hosted providers."""

from __future__ import annotations

from typing import AsyncIterator, Dict, Iterable, List, Optional

import httpx

from ..config import Settings
from ..logging import logger

log = logger("openrouter")

_DEFAULT_BASE_URL = "https://openrouter.ai/api/v1"


def is_enabled(settings: Settings) -> bool:
    """Return True when OpenRouter integration is properly configured."""
    return bool(settings.openrouter_api_key)


def _headers(settings: Settings) -> Dict[str, str]:
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    if settings.openrouter_site_url:
        headers["HTTP-Referer"] = str(settings.openrouter_site_url)
    if settings.openrouter_app_name:
        headers["X-Title"] = settings.openrouter_app_name
    return headers


def rerank_documents(
    settings: Settings,
    *,
    query: str,
    documents: List[Dict[str, object]],
    model_name: Optional[str] = None,
) -> List[Dict[str, object]]:
    """Rerank documents using OpenRouter when a model is provided."""

    if not settings.openrouter_api_key:
        return documents

    target_model = model_name or settings.openrouter_rerank_model
    if not target_model:
        return documents

    base_url = str(settings.openrouter_api_url or _DEFAULT_BASE_URL).rstrip("/")
    url = f"{base_url}/rerank"

    inputs: List[str] = []
    mapping: List[tuple[int, Dict[str, object]]] = []

    for index, doc in enumerate(documents):
        text = doc.get("text")
        if not isinstance(text, str) or not text.strip():
            continue
        inputs.append(text)
        mapping.append((index, doc))

    if len(inputs) < 2:
        return documents

    payload = {
        "model": target_model,
        "input": inputs,
        "query": query,
    }

    try:
        response = httpx.post(
            url,
            headers=_headers(settings),
            json=payload,
            timeout=settings.openrouter_timeout_seconds,
        )
        response.raise_for_status()
        data = response.json()
    except Exception as exc:  # pragma: no cover - network errors
        log.warning("openrouter.rerank_failed", error=str(exc), model=target_model)
        return documents

    results = data.get("results")
    if not isinstance(results, list):
        log.warning("openrouter.rerank_invalid_response", payload=data, model=target_model)
        return documents

    reordered: List[Dict[str, object]] = []
    seen = set()

    for item in results:
        if not isinstance(item, dict):
            continue
        index = item.get("index")
        if not isinstance(index, int) or index < 0 or index >= len(mapping):
            continue
        _, doc = mapping[index]
        doc_id = id(doc)
        if doc_id in seen:
            continue
        reordered.append(doc)
        seen.add(doc_id)

    # Append any documents that were skipped or had empty text
    for original_index, doc in mapping:
        doc_id = id(doc)
        if doc_id not in seen:
            reordered.append(doc)
            seen.add(doc_id)

    for doc in documents:
        doc_id = id(doc)
        if doc_id not in seen:
            reordered.append(doc)
            seen.add(doc_id)

    return reordered


async def stream_chat_completions(
    settings: Settings,
    *,
    model: str,
    messages: Iterable[Dict[str, str]],
) -> AsyncIterator[bytes]:
    """Yield raw SSE chunks from OpenRouter chat completions."""

    if not settings.openrouter_api_key:
        raise RuntimeError("OpenRouter API key is not configured")

    base_url = str(settings.openrouter_api_url or _DEFAULT_BASE_URL).rstrip("/")
    url = f"{base_url}/chat/completions"
    payload = {
        "model": model,
        "stream": True,
        "messages": list(messages),
    }

    timeout = httpx.Timeout(
        settings.openrouter_timeout_seconds,
        connect=settings.openrouter_timeout_seconds,
        read=None,
        write=settings.openrouter_timeout_seconds,
    )

    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream(
            "POST",
            url,
            headers=_headers(settings),
            json=payload,
        ) as response:
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:  # pragma: no cover - defensive
                detail = exc.response.text if exc.response is not None else str(exc)
                log.warning(
                    "openrouter.chat_request_failed",
                    status=exc.response.status_code if exc.response else None,
                    detail=detail,
                )
                raise

            async for chunk in response.aiter_bytes():
                if not chunk:
                    continue
                yield chunk
