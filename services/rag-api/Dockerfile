FROM ghcr.io/astral-sh/uv:python3.12-bookworm AS base

WORKDIR /app

COPY pyproject.toml uv.lock README.md ./
COPY src ./src
COPY main.py ./main.py

# Installer les dépendances en mode production (pas de dev extras)
RUN uv sync --frozen --no-dev

EXPOSE 8000
ENV RAG_SERVER_HOST=0.0.0.0 \
    RAG_SERVER_PORT=8000

CMD ["uv", "run", "main.py"]
