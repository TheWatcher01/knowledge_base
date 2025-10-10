"""Configuration management for the RAG API service."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Literal

from pydantic import Field, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


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
        default=None,
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

    @property
    def cors_kwargs(self) -> dict[str, Any]:
        """Return keyword arguments for configuring CORS middleware."""
        return {
            "allow_origins": self.allowed_origins,
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()  # type: ignore[call-arg]
