"""Rate limiting configuration for the RAG API service."""

from __future__ import annotations

from typing import Callable

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def _key_from_request(request: Request) -> str:
    """Derive a rate-limit key from the bearer token or client IP."""

    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.removeprefix("Bearer ").strip()
        if token:
            return token

    if request.client and request.client.host:
        return request.client.host

    return get_remote_address(request)


limiter = Limiter(
    key_func=_key_from_request,
    storage_uri="memory://",
)


def configure_default_limits(limit: str | None) -> None:
    """Update the default rate limits applied to the application."""

    if limit:
        limiter.default_limits = [limit]
    else:
        limiter.default_limits = []


def limit_dependency(limit: str) -> Callable[[Request], None]:
    """Return a dependency callable enforcing the provided limit."""

    @limiter.limit(limit)
    async def _dependency(request: Request) -> None:  # pragma: no cover - decorated
        return None

    return _dependency
