#!/usr/bin/env python3
"""Helper script to enqueue a web ingestion job.

Creates the Prisma records (Document + UrlEntry) then calls the FastAPI endpoint
/ api/v1/retrieval/process/web so that the asynchronous pipeline and autosync can
be verified end-to-end.
"""

from __future__ import annotations

import argparse
import os
import sys
import uuid
from datetime import datetime, timezone

import httpx
import psycopg


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Enqueue a RAG web ingestion job")
    parser.add_argument("kb_id", help="Knowledge base identifier (UUID)")
    parser.add_argument("url", help="URL to ingest")
    parser.add_argument(
        "--title",
        default="Autosync URL",
        help="Title stored in the Document record (default: Autosync URL)",
    )
    parser.add_argument(
        "--api-base",
        default=os.environ.get("RAG_API_BASE", "http://localhost:8000"),
        help="FastAPI base URL",
    )
    parser.add_argument(
        "--token",
        default=os.environ.get("RAG_AUTH_TOKEN"),
        help="Bearer token expected by FastAPI",
    )
    return parser.parse_args()


def ensure_records(dsn: str, kb_id: str, url: str, title: str) -> str:
    document_id = str(uuid.uuid4())
    url_entry_id = str(uuid.uuid4())
    now = datetime.now(tz=timezone.utc)

    with psycopg.connect(dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                'INSERT INTO "Document" ("id", "kbId", "type", "title", "source", "createdAt") VALUES (%s, %s, %s, %s, %s, %s)',
                (document_id, kb_id, "url", title, url, now),
            )
            cur.execute(
                'INSERT INTO "UrlEntry" ("id", "documentId", "url", "description", "status", "createdAt", "updatedAt") VALUES (%s, %s, %s, %s, %s, %s, %s)',
                (url_entry_id, document_id, url, "ingestion scripted", "queued", now, now),
            )
    return document_id


def trigger_ingestion(api_base: str, token: str | None, collection_name: str, document_id: str, url: str) -> dict:
    payload = {
        "url": url,
        "collection_name": collection_name,
        "document_id": document_id,
    }

    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = httpx.post(f"{api_base.rstrip('/')}/api/v1/retrieval/process/web", json=payload, timeout=30.0, headers=headers)
    response.raise_for_status()
    return response.json()


def main() -> None:
    args = parse_args()
    dsn = os.environ.get("RAG_POSTGRES_DSN")
    if not dsn:
        sys.exit("RAG_POSTGRES_DSN must be set (e.g. postgresql://user:pass@localhost:5432/db)")

    collection = f"kb_{args.kb_id.replace('-', '_')}"
    doc_id = ensure_records(dsn, args.kb_id, args.url, args.title)

    try:
        result = trigger_ingestion(args.api_base, args.token, collection, doc_id, args.url)
    except httpx.HTTPStatusError as exc:  # pragma: no cover - surfaced to the shell
        sys.exit(f"Failed to trigger web ingestion: {exc.response.text}")

    print("Document ID:", doc_id)
    print("FastAPI response:", result)


if __name__ == "__main__":
    main()
