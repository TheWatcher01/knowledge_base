"""FastAPI application factory and router registration."""

from __future__ import annotations

from fastapi import FastAPI

from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, get_settings
from .logging import configure_logging, logger
from .routes import chat, health, retrieval


def create_app(settings: Settings | None = None) -> FastAPI:
    """Construct the FastAPI application instance."""
    settings = settings or get_settings()

    configure_logging()
    log = logger("api")

    app = FastAPI(
        title="RAG Service",
        version="0.1.0",
        description="Lightweight RAG backend powered by Ollama, LlamaIndex and LangChain.",
    )

    app.add_middleware(CORSMiddleware, **settings.cors_kwargs)

    app.include_router(health.router)
    app.include_router(chat.router, prefix="/api/v1")
    app.include_router(retrieval.router, prefix="/api/v1")

    Instrumentator().instrument(app).expose(app, include_in_schema=False)

    log.info("application.started", host=settings.server_host, port=settings.server_port)

    return app


# Expose default app for uvicorn factory syntax
app = create_app()
