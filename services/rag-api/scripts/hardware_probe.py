#!/usr/bin/env python3
"""Lightweight hardware and service probe for local RAG setup."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from dataclasses import dataclass
from typing import Any

import httpx

OLLAMA_PING_PATH = "/api/tags"


@dataclass
class ProbeResult:
    has_gpu: bool
    gpu_driver: str | None
    ollama_reachable: bool
    ollama_base_url: str | None
    recommended_backend: str
    notes: list[str]


def detect_gpu() -> tuple[bool, str | None]:
    """Detect the presence of an NVIDIA GPU via nvidia-smi."""

    if shutil.which("nvidia-smi") is None:
        return False, None

    try:
        completed = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,driver_version", "--format=csv,noheader"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.SubprocessError):
        return False, None

    output = completed.stdout.strip()
    return bool(output), output if output else None


def check_ollama(base_url: str | None) -> bool:
    if not base_url:
        return False
    try:
        response = httpx.get(base_url.rstrip("/") + OLLAMA_PING_PATH, timeout=3.0)
        response.raise_for_status()
        return True
    except httpx.HTTPError:
        return False


def recommend_backend(has_gpu: bool, ollama_ok: bool) -> str:
    if ollama_ok and has_gpu:
        return "ollama"
    if ollama_ok:
        return "ollama"
    if has_gpu:
        return "huggingface (cuda)"
    return "huggingface (cpu)"


def main() -> None:
    ollama_url = os.environ.get("RAG_OLLAMA_BASE_URL") or os.environ.get("OLLAMA_BASE_URL")
    has_gpu, gpu_info = detect_gpu()
    ollama_ok = check_ollama(ollama_url)

    recommendation = recommend_backend(has_gpu, ollama_ok)

    notes: list[str] = []
    if not ollama_ok and ollama_url:
        notes.append(f"Ollama not reachable at {ollama_url}")
    if ollama_ok and not has_gpu:
        notes.append("Ollama reachable but no NVIDIA GPU detected – ensure models run in CPU mode.")
    if has_gpu and not ollama_ok:
        notes.append("GPU detected but Ollama unreachable – configure OLLAMA service for optimal performance.")

    payload: dict[str, Any] = {
        "has_gpu": has_gpu,
        "gpu_driver": gpu_info,
        "ollama_reachable": ollama_ok,
        "ollama_base_url": ollama_url,
        "recommended_backend": recommendation,
        "notes": notes,
    }

    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
