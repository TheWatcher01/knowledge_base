from __future__ import annotations

import types

import pytest

from rag_api.pipelines.web import (
    UrlPipelineResult,
    UrlPipelineTask,
    WebIngestionError,
    _hash_document_id,
    run_pipeline,
)


class _StubSettings(types.SimpleNamespace):
    """Minimal settings stub matching the attrs used by the pipeline."""


@pytest.mark.asyncio
async def test_run_pipeline_success(monkeypatch):
    settings = _StubSettings(postgres_dsn="postgresql+psycopg://user:pass@localhost/db")

    statuses: list[tuple[str, str]] = []
    job_calls: list[str] = []

    def fake_create_job(settings, document_id, *, url):  # noqa: ANN001
        job_calls.append("create")
        return "job-123", True

    def fake_mark_processing(settings, job_id):  # noqa: ANN001
        job_calls.append(f"processing:{job_id}")

    def fake_mark_completed(settings, job_id, metadata=None):  # noqa: ANN001, D417
        job_calls.append(f"completed:{job_id}")

    async def fake_ingest_url_document(settings, **kwargs):  # noqa: ANN001, ANN003
        return {"title": "Example", "source_url": kwargs["url"]}

    def fake_update_status(settings, document_id, status):  # noqa: ANN001
        statuses.append((document_id, status))

    monkeypatch.setattr("rag_api.pipelines.web.create_job", fake_create_job)
    monkeypatch.setattr("rag_api.pipelines.web.mark_job_processing", fake_mark_processing)
    monkeypatch.setattr("rag_api.pipelines.web.mark_job_completed", fake_mark_completed)
    monkeypatch.setattr("rag_api.pipelines.web.update_url_status", fake_update_status)
    monkeypatch.setattr("rag_api.pipelines.web.ingest_url_document", fake_ingest_url_document)

    task = UrlPipelineTask(url="https://example.com", collection_name="kb_123")

    results = await run_pipeline(settings, [task])

    expected_document_id = _hash_document_id(task.url)

    assert len(results) == 1
    result = results[0]
    assert isinstance(result, UrlPipelineResult)
    assert result.url == task.url
    assert result.document_id == expected_document_id
    assert result.job_id == "job-123"
    assert result.status == "synced"
    assert result.metadata == {"title": "Example", "source_url": task.url}
    assert result.error is None

    assert statuses == [
        (expected_document_id, "queued"),
        (expected_document_id, "processing"),
        (expected_document_id, "synced"),
    ]
    assert "completed:job-123" in job_calls


@pytest.mark.asyncio
async def test_run_pipeline_with_precreated_job(monkeypatch):
    settings = _StubSettings(postgres_dsn="postgresql+psycopg://user:pass@localhost/db")

    statuses: list[str] = []
    job_calls: list[str] = []

    def fake_create_job(*args, **kwargs):  # noqa: ANN001, D417
        raise AssertionError("create_job should not be invoked when job_id is provided")

    def fake_mark_processing(settings, job_id):  # noqa: ANN001
        job_calls.append(f"processing:{job_id}")

    def fake_mark_completed(settings, job_id, metadata=None):  # noqa: ANN001, D417
        job_calls.append(f"completed:{job_id}")

    async def fake_ingest_url_document(settings, **kwargs):  # noqa: ANN001, ANN003
        return {"title": "Example", "source_url": kwargs["url"]}

    def fake_update_status(settings, document_id, status):  # noqa: ANN001
        statuses.append(status)

    monkeypatch.setattr("rag_api.pipelines.web.create_job", fake_create_job)
    monkeypatch.setattr("rag_api.pipelines.web.mark_job_processing", fake_mark_processing)
    monkeypatch.setattr("rag_api.pipelines.web.mark_job_completed", fake_mark_completed)
    monkeypatch.setattr("rag_api.pipelines.web.update_url_status", fake_update_status)
    monkeypatch.setattr("rag_api.pipelines.web.ingest_url_document", fake_ingest_url_document)

    task = UrlPipelineTask(
        url="https://example.com",
        collection_name="kb_123",
        document_id="doc-123",
        job_id="job-precreated",
    )

    results = await run_pipeline(settings, [task])

    assert len(results) == 1
    result = results[0]
    assert result.job_id == "job-precreated"
    assert result.status == "synced"
    assert statuses == ["queued", "processing", "synced"]
    assert "completed:job-precreated" in job_calls


@pytest.mark.asyncio
async def test_run_pipeline_skips_when_job_running(monkeypatch):
    settings = _StubSettings(postgres_dsn="postgresql+psycopg://user:pass@localhost/db")

    statuses: list[tuple[str, str]] = []

    def fake_create_job(settings, document_id, *, url):  # noqa: ANN001
        return "job-999", False

    def fake_update_status(settings, document_id, status):  # noqa: ANN001
        statuses.append((document_id, status))

    async def _unused_ingest(settings, **kwargs):  # noqa: ANN001, ANN003
        raise AssertionError("ingest_url_document should not be called when job already exists")

    monkeypatch.setattr("rag_api.pipelines.web.create_job", fake_create_job)
    monkeypatch.setattr("rag_api.pipelines.web.update_url_status", fake_update_status)
    monkeypatch.setattr("rag_api.pipelines.web.ingest_url_document", _unused_ingest)

    task = UrlPipelineTask(url="https://example.org", collection_name="kb_456")

    results = await run_pipeline(settings, [task])

    expected_document_id = _hash_document_id(task.url)

    assert len(results) == 1
    result = results[0]
    assert result.url == task.url
    assert result.document_id == expected_document_id
    assert result.job_id == "job-999"
    assert result.status == "skipped"
    assert result.metadata is None
    assert result.error == "Job already running"
    assert statuses == []  # aucune mise à jour tant que le job est déjà actif


@pytest.mark.asyncio
async def test_run_pipeline_handles_ingestion_error(monkeypatch):
    settings = _StubSettings(postgres_dsn="postgresql+psycopg://user:pass@localhost/db")

    failures: list[str] = []
    statuses: list[str] = []

    def fake_create_job(settings, document_id, *, url):  # noqa: ANN001
        return "job-500", True

    def fake_mark_processing(settings, job_id):  # noqa: ANN001
        pass

    def fake_mark_failed(settings, job_id, error_message):  # noqa: ANN001
        failures.append(f"{job_id}:{error_message}")

    def fake_update_status(settings, document_id, status):  # noqa: ANN001
        statuses.append(status)

    async def fake_ingest_url_document(settings, **kwargs):  # noqa: ANN001, ANN003
        raise WebIngestionError("boom")

    monkeypatch.setattr("rag_api.pipelines.web.create_job", fake_create_job)
    monkeypatch.setattr("rag_api.pipelines.web.mark_job_processing", fake_mark_processing)
    monkeypatch.setattr("rag_api.pipelines.web.mark_job_failed", fake_mark_failed)
    monkeypatch.setattr("rag_api.pipelines.web.update_url_status", fake_update_status)
    monkeypatch.setattr("rag_api.pipelines.web.ingest_url_document", fake_ingest_url_document)

    task = UrlPipelineTask(url="https://example.net", collection_name="kb_789")

    results = await run_pipeline(settings, [task])

    expected_document_id = _hash_document_id(task.url)

    assert len(results) == 1
    result = results[0]
    assert result.url == task.url
    assert result.document_id == expected_document_id
    assert result.job_id == "job-500"
    assert result.status == "error"
    assert result.metadata is None
    assert result.error == "boom"

    assert statuses == ["queued", "processing", "error"]
    assert failures == ["job-500:boom"]
