import asyncio
from types import SimpleNamespace

import pytest

from rag_api.config import Settings
from rag_api import scheduler


@pytest.fixture
def anyio_backend():
    return "asyncio"


def _base_settings(**overrides):
    params = {
        "ollama_base_url": "http://localhost:11434",
        "postgres_dsn": "postgresql://user:pass@localhost:5432/db",
        "web_base_url": "http://localhost:3001",
        "sync_service_token": "secret-token",
        "sync_interval_seconds": 300,
    }
    params.update(overrides)
    return Settings(**params)


def test_start_scheduler_disabled_when_interval_missing():
    app = SimpleNamespace(state=SimpleNamespace())
    settings = _base_settings(sync_interval_seconds=0)

    scheduler.start_scheduler(app, settings)

    assert not hasattr(app.state, "autosync_task")


@pytest.mark.anyio
async def test_run_sync_invokes_reconcile(monkeypatch):
    invoked = []

    async def fake_reconcile(client, settings, kb_id):
        invoked.append(kb_id)

    monkeypatch.setattr(scheduler, "_fetch_kb_ids", lambda settings: ["kb-1", "kb-2"])
    monkeypatch.setattr(scheduler, "_reconcile_kb", fake_reconcile)

    settings = _base_settings()
    await scheduler._run_sync(settings)  # type: ignore[attr-defined]

    assert invoked == ["kb-1", "kb-2"]


@pytest.mark.anyio
async def test_stop_scheduler_cancels_task(monkeypatch):
    app = SimpleNamespace(state=SimpleNamespace())
    settings = _base_settings()

    async def fake_loop(settings):
        await asyncio.sleep(0.01)

    monkeypatch.setattr(scheduler, "_scheduler_loop", fake_loop)

    scheduler.start_scheduler(app, settings)
    assert hasattr(app.state, "autosync_task")

    await scheduler.stop_scheduler(app)
    task = getattr(app.state, "autosync_task", None)
    assert task is None or task.cancelled()
