"""Logging utilities for the RAG API service."""

from __future__ import annotations

import logging
from typing import Iterable

import structlog


def configure_logging() -> None:
    """Configure structlog with a JSON renderer."""

    timestamper = structlog.processors.TimeStamper(fmt="iso")

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            timestamper,
            structlog.processors.EventRenamer("message"),
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    )

    logging.basicConfig(
        format="%(message)s",
        level=logging.INFO,
    )


def logger(name: str) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)
