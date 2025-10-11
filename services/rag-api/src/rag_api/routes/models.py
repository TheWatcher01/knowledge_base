"""Model management endpoints for Ollama integration."""

from __future__ import annotations

import asyncio
import json
import subprocess
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ..config import Settings, get_settings
from ..services.ingestion import clear_embedding_cache
from ..services.model_preferences import get_model_preferences, upsert_model_preferences
from ..services.model_jobs import (
    create_model_job,
    get_model_job,
    list_model_jobs,
    mark_model_job_failed,
    mark_model_job_started,
    mark_model_job_succeeded,
)
from ..dependencies.auth import verify_bearer_token
from ..logging import logger

router = APIRouter(tags=["models"], dependencies=[Depends(verify_bearer_token)])

log = logger("models")

_NOT_FOUND_MARKERS = ("not found", "does not exist", "unknown model", "is not installed")
_OLLAMA_PROVIDER = "ollama"


def _ensure_ollama_configured(settings: Settings) -> str:
    if not settings.ollama_base_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama base URL is not configured.",
        )
    return settings.ollama_base_url


def _run_ollama_command(*args: str, timeout: float = 60.0) -> str:
    try:
        completed = subprocess.run(
            args,
            check=True,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except subprocess.CalledProcessError as exc:
        log.warning("ollama.command_failed", args=args, stderr=exc.stderr.strip())
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Ollama command failed: {exc.stderr.strip() or exc.stdout.strip()}",
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Ollama command timed out: {' '.join(args)}",
        ) from exc

    return completed.stdout


def _assert_model_installed(model_name: str) -> None:
    try:
        _run_ollama_command("ollama", "show", model_name)
    except HTTPException as exc:
        detail = str(exc.detail).lower()
        if exc.status_code == status.HTTP_502_BAD_GATEWAY and any(marker in detail for marker in _NOT_FOUND_MARKERS):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model '{model_name}' is not installed on Ollama.",
            ) from exc
        raise


def _validate_requested_models(chat_model: str | None, embedding_model: str | None) -> None:
    for model in (chat_model, embedding_model):
        if model:
            _assert_model_installed(model)


@router.get("/models", summary="List installed Ollama models")
async def list_models(settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, list[dict[str, str]]]:
    _ensure_ollama_configured(settings)
    output = _run_ollama_command("ollama", "list", "--json")
    try:
        models = json.loads(output)
        if not isinstance(models, list):
            raise ValueError("Unexpected response structure")
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Invalid response from ollama list: {exc}",
        ) from exc

    # Normalize response
    normalized: list[dict[str, str]] = []
    for entry in models:
        if not isinstance(entry, dict):
            continue
        normalized.append({
            "name": str(entry.get("name", "")),
            "modified_at": str(entry.get("modified_at", "")),
            "size": str(entry.get("size", "")),
            "digest": str(entry.get("digest", "")),
        })

    return {"models": normalized}


def _background_pull_job(settings: Settings, job_id: str, model_name: str) -> asyncio.Task[None]:
    loop = asyncio.get_running_loop()

    async def _runner() -> None:
        log.info("models.pull.job.start", job_id=job_id, name=model_name)
        try:
            mark_model_job_started(settings, job_id)
            summary = await loop.run_in_executor(
                None, lambda: _run_ollama_command("ollama", "pull", model_name, timeout=10 * 60)
            )
        except HTTPException as exc:
            detail = str(exc.detail)
            mark_model_job_failed(settings, job_id, detail)
            log.warning("models.pull.job.failed", job_id=job_id, name=model_name, detail=detail)
        except Exception as exc:  # pragma: no cover - unexpected failures
            mark_model_job_failed(settings, job_id, str(exc))
            log.exception("models.pull.job.crashed", job_id=job_id, name=model_name)
        else:
            mark_model_job_succeeded(settings, job_id, summary.strip())
            log.info("models.pull.job.completed", job_id=job_id, name=model_name)

    return loop.create_task(_runner())


@router.post("/models/pull", summary="Schedule an Ollama model pull", status_code=status.HTTP_202_ACCEPTED)
async def pull_model(
    payload: dict[str, str],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, object]:
    _ensure_ollama_configured(settings)

    model_name = payload.get("name")
    if not model_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Model name is required")

    try:
        job = create_model_job(settings, provider=_OLLAMA_PROVIDER, model=model_name)
    except ValueError as exc:
        log.error("models.pull.persistence_error", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Persistence for model jobs is not configured",
        ) from exc

    _background_pull_job(settings, job["id"], model_name)

    return {"job": job}


@router.get("/models/defaults", summary="Get default chat and embedding models")
async def get_model_defaults(settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, str | None]:
    _ensure_ollama_configured(settings)
    if settings.postgres_dsn:
        try:
            preferences = get_model_preferences(settings)
        except ValueError as exc:
            log.warning("models.defaults.persistence_disabled", error=str(exc))
        except Exception as exc:  # pragma: no cover - unexpected persistence failure
            log.warning("models.defaults.persistence_error", error=str(exc))
        else:
            chat_pref = preferences.get("chat_model")
            embed_pref = preferences.get("embedding_model")

            if chat_pref is not None:
                settings.ollama_llm_model = chat_pref
            if embed_pref is not None:
                settings.ollama_embedding_model = embed_pref

            return {
                "chat_model": chat_pref if chat_pref is not None else settings.ollama_llm_model,
                "embedding_model": (
                    embed_pref if embed_pref is not None else settings.ollama_embedding_model
                ),
            }

    return {
        "chat_model": settings.ollama_llm_model,
        "embedding_model": settings.ollama_embedding_model,
    }


@router.delete("/models/{name}", summary="Delete an Ollama model")
async def delete_model(name: str, settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, str]:
    _ensure_ollama_configured(settings)

    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Model name is required")

    log.info("models.delete.start", name=name)
    _run_ollama_command("ollama", "delete", name)
    log.info("models.delete.completed", name=name)
    return {"status": "deleted", "name": name}


@router.patch("/models/defaults", summary="Update default chat or embedding models")
async def update_model_defaults(
    payload: dict[str, str | None],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, str | None]:
    _ensure_ollama_configured(settings)

    chat_model = payload.get("chat_model")
    embedding_model = payload.get("embedding_model")

    if chat_model is None and embedding_model is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide chat_model and/or embedding_model",
        )

    _validate_requested_models(chat_model, embedding_model)

    previous_chat = settings.ollama_llm_model
    previous_embedding = settings.ollama_embedding_model

    persisted: dict[str, str | None] | None = None

    if settings.postgres_dsn:
        try:
            persisted = upsert_model_preferences(
                settings,
                chat_model=chat_model,
                embedding_model=embedding_model,
            )
        except ValueError as exc:
            log.warning("models.defaults.persistence_disabled", error=str(exc))
        except Exception as exc:
            log.error("models.defaults.persistence_error", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to persist model defaults",
            ) from exc

    if persisted:
        chat_model = persisted.get("chat_model", chat_model)
        embedding_model = persisted.get("embedding_model", embedding_model)

    effective_chat = chat_model if chat_model is not None else previous_chat
    effective_embedding = embedding_model if embedding_model is not None else previous_embedding

    if effective_chat:
        settings.ollama_llm_model = effective_chat
        if effective_chat != previous_chat:
            log.info("models.defaults.chat", model=effective_chat)

    if effective_embedding:
        settings.ollama_embedding_model = effective_embedding
        if effective_embedding != previous_embedding:
            clear_embedding_cache()
            log.info("models.defaults.embedding", model=effective_embedding)

    return {
        "chat_model": settings.ollama_llm_model,
        "embedding_model": settings.ollama_embedding_model,
    }


@router.get("/models/jobs", summary="List Ollama model pull jobs")
async def list_model_pull_jobs(
    settings: Annotated[Settings, Depends(get_settings)],
    limit: int = 20,
) -> dict[str, list[dict[str, str | None]]]:
    _ensure_ollama_configured(settings)
    jobs = list_model_jobs(settings, provider=_OLLAMA_PROVIDER, limit=max(1, min(limit, 50)))
    return {"jobs": jobs}


@router.get("/models/jobs/{job_id}", summary="Get a specific Ollama model pull job")
async def get_model_pull_job(job_id: str, settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, str | None]:
    _ensure_ollama_configured(settings)
    job = get_model_job(settings, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job
