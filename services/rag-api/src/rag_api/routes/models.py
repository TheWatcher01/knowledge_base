"""Model management endpoints for Ollama integration."""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Annotated
from uuid import uuid4

import re

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from ..config import Settings, get_settings
from ..services.embedding_provider import clear_embedding_backends
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

_HF_MODEL_PATTERN = re.compile(r"^hf\.co/[A-Za-z0-9][A-Za-z0-9_.-]*/[A-Za-z0-9][A-Za-z0-9_.-]*(?::[A-Za-z0-9_.-]+)?$", re.IGNORECASE)
_OLLAMA_MODEL_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]*(?::[A-Za-z0-9_.-]+)?$")


def _normalize_model_name(raw: str) -> str:
    candidate = (raw or "").strip()
    if not candidate:
        return ""

    lowered = candidate.lower()
    prefixes = (
        "https://huggingface.co/",
        "http://huggingface.co/",
        "huggingface.co/",
    )

    for prefix in prefixes:
        if lowered.startswith(prefix):
            suffix = candidate[len(prefix) :]
            candidate = f"hf.co/{suffix}"
            lowered = candidate.lower()
            break

    if lowered.startswith("hf.co://"):
        candidate = "hf.co/" + candidate[7:]

    return candidate


def _is_supported_model_name(name: str) -> bool:
    if not name:
        return False
    if _HF_MODEL_PATTERN.fullmatch(name):
        return True
    if _OLLAMA_MODEL_PATTERN.fullmatch(name):
        return True
    return False


def _ensure_ollama_configured(settings: Settings) -> str:
    if not settings.ollama_base_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama base URL is not configured.",
        )
    return str(settings.ollama_base_url).rstrip("/")


async def _ollama_request(
    settings: Settings,
    method: str,
    path: str,
    *,
    json_body: dict[str, object] | None = None,
    timeout: float = 60.0,
) -> httpx.Response:
    base_url = _ensure_ollama_configured(settings)
    url = f"{base_url}{path}"

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.request(method, url, json=json_body)
    except httpx.HTTPError as exc:  # pragma: no cover - network failure
        log.warning("ollama.http.failed", url=url, error=str(exc))
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    if response.status_code >= 400:
        detail = response.text or response.reason_phrase
        raise HTTPException(response.status_code, detail)

    return response


async def _ollama_json(
    settings: Settings,
    method: str,
    path: str,
    *,
    json_body: dict[str, object] | None = None,
    timeout: float = 60.0,
) -> dict[str, object] | list[object]:
    response = await _ollama_request(settings, method, path, json_body=json_body, timeout=timeout)
    try:
        return response.json()
    except json.JSONDecodeError as exc:  # pragma: no cover - defensive
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=f"Invalid JSON from Ollama: {exc}") from exc


async def _assert_model_installed(settings: Settings, model_name: str) -> None:
    try:
        payload = await _ollama_json(
            settings,
            "POST",
            "/api/show",
            json_body={"name": model_name},
            timeout=30.0,
        )
    except HTTPException as exc:
        detail = str(exc.detail).lower()
        if exc.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST) and any(
            marker in detail for marker in _NOT_FOUND_MARKERS
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model '{model_name}' is not installed on Ollama.",
            ) from exc
        raise
    else:
        if not payload:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail=f"Model '{model_name}' is not installed on Ollama.",
            )


async def _validate_requested_models(settings: Settings, chat_model: str | None, embedding_model: str | None) -> None:
    for model in (chat_model, embedding_model):
        if model:
            await _assert_model_installed(settings, model)


@router.get("/models", summary="List installed Ollama models")
async def list_models(settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, list[dict[str, str]]]:
    payload = await _ollama_json(settings, "GET", "/api/tags", timeout=15.0)

    models_raw = []
    if isinstance(payload, dict):
        models_raw = payload.get("models") or []
    elif isinstance(payload, list):
        models_raw = payload

    if not isinstance(models_raw, list):
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail="Unexpected response format from Ollama tags API")

    normalized: list[dict[str, str]] = []
    for entry in models_raw:
        if not isinstance(entry, dict):
            continue
        normalized.append(
            {
                "name": str(entry.get("name", "")),
                "modified_at": str(entry.get("modified_at", "")),
                "size": str(entry.get("size", "")),
                "digest": str(entry.get("digest", "")),
            }
        )

    return {"models": normalized}


def _background_pull_job(settings: Settings, job_id: str, model_name: str) -> asyncio.Task[None]:
    loop = asyncio.get_running_loop()

    async def _runner() -> None:
        log.info("models.pull.job.start", job_id=job_id, name=model_name)
        try:
            mark_model_job_started(settings, job_id)

            summary_lines: list[str] = []
            async with httpx.AsyncClient(timeout=None) as client:
                url = f"{_ensure_ollama_configured(settings)}/api/pull"
                async with client.stream("POST", url, json={"name": model_name}) as response:
                    if response.status_code >= 400:
                        detail = response.text
                        raise HTTPException(response.status_code, detail)

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                        except json.JSONDecodeError:
                            summary_lines.append(line)
                            continue

                        status_text = str(data.get("status") or "").lower()
                        if status_text:
                            summary_lines.append(data.get("status", ""))
                        if data.get("error"):
                            raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=str(data["error"]))

            summary = "\n".join(filter(None, summary_lines)) or f"Model '{model_name}' pulled successfully"
            mark_model_job_succeeded(settings, job_id, summary)
            log.info("models.pull.job.completed", job_id=job_id, name=model_name)
        except HTTPException as exc:
            detail = str(exc.detail)
            mark_model_job_failed(settings, job_id, detail)
            log.warning("models.pull.job.failed", job_id=job_id, name=model_name, detail=detail)
        except Exception as exc:  # pragma: no cover - unexpected failures
            mark_model_job_failed(settings, job_id, str(exc))
            log.exception("models.pull.job.crashed", job_id=job_id, name=model_name)

    return loop.create_task(_runner())


async def _pull_without_persistence(settings: Settings, model_name: str) -> dict[str, object]:
    log.warning("models.pull.persistence_disabled", name=model_name)
    summary_lines: list[str] = []
    async with httpx.AsyncClient(timeout=None) as client:
        url = f"{_ensure_ollama_configured(settings)}/api/pull"
        async with client.stream("POST", url, json={"name": model_name}) as response:
            if response.status_code >= 400:
                detail = await response.aread()
                raise HTTPException(response.status_code, detail.decode("utf-8") or response.reason_phrase)

            async for line in response.aiter_lines():
                if not line:
                    continue
                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    summary_lines.append(line)
                    continue

                status_text = str(data.get("status") or "")
                if status_text:
                    summary_lines.append(data.get("status", ""))
                if data.get("error"):
                    raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=str(data["error"]))

    now = datetime.now(tz=timezone.utc).isoformat()
    summary = "\n".join(filter(None, summary_lines)) or f"Model '{model_name}' pulled successfully"
    return {
        "id": f"transient-{uuid4()}",
        "provider": _OLLAMA_PROVIDER,
        "model": model_name,
        "status": "succeeded",
        "summary": summary,
        "error": None,
        "queued_at": now,
        "started_at": now,
        "finished_at": now,
        "created_at": now,
        "updated_at": now,
    }


@router.post("/models/pull", summary="Schedule an Ollama model pull", status_code=status.HTTP_202_ACCEPTED)
async def pull_model(
    payload: dict[str, str],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, object]:
    _ensure_ollama_configured(settings)

    model_name_raw = payload.get("name", "")
    model_name = _normalize_model_name(model_name_raw)

    if not model_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Model name is required")

    if not _is_supported_model_name(model_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid model name. Use Ollama tags or hf.co/{org}/{model}.",
        )

    try:
        job = create_model_job(settings, provider=_OLLAMA_PROVIDER, model=model_name)
    except ValueError:
        fallback_job = await _pull_without_persistence(settings, model_name)
        return {"job": fallback_job}

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
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Model name is required")

    log.info("models.delete.start", name=name)
    await _ollama_request(settings, "POST", "/api/delete", json_body={"name": name}, timeout=60.0)
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

    await _validate_requested_models(settings, chat_model, embedding_model)

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
            clear_embedding_backends()
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
    try:
        jobs = list_model_jobs(settings, provider=_OLLAMA_PROVIDER, limit=max(1, min(limit, 50)))
    except ValueError as exc:
        log.warning("models.jobs.persistence_disabled", error=str(exc))
        jobs = []
    return {"jobs": jobs}


@router.get("/models/jobs/{job_id}", summary="Get a specific Ollama model pull job")
async def get_model_pull_job(job_id: str, settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, str | None]:
    _ensure_ollama_configured(settings)
    try:
        job = get_model_job(settings, job_id)
    except ValueError as exc:
        log.warning("models.jobs.persistence_disabled", error=str(exc))
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Job not found") from exc
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job
