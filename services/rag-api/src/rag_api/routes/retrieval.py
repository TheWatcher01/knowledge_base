"""Retrieval ingestion endpoints compatible with Open WebUI semantics."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ..config import Settings, get_settings
from ..dependencies.auth import verify_bearer_token

router = APIRouter(tags=["retrieval"], dependencies=[Depends(verify_bearer_token)])


class TextIngestRequest(BaseModel):
    """Payload for ingesting plain text documents."""

    name: str = Field(..., description="Document identifier (e.g. prisma document id).")
    content: str = Field(..., description="Document text content.")
    collection_name: str = Field(..., description="Target vector collection.")


class WebIngestRequest(BaseModel):
    """Payload for triggering a web ingestion job."""

    url: str
    collection_name: str


class DeleteRequest(BaseModel):
    """Payload for removing a document from a collection."""

    collection_name: str
    file_id: str


class IngestResponse(BaseModel):
    """Minimal ingestion acknowledgement."""

    accepted: bool = True
    queued_at: datetime = Field(default_factory=datetime.utcnow)
    message: str | None = None


class DeleteResponse(BaseModel):
    """Minimal deletion acknowledgement."""

    deleted: bool = True
    message: str | None = None


@router.post("/retrieval/process/text", response_model=IngestResponse, summary="Ingest plain text")
async def ingest_text(
    payload: TextIngestRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> IngestResponse:
    """
    Store text ingestion requests for later processing.

    This is a synchronous acknowledgement; actual embedding will be wired in a
    background worker in later iterations.
    """

    _ensure_collection_configured(settings)
    # TODO: enqueue ingestion job (LangChain/LlamaIndex pipeline).
    return IngestResponse(message=f"Text ingestion queued for {payload.name}.")


@router.post("/retrieval/process/web", response_model=IngestResponse, summary="Ingest URL")
async def ingest_web(
    payload: WebIngestRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> IngestResponse:
    """Trigger scraping + embedding for a URL."""

    _ensure_collection_configured(settings)
    # TODO: enqueue web ingestion job leveraging SearxNG & Tika.
    return IngestResponse(message=f"Web ingestion queued for {payload.url}.")


@router.post("/retrieval/delete", response_model=DeleteResponse, summary="Delete document")
async def delete_document(
    payload: DeleteRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> DeleteResponse:
    """Remove a document from the configured vector store."""

    _ensure_collection_configured(settings)
    # TODO: delete vectors + metadata using LangChain/LlamaIndex APIs.
    return DeleteResponse(message=f"Deletion accepted for {payload.file_id}.")


def _ensure_collection_configured(settings: Settings) -> None:
    """Raise if compulsory services are missing."""

    if settings.ollama_base_url is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama service not configured.",
        )

    if settings.postgres_dsn is None and settings.mongo_uri is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No persistence backend configured.",
        )
