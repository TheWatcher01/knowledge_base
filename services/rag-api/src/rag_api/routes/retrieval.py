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
from ..rate_limit import limit_dependency
from ..services.ingestion import delete_document as delete_document_from_store
from ..services.ingestion import ingest_text as ingest_text_into_store
from ..logging import logger
from ..services.jobs import (
    count_active_jobs,
    create_job,
    get_job,
    get_latest_job,
    list_jobs,
    mark_job_failed,
)
from ..services.persistence import get_url_status, update_url_status
from ..services.retrieval import query_documents
from ..pipelines.web import UrlPipelineTask, run_pipeline

log = logger("retrieval")

router = APIRouter(tags=["retrieval"], dependencies=[Depends(verify_bearer_token)])

text_ingest_limit = limit_dependency("5/minute")
web_ingest_limit = limit_dependency("3/minute")
delete_limit = limit_dependency("10/minute")
query_limit = limit_dependency("60/minute")


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
    rerank_model: str | None = Field(default=None, max_length=120)


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


class IngestionStatusResponse(BaseModel):
    document_id: str
    status: str
    updated_at: str | None = None


@router.post(
    "/retrieval/process/text",
    response_model=IngestResponse,
    summary="Ingest plain text",
    dependencies=[Depends(text_ingest_limit)],
)
async def ingest_text(
    payload: TextIngestRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> IngestResponse:
    """Embed the supplied text content into the vector store."""

    _ensure_collection_configured(settings)

    kb_id = _extract_kb_id(payload.collection_name)

    if len(payload.content) > settings.max_text_chars:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Text payload exceeds allowed size.",
        )

    payload_size = len(payload.model_dump_json().encode("utf-8"))
    if payload_size > settings.max_json_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Ingestion payload too large.",
        )

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


@router.post(
    "/retrieval/process/web",
    response_model=IngestResponse,
    summary="Ingest URL",
    dependencies=[Depends(web_ingest_limit)],
)
async def ingest_web(
    payload: WebIngestRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> IngestResponse:
    """Trigger scraping + embedding for a URL."""

    _ensure_collection_configured(settings)

    kb_id = _extract_kb_id(payload.collection_name) or "unknown"
    document_id = payload.document_id or _hash_document_id(payload.url)

    payload_size = len(payload.model_dump_json().encode("utf-8"))
    if payload_size > settings.max_json_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Ingestion payload too large.",
        )

    active_jobs = count_active_jobs(settings, kb_id=kb_id if kb_id != "unknown" else None)
    if active_jobs >= settings.max_concurrent_jobs:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Web ingestion queue is full. Try again later.",
        )

    job_id, created = create_job(settings, document_id, url=payload.url)

    if not created:
        return IngestResponse(message=f"A job is already running for {payload.url}.")

    update_url_status(settings, document_id, "queued")

    async def _task() -> None:
        try:
            results = await run_pipeline(
                settings,
                [
                    UrlPipelineTask(
                        url=payload.url,
                        collection_name=payload.collection_name,
                        kb_id=kb_id,
                        document_id=document_id,
                        job_id=job_id,
                    )
                ],
                ingest_text_fn=ingest_text_into_store,
            )

            for result in results:
                if result.status == "error":
                    log.warning(
                        "retrieval.web_ingestion_failed",
                        url=result.url,
                        error=result.error,
                    )
        except Exception as exc:  # pragma: no cover
            log.exception("retrieval.web_ingestion_unexpected_error", url=payload.url, error=str(exc))
            mark_job_failed(settings, job_id, str(exc))
            update_url_status(settings, document_id, "error")

    asyncio.create_task(_task())

    return IngestResponse(message=f"Web ingestion queued for {payload.url}.")


@router.post(
    "/retrieval/delete",
    response_model=DeleteResponse,
    summary="Delete document",
    dependencies=[Depends(delete_limit)],
)
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


@router.post(
    "/retrieval/query/doc",
    response_model=QueryResponse,
    summary="Query collection",
    dependencies=[Depends(query_limit)],
)
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
            rerank_model=payload.rerank_model,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    return QueryResponse(docs=docs)


@router.get("/retrieval/status/{document_id}", response_model=IngestionStatusResponse, summary="Get ingestion status")
async def get_ingestion_status(document_id: str, settings: Annotated[Settings, Depends(get_settings)]) -> IngestionStatusResponse:
    job = get_latest_job(settings, document_id)
    if job:
        return IngestionStatusResponse(
            document_id=document_id,
            status=job.get("status", "unknown"),
            updated_at=job.get("updated_at"),
        )

    data = get_url_status(settings, document_id)
    if data:
        return IngestionStatusResponse(
            document_id=document_id,
            status=data.get("status", "unknown"),
            updated_at=data.get("updated_at"),
        )

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown document")


class UrlIngestionJob(BaseModel):
    id: str
    document_id: str
    kb_id: str
    status: str
    queued_at: str | None = None
    started_at: str | None = None
    finished_at: str | None = None
    error_message: str | None = None
    metadata: Dict[str, Any] | None = None
    updated_at: str | None = None
    url: str | None = None
    url_status: str | None = None
    url_updated_at: str | None = None
    document_title: str | None = None


class JobListResponse(BaseModel):
    jobs: List[UrlIngestionJob]


@router.get("/retrieval/jobs", response_model=JobListResponse, summary="List ingestion jobs")
async def list_ingestion_jobs(
    settings: Annotated[Settings, Depends(get_settings)],
    document_id: str | None = None,
    kb_id: str | None = None,
    limit: int = 20,
) -> JobListResponse:
    try:
        jobs = list_jobs(settings, document_id=document_id, kb_id=kb_id, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return JobListResponse(jobs=jobs)


@router.get("/retrieval/jobs/{job_id}", response_model=UrlIngestionJob, summary="Get ingestion job")
async def get_ingestion_job(job_id: str, settings: Annotated[Settings, Depends(get_settings)]) -> UrlIngestionJob:
    job = get_job(settings, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    return UrlIngestionJob(**job)


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
        return collection_name[3:].replace("_", "-")
    return None


def _hash_document_id(url: str) -> str:
    return "url_" + hashlib.sha1(url.encode("utf-8", "ignore")).hexdigest()
