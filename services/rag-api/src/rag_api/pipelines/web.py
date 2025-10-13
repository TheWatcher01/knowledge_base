"""Web ingestion orchestration utilities."""

from __future__ import annotations

import asyncio
import hashlib
from dataclasses import dataclass
from typing import Any, Iterable, List

from ..config import Settings
from ..logging import logger
from ..services.ingestion import ingest_text as ingest_text_into_store
from ..services.jobs import create_job, mark_job_completed, mark_job_failed, mark_job_processing
from ..services.persistence import update_url_status
from ..services.search import SearchNotConfigured
from ..services.web_ingestion import (
    WebIngestionError,
    fetch_url_content,
    extract_text_with_tika,
    extract_title,
    ingest_url_document,
)
from ..tools.searx import create_searx_wrapper

log = logger("web_pipeline")


@dataclass
class WebDocument:
    url: str
    final_url: str
    title: str | None
    content: str
    metadata: dict[str, Any]


@dataclass
class UrlPipelineTask:
    """Parameters required to ingest a single URL."""

    url: str
    collection_name: str
    kb_id: str | None = None
    document_id: str | None = None
    job_id: str | None = None


@dataclass
class UrlPipelineResult:
    """Outcome of an ingestion attempt."""

    url: str
    document_id: str
    status: str
    job_id: str | None = None
    metadata: dict[str, Any] | None = None
    error: str | None = None


async def discover_urls(settings: Settings, query: str, *, limit: int = 5) -> list[str]:
    """Return candidate URLs for a query using SearxNG."""

    if not settings.searxng_base_url:
        raise SearchNotConfigured("SearxNG not configured (RAG_SEARXNG_BASE_URL missing)")

    wrapper = create_searx_wrapper(host=settings.searxng_base_url)

    def _run() -> list[dict[str, Any]]:
        return wrapper.results(query)

    results = await asyncio.to_thread(_run)
    urls: list[str] = []
    for item in results:
        url = item.get("url")
        if url:
            urls.append(url)
        if len(urls) >= limit:
            break
    return urls


async def fetch_and_extract(settings: Settings, url: str) -> WebDocument:
    html_bytes, final_url, content_type = await fetch_url_content(url)
    text = await extract_text_with_tika(settings, html_bytes=html_bytes, content_type=content_type)
    title = extract_title(html_bytes)
    metadata = {
        "ingest_method": "web",
        "source_url": final_url,
        "original_url": url,
        "content_type": content_type,
    }
    if title:
        metadata["title"] = title
    return WebDocument(url=url, final_url=final_url, title=title, content=text, metadata=metadata)


async def run_pipeline(
    settings: Settings,
    tasks: Iterable[UrlPipelineTask],
    *,
    ingest_text_fn: Any = ingest_text_into_store,
) -> List[UrlPipelineResult]:
    """Execute the full ingestion flow for a set of URLs.

    For each task we optionally create a job entry, mark URL status transitions,
    fetch & extract content via Tika, enrich metadata with search snippets, and
    finally ingest the text into the vector store.
    """

    results: List[UrlPipelineResult] = []

    for task in tasks:
        document_id = task.document_id or _hash_document_id(task.url)
        kb_id = task.kb_id or _extract_kb_id(task.collection_name) or "unknown"

        job_id: str | None = task.job_id
        job_created = job_id is not None

        if job_id is None and settings.postgres_dsn:
            try:
                job_id, job_created = create_job(settings, document_id, url=task.url)
            except Exception as exc:  # pragma: no cover - psycopg failure
                log.warning(
                    "pipeline.job_creation_failed",
                    url=task.url,
                    document_id=document_id,
                    error=str(exc),
                )
                job_id = None
                job_created = False

        if job_id and not job_created:
            log.info(
                "pipeline.job_already_running url=%s document_id=%s job_id=%s",
                task.url,
                document_id,
                job_id,
            )
            results.append(
                UrlPipelineResult(
                    url=task.url,
                    document_id=document_id,
                    job_id=job_id,
                    status="skipped",
                    error="Job already running",
                )
            )
            continue

        if job_id:
            _safe_update_url_status(settings, document_id, "queued")
            log.info(
                "pipeline.queued url=%s document_id=%s job_id=%s kb_id=%s",
                task.url,
                document_id,
                job_id,
                kb_id,
            )

        metadata: dict[str, Any] | None = None

        try:
            if job_id:
                _safe_mark_job_processing(settings, job_id)
            _safe_update_url_status(settings, document_id, "processing")

            metadata = await ingest_url_document(
                settings,
                kb_id=kb_id,
                document_id=document_id,
                url=task.url,
                collection_name=task.collection_name,
                ingest_text_fn=ingest_text_fn,
            )

            if job_id:
                _safe_mark_job_completed(settings, job_id, metadata=metadata)
            _safe_update_url_status(settings, document_id, "synced")

            results.append(
                UrlPipelineResult(
                    url=task.url,
                    document_id=document_id,
                    job_id=job_id,
                    status="synced",
                    metadata=metadata,
                )
            )
            log.info(
                "pipeline.synced url=%s document_id=%s job_id=%s kb_id=%s",
                task.url,
                document_id,
                job_id,
                kb_id,
            )
        except WebIngestionError as exc:
            log.warning(
                "pipeline.web_ingestion_failed url=%s document_id=%s error=%s",
                task.url,
                document_id,
                exc,
            )
            if job_id:
                _safe_mark_job_failed(settings, job_id, str(exc))
            _safe_update_url_status(settings, document_id, "error")
            results.append(
                UrlPipelineResult(
                    url=task.url,
                    document_id=document_id,
                    job_id=job_id,
                    status="error",
                    error=str(exc),
                )
            )
            log.warning(
                "pipeline.job_failed url=%s document_id=%s job_id=%s kb_id=%s error=%s",
                task.url,
                document_id,
                job_id,
                kb_id,
                exc,
            )
        except Exception as exc:  # pragma: no cover - unexpected failure
            log.exception(
                "pipeline.unexpected_error url=%s document_id=%s error=%s",
                task.url,
                document_id,
                exc,
            )
            if job_id:
                _safe_mark_job_failed(settings, job_id, str(exc))
            _safe_update_url_status(settings, document_id, "error")
            results.append(
                UrlPipelineResult(
                    url=task.url,
                    document_id=document_id,
                    job_id=job_id,
                    status="error",
                    error=str(exc),
                )
            )

    return results


def _hash_document_id(url: str) -> str:
    return "url_" + hashlib.sha1(url.encode("utf-8", "ignore")).hexdigest()


def _extract_kb_id(collection_name: str) -> str | None:
    if collection_name.startswith("kb_") and len(collection_name) > 3:
        return collection_name[3:].replace("_", "-")
    return None


def _safe_update_url_status(settings: Settings, document_id: str, status: str) -> None:
    if not settings.postgres_dsn:
        return
    try:
        update_url_status(settings, document_id, status)
    except Exception as exc:  # pragma: no cover - persistence failure
        log.warning(
            "pipeline.update_url_status_failed",
            document_id=document_id,
            status=status,
            error=str(exc),
        )


def _safe_mark_job_processing(settings: Settings, job_id: str) -> None:
    if not settings.postgres_dsn:
        return
    try:
        mark_job_processing(settings, job_id)
    except Exception as exc:  # pragma: no cover - persistence failure
        log.warning("pipeline.mark_job_processing_failed", job_id=job_id, error=str(exc))


def _safe_mark_job_completed(settings: Settings, job_id: str, *, metadata: dict[str, Any] | None) -> None:
    if not settings.postgres_dsn:
        return
    try:
        mark_job_completed(settings, job_id, metadata=metadata)
    except Exception as exc:  # pragma: no cover - persistence failure
        log.warning("pipeline.mark_job_completed_failed", job_id=job_id, error=str(exc))


def _safe_mark_job_failed(settings: Settings, job_id: str, error_message: str) -> None:
    if not settings.postgres_dsn:
        return
    try:
        mark_job_failed(settings, job_id, error_message)
    except Exception as exc:  # pragma: no cover - persistence failure
        log.warning(
            "pipeline.mark_job_failed_failed",
            job_id=job_id,
            error=str(exc),
        )
