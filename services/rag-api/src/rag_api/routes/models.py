"""Model management endpoints for Ollama integration."""

from __future__ import annotations

import asyncio
import json
import subprocess
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ..config import Settings, get_settings
from ..services.ingestion import clear_embedding_cache
from ..dependencies.auth import verify_bearer_token
from ..logging import logger

router = APIRouter(tags=["models"], dependencies=[Depends(verify_bearer_token)])

log = logger("models")


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


@router.post("/models/pull", summary="Pull an Ollama model")
async def pull_model(
    payload: dict[str, str],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, str]:
    _ensure_ollama_configured(settings)

    model_name = payload.get("name")
    if not model_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Model name is required")

    log.info("models.pull.start", name=model_name)

    loop = asyncio.get_running_loop()

    def _pull() -> str:
        return _run_ollama_command("ollama", "pull", model_name, timeout=10 * 60)

    try:
        summary = await loop.run_in_executor(None, _pull)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    log.info("models.pull.completed", name=model_name)
    return {"status": "pulled", "name": model_name, "summary": summary.strip()}


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

    if chat_model is not None:
        settings.ollama_llm_model = chat_model
        log.info("models.defaults.chat", model=chat_model)

    if embedding_model is not None:
        settings.ollama_embedding_model = embedding_model
        clear_embedding_cache()
        log.info("models.defaults.embedding", model=embedding_model)

    return {
        "chat_model": settings.ollama_llm_model,
        "embedding_model": settings.ollama_embedding_model,
    }
