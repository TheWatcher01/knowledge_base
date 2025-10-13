"""FastAPI application factory and router registration."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .config import Settings, get_settings
from .logging import configure_logging, logger
from .rate_limit import configure_default_limits, limiter
from .routes import chat, health, retrieval, models
from .scheduler import start_scheduler, stop_scheduler


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

    configure_default_limits(settings.rate_limit)
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    async def _rate_limit_handler(request: Request, exc: RateLimitExceeded):  # pragma: no cover - framework hook
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded."})

    app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)

    app.include_router(health.router)
    app.include_router(chat.router, prefix="/api/v1")
    app.include_router(models.router, prefix="/api/v1")
    app.include_router(retrieval.router, prefix="/api/v1")

    Instrumentator().instrument(app).expose(app, include_in_schema=False)

    @app.on_event("startup")
    async def _start_scheduler():  # pragma: no cover - startup hook
        start_scheduler(app, settings)

    @app.on_event("shutdown")
    async def _stop_scheduler():  # pragma: no cover - shutdown hook
        await stop_scheduler(app)

    log.info("application.started", host=settings.server_host, port=settings.server_port)

    return app


# Expose default app for uvicorn factory syntax
app = create_app()
