"""Background scheduler for periodic knowledge base reconciliation."""

from __future__ import annotations

import asyncio
from contextlib import suppress
from typing import Iterable

import httpx
import psycopg

from .config import Settings
from .logging import logger

log = logger("autosync")


def _fetch_kb_ids(settings: Settings) -> list[str]:
    if not settings.postgres_dsn:
        return []

    with psycopg.connect(settings.postgres_dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT "id" FROM "KnowledgeBase" ORDER BY "createdAt" DESC')
            rows = cur.fetchall()

    return [row[0] for row in rows]


async def _reconcile_kb(client: httpx.AsyncClient, settings: Settings, kb_id: str) -> None:
    if not settings.web_base_url or not settings.sync_service_token:
        return

    url = f"{settings.web_base_url.rstrip('/')}/api/kb/{kb_id}/rag/reconcile"
    headers = {"Authorization": f"Bearer {settings.sync_service_token}"}

    try:
        response = await client.post(url, headers=headers, timeout=30.0)
        if response.status_code >= 400:
            log.warning(
                "autosync.reconcile_failed",
                kb_id=kb_id,
                status=response.status_code,
                body=response.text[:200],
            )
        else:
            log.info("autosync.reconcile_success", kb_id=kb_id)
    except httpx.HTTPError as exc:  # pragma: no cover - network error
        log.warning("autosync.reconcile_error", kb_id=kb_id, error=str(exc))


async def _run_sync(settings: Settings) -> None:
    kb_ids = _fetch_kb_ids(settings)
    if not kb_ids:
        log.info("autosync.no_kb")
        return

    async with httpx.AsyncClient() as client:
        for kb_id in kb_ids:
            await _reconcile_kb(client, settings, kb_id)


async def _scheduler_loop(settings: Settings) -> None:
    interval = max(settings.sync_interval_seconds or 0, 60)

    # Initial delay to let the web app boot
    await asyncio.sleep(10)

    while True:
        try:
            await _run_sync(settings)
        except Exception as exc:  # pragma: no cover - defensive
            log.warning("autosync.loop_error", error=str(exc))
        await asyncio.sleep(interval)


def start_scheduler(app, settings: Settings) -> None:
    if not settings.sync_interval_seconds or settings.sync_interval_seconds <= 0:
        log.info("autosync.disabled", reason="sync_interval_seconds<=0")
        return

    if not settings.web_base_url or not settings.sync_service_token:
        log.info("autosync.disabled", reason="missing_base_or_token")
        return

    task = asyncio.create_task(_scheduler_loop(settings))
    app.state.autosync_task = task  # type: ignore[attr-defined]
    log.info("autosync.started", interval=settings.sync_interval_seconds)


async def stop_scheduler(app) -> None:
    task = getattr(app.state, "autosync_task", None)  # type: ignore[attr-defined]
    if task:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task
        log.info("autosync.stopped")
