"""Search endpoints (SearxNG realtime integration)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..config import Settings, get_settings
from ..dependencies.auth import verify_bearer_token
from ..rate_limit import limit_dependency
from ..services.search import SearchNotConfigured, search_web

router = APIRouter(tags=["search"], dependencies=[Depends(verify_bearer_token)])

search_limit = limit_dependency("30/minute")


class WebSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Texte de la requête utilisateur")
    max_results: int = Field(default=3, ge=1, le=10, description="Nombre maximum de résultats SearxNG")


class WebSearchItem(BaseModel):
    title: str | None = None
    content: str | None = None
    url: str | None = None


class WebSearchResponse(BaseModel):
    results: list[WebSearchItem]


@router.post("/search/web", summary="Recherche SearxNG", dependencies=[Depends(search_limit)])
async def web_search(
    payload: WebSearchRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> WebSearchResponse:
    try:
        results_raw = await search_web(settings, payload.query, max_results=payload.max_results)
    except SearchNotConfigured as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    items = [WebSearchItem(**item) for item in results_raw]
    return WebSearchResponse(results=items)
