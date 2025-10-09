"""Authentication helpers for validating client requests."""

from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status

from ..config import Settings, get_settings


def verify_bearer_token(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    """
    Validate the Authorization header when a shared token is configured.

    Mirrors the OWUI_TOKEN behaviour: if no token is configured we allow all
    requests, otherwise we expect a `Bearer <token>` header.
    """

    expected = settings.auth_token
    if expected is None:
        return

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token.",
        )

    token = authorization.removeprefix("Bearer ").strip()
    if token != expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized.",
        )
