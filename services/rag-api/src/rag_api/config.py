"""Configuration management for the RAG API service."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Literal

from pydantic import Field, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

from .logging import logger
from .services.model_preferences import get_model_preferences


class Settings(BaseSettings):
    """Application runtime settings sourced from environment variables."""

    model_config = SettingsConfigDict(env_prefix="RAG_", env_file=".env", extra="ignore")

    environment: Literal["development", "production", "staging", "test"] = Field(
        default="development",
        description="Current execution environment.",
    )

    server_host: str = Field(default="0.0.0.0", description="Host interface for uvicorn.")
    server_port: int = Field(default=8000, description="Port for the HTTP server.")
    reload: bool = Field(
        default=False,
        description="Reload application automatically on code changes (dev only).",
    )

    ollama_base_url: HttpUrl | None = Field(
        default="http://127.0.0.1:11434",
        description="Endpoint of the Ollama service used for LLM inference.",
    )
    ollama_llm_model: str = Field(
        default="llama3.1",
        description="Default Ollama model for text generation.",
    )
    ollama_embedding_model: str = Field(
        default="mxbai-embed-large",
        description="Default embedding model served by Ollama.",
    )

    embedding_backend: Literal["auto", "ollama", "huggingface"] = Field(
        default="auto",
        description="Embedding backend selection (auto tries Ollama first, then HuggingFace).",
    )
    enable_fallback_embeddings: bool = Field(
        default=True,
        description="Enable SentenceTransformers fallback when Ollama is unavailable or not selected.",
    )
    fallback_embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        description="SentenceTransformers model used when the fallback backend is active.",
    )
    fallback_embedding_device: str | None = Field(
        default=None,
        description="Preferred device for SentenceTransformers (leave empty for auto detection).",
    )

    postgres_dsn: str | None = Field(
        default=None,
        description="Postgres connection string (e.g. postgresql+asyncpg://user:pass@host/db).",
    )
    mongo_uri: str | None = Field(
        default=None,
        alias="mongodb_uri",
        description="MongoDB connection URI for the knowledge store.",
    )
    mongo_db: str = Field(default="kbapp", description="MongoDB database name.")

    searxng_base_url: HttpUrl | None = Field(
        default=None,
        description="Optional SearxNG endpoint for web search augmentation.",
    )
    tika_base_url: HttpUrl | None = Field(
        default=None,
        description="Optional Apache Tika server URL for document parsing.",
    )

    auth_token: str | None = Field(
        default=None,
        description="Optional bearer token expected from clients when set.",
    )

    allowed_origins: list[str] = Field(
        default_factory=lambda: ["*"],
        description="CORS allowed origins.",
    )

    rate_limit: str | None = Field(
        default="60/minute",
        description="Default SlowAPI rate limit (empty string disables).",
    )
    max_text_chars: int = Field(
        default=20_000,
        ge=1_024,
        description="Maximum number of characters accepted for text ingestion payloads.",
    )
    max_json_bytes: int = Field(
        default=262_144,
        ge=4_096,
        description="Maximum JSON payload size in bytes for ingestion endpoints.",
    )
    max_concurrent_jobs: int = Field(
        default=5,
        ge=1,
        description="Maximum number of concurrent web ingestion jobs per knowledge base.",
    )
    web_base_url: HttpUrl | None = Field(
        default=None,
        description="Base URL of the Next.js application used for background sync callbacks.",
    )
    sync_service_token: str | None = Field(
        default=None,
        description="Shared bearer token allowing background reconciliation calls to the web app.",
    )
    sync_interval_seconds: int = Field(
        default=0,
        ge=0,
        description="Interval in seconds for the automatic knowledge base reconciliation job (0 disables).",
    )

    openrouter_api_key: str | None = Field(
        default=None,
        description="OpenRouter API key used for hosted LLM/Rerank providers.",
    )
    openrouter_api_url: HttpUrl | None = Field(
        default="https://openrouter.ai/api/v1",
        description="Base URL for OpenRouter API calls.",
    )
    openrouter_app_name: str | None = Field(
        default=None,
        description="Application name sent to OpenRouter via X-Title header.",
    )
    openrouter_site_url: HttpUrl | None = Field(
        default=None,
        description="Referer URL communicated to OpenRouter (HTTP-Referer header).",
    )
    openrouter_rerank_model: str | None = Field(
        default="cohere/rerank-english-v3.0",
        description="Identifier of the OpenRouter rerank model to use when available.",
    )
    openrouter_timeout_seconds: float = Field(
        default=30.0,
        ge=1.0,
        description="Timeout (seconds) for OpenRouter HTTP calls.",
    )

    @property
    def cors_kwargs(self) -> dict[str, Any]:
        """Return keyword arguments for configuring CORS middleware."""
        return {
            "allow_origins": self.allowed_origins,
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }


log = logger("config")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    settings = Settings()  # type: ignore[call-arg]

    if settings.postgres_dsn:
        try:
            preferences = get_model_preferences(settings)
        except Exception as exc:  # pragma: no cover - defensive logging only
            log.warning("settings.model_preferences.load_failed", error=str(exc))
        else:
            chat_default = preferences.get("chat_model")
            embed_default = preferences.get("embedding_model")

            if chat_default:
                settings.ollama_llm_model = chat_default
            if embed_default:
                settings.ollama_embedding_model = embed_default

    return settings
