#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
NEXT_CMD=(pnpm --filter web dev --port 3001)
FASTAPI_CMD=(uv run -- uvicorn rag_api.api:app --host 0.0.0.0 --port 8000)

NEXT_LOG="$ROOT_DIR/.next-dev.log"
FASTAPI_LOG="$ROOT_DIR/.rag-api.log"

cleanup() {
  local exit_code=$?
  if [[ -n "${NEXT_PID:-}" ]] && kill -0 "$NEXT_PID" 2>/dev/null; then
    kill "$NEXT_PID" 2>/dev/null || true
  fi
  if [[ -n "${FASTAPI_PID:-}" ]] && kill -0 "$FASTAPI_PID" 2>/dev/null; then
    kill "$FASTAPI_PID" 2>/dev/null || true
  fi
  wait "$NEXT_PID" 2>/dev/null || true
  wait "$FASTAPI_PID" 2>/dev/null || true
  exit "$exit_code"
}

trap cleanup INT TERM EXIT

printf '\n▶️  Starting Next.js (logs: %s)\n' "$NEXT_LOG"
(
  cd "$ROOT_DIR"
  "${NEXT_CMD[@]}"
) &>"$NEXT_LOG" &
NEXT_PID=$!

printf '▶️  Starting FastAPI (logs: %s)\n' "$FASTAPI_LOG"
(
  cd "$ROOT_DIR/services/rag-api"
  PYTHONPATH=src "${FASTAPI_CMD[@]}"
) &>"$FASTAPI_LOG" &
FASTAPI_PID=$!

printf '\n✅ Servers running. Press Ctrl+C to stop both.\n'
wait
