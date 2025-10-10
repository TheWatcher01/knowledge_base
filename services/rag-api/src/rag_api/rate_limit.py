"""Rate limiting helpers for the RAG API service."""

from __future__ import annotations

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def _key_from_request(request: Request) -> str:
    """Return a stable identifier for throttling (Bearer token or client IP)."""

    authorization = request.headers.get("authorization")
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        if token:
            return token

    if request.client and request.client.host:
        return request.client.host

    return get_remote_address(request)


limiter = Limiter(key_func=_key_from_request, storage_uri="memory://")


def configure_default_limits(limit: str | None) -> None:
    """Configure default limits applied to all requests when enabled."""

    if limit:
        limiter.default_limits = [limit]
    else:
        limiter.default_limits = []


def limit_dependency(limit: str):
    """Create a dependency enforcing the provided rate limit."""

    @limiter.limit(limit)
    async def _dependency(request: Request) -> None:  # pragma: no cover - wrapped by SlowAPI
        return None

    return _dependency
