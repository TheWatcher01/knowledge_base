"""Retrieval ingestion endpoints for the RAG service."""

from __future__ import annotations

import asyncio
import hashlib
import logging
from datetime import datetime
from typing import Annotated, Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field

from ..config import Settings, get_settings
from ..dependencies.auth import verify_bearer_token
from ..services.ingestion import delete_document as delete_document_from_store
from ..services.ingestion import ingest_text as ingest_text_into_store
from ..services.retrieval import query_documents
from ..services.web_ingestion import WebIngestionError, ingest_url_document

LOGGER = logging.getLogger(__name__)

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
    document_id: str | None = Field(default=None, description="Optional document identifier")


class QueryRequest(BaseModel):
    """Payload for querying a collection."""

    query: str
    collection_name: str
    k: int = Field(default=5, ge=1, le=50)


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


class RetrievedDocument(BaseModel):
    text: str
    score: float | None = None
    metadata: Dict[str, Any] | None = None


class QueryResponse(BaseModel):
    docs: List[RetrievedDocument]


@router.post("/retrieval/process/text", response_model=IngestResponse, summary="Ingest plain text")
async def ingest_text(
    payload: TextIngestRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> IngestResponse:
    """Embed the supplied text content into the vector store."""

    _ensure_collection_configured(settings)

    kb_id = _extract_kb_id(payload.collection_name)

    try:
        await run_in_threadpool(
            ingest_text_into_store,
            settings,
            kb_id=kb_id or "unknown",
            document_id=payload.name,
            content=payload.content,
            collection_name=payload.collection_name,
            metadata={
                "ingest_method": "text",
                "original_name": payload.name,
            },
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - unexpected ingestion failure
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    return IngestResponse(
        accepted=True,
        message=f"Text ingested for document {payload.name}.",
    )


@router.post("/retrieval/process/web", response_model=IngestResponse, summary="Ingest URL")
async def ingest_web(
    payload: WebIngestRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> IngestResponse:
    """Trigger scraping + embedding for a URL."""

    _ensure_collection_configured(settings)

    kb_id = _extract_kb_id(payload.collection_name) or "unknown"
    document_id = payload.document_id or _hash_document_id(payload.url)

    async def _task() -> None:
        try:
            await ingest_url_document(
                settings,
                kb_id=kb_id,
                document_id=document_id,
                url=payload.url,
                collection_name=payload.collection_name,
                ingest_text_fn=ingest_text_into_store,
            )
        except WebIngestionError as exc:
            LOGGER.warning("[retrieval] web ingestion failed for %s: %s", payload.url, exc)
        except Exception as exc:  # pragma: no cover
            LOGGER.exception("[retrieval] unexpected failure during web ingestion: %s", exc)

    asyncio.create_task(_task())

    return IngestResponse(message=f"Web ingestion queued for {payload.url}.")


@router.post("/retrieval/delete", response_model=DeleteResponse, summary="Delete document")
async def delete_document(
    payload: DeleteRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> DeleteResponse:
    """Remove a document from the configured vector store."""

    _ensure_collection_configured(settings)

    try:
        await run_in_threadpool(
            delete_document_from_store,
            settings,
            document_id=payload.file_id,
            collection_name=payload.collection_name,
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    return DeleteResponse(message=f"Deleted document {payload.file_id}.")


@router.post("/retrieval/query/doc", response_model=QueryResponse, summary="Query collection")
async def query_collection(
    payload: QueryRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> QueryResponse:
    """Return the most relevant documents for the supplied query."""

    _ensure_collection_configured(settings)

    try:
        docs = await run_in_threadpool(
            query_documents,
            settings,
            collection_name=payload.collection_name,
            query=payload.query,
            limit=payload.k,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    return QueryResponse(docs=docs)


def _ensure_collection_configured(settings: Settings) -> None:
    """Raise if compulsory services are missing."""

    if settings.ollama_base_url is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama service not configured.",
        )

    if settings.postgres_dsn is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Postgres vector store not configured.",
        )


def _extract_kb_id(collection_name: str) -> str | None:
    if collection_name.startswith("kb_") and len(collection_name) > 3:
        return collection_name[3:]
    return None


def _hash_document_id(url: str) -> str:
    return "url_" + hashlib.sha1(url.encode("utf-8", "ignore")).hexdigest()
