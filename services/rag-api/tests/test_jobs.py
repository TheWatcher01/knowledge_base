from __future__ import annotations

import uuid

import pytest

from rag_api.services.jobs import create_job


class _RecordingCursor:
    def __init__(self, executed, fetch_value):
        self._executed = executed
        self._fetch_value = fetch_value

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, sql, params=None):
        self._executed.append((sql, params))

    def fetchone(self):
        value = self._fetch_value
        self._fetch_value = None
        return value


class _RecordingConnection:
    def __init__(self, cursor):
        self._cursor = cursor

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def cursor(self):
        return self._cursor


@pytest.fixture
def settings():
    return type("Settings", (), {"postgres_dsn": "postgresql://test"})()


def test_create_job_sets_updated_at(monkeypatch, settings):
    executed = []

    monkeypatch.setattr("rag_api.services.jobs._ensure_table", lambda _settings: None)
    monkeypatch.setattr(
        "rag_api.services.jobs.psycopg.connect",
        lambda *args, **kwargs: _RecordingConnection(_RecordingCursor(executed, None)),
    )

    forced_uuid = uuid.UUID("00000000-0000-0000-0000-000000000001")
    monkeypatch.setattr("rag_api.services.jobs.uuid.uuid4", lambda: forced_uuid)

    job_id, created = create_job(settings, "doc-123", url="https://ademe.fr")

    assert created is True
    assert job_id == str(forced_uuid)

    insert_statements = [sql for sql, _ in executed if 'INSERT INTO "UrlIngestionJob"' in sql]
    assert insert_statements, "create_job should emit an INSERT when no active job exists"
    assert all('"updatedAt"' in sql and "NOW()" in sql for sql in insert_statements)


def test_create_job_reuses_existing_job(monkeypatch, settings):
    executed = []
    existing_id = uuid.UUID("00000000-0000-0000-0000-0000000000aa")

    monkeypatch.setattr("rag_api.services.jobs._ensure_table", lambda _settings: None)
    monkeypatch.setattr(
        "rag_api.services.jobs.psycopg.connect",
        lambda *args, **kwargs: _RecordingConnection(_RecordingCursor(executed, (existing_id,))),
    )
    monkeypatch.setattr(
        "rag_api.services.jobs.uuid.uuid4",
        lambda: (_ for _ in ()).throw(AssertionError("uuid.uuid4 should not be called")),
    )

    job_id, created = create_job(settings, "doc-456", url="https://ademe.fr")

    assert created is False
    assert job_id == str(existing_id)

    insert_statements = [sql for sql, _ in executed if 'INSERT INTO "UrlIngestionJob"' in sql]
    assert not insert_statements, "existing job should not trigger a new INSERT"
