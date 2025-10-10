"""Entrypoint for running the RAG API service with uv or uvicorn."""

from __future__ import annotations

import uvicorn

from rag_api.api import create_app
from rag_api.config import get_settings


def main() -> None:
    """Launch the FastAPI application using uvicorn."""

    # Ensure the application can be imported eagerly when using `uv run main.py`
    create_app()

    settings = get_settings()
    uvicorn.run(
        "rag_api.api:app",
        host=settings.server_host,
        port=settings.server_port,
        reload=settings.reload,
        factory=True,
    )


if __name__ == "__main__":
    main()
