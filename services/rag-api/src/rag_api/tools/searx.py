"""LangChain utility wrappers for our SearxNG instance."""

from __future__ import annotations

from typing import Any

import httpx
from langchain_community.utilities import SearxSearchWrapper
from langchain_community.tools.searx_search.tool import SearxSearchResults

DEFAULT_HOST = "http://searxng:8080"


def _normalise_host(host: str) -> str:
    host = host.rstrip("/")
    if host.endswith("/search"):
        host = host[: -len("/search")]
    return host


def create_searx_wrapper(
    *,
    host: str = DEFAULT_HOST,
    engines: list[str] | None = None,
    num_results: int = 5,
) -> SearxSearchWrapper:
    """Return a Searx search wrapper configured for the Compose stack."""

    normalised = _normalise_host(host)
    kwargs: dict[str, Any] = {"searx_host": normalised, "num_results": num_results}
    if engines:
        kwargs["engines"] = engines

    wrapper = SearxSearchWrapper(**kwargs)

    # Best-effort connectivity hint – swallow errors to keep the tool usable offline.
    try:
        with httpx.Client(timeout=3.0) as client:
            client.get(f"{normalised}/search")
    except httpx.HTTPError:
        pass

    return wrapper


def create_searx_tool(
    *,
    host: str = DEFAULT_HOST,
    engines: list[str] | None = None,
    num_results: int = 5,
    name: str = "searx-search",
    description: str | None = None,
) -> SearxSearchResults:
    """Build a LangChain Tool wrapping SearxNG results."""

    wrapper = create_searx_wrapper(host=host, engines=engines, num_results=num_results)
    tool_kwargs: dict[str, Any] = {"wrapper": wrapper}
    if engines:
        tool_kwargs["kwargs"] = {"engines": engines}
    if description is None:
        description = (
            "Perform a metasearch via SearxNG. Useful for retrieving fresh web snippets."
        )

    return SearxSearchResults(name=name, description=description, **tool_kwargs)
