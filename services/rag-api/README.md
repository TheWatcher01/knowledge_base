## RAG API Service

Service FastAPI destiné à remplacer l’intégration Open WebUI. Il expose des endpoints compatibles (`/api/v1/chat/completions`, `/api/v1/retrieval/*`) et s’appuie sur Ollama, LlamaIndex et LangChain.

### Prérequis
- Python 3.12 (géré automatiquement par `uv`).
- Services externes via `docker compose`: `ollama`, `mongo`, `postgres`, `tika`, `searxng`.

### Commandes courantes
```bash
# Installation des dépendances (génère .venv et uv.lock)
uv sync

# Lancement du serveur en mode développement
uv run -- uvicorn rag_api.api:app --host 0.0.0.0 --port 8000 --reload

# Ou via le script
uv run main.py
```

### Variables d’environnement (préfixe `RAG_`)
- `RAG_OLLAMA_BASE_URL` : URL du service Ollama (`http://ollama:11434`).
- `RAG_OLLAMA_LLM_MODEL` / `RAG_OLLAMA_EMBEDDING_MODEL` : noms de modèles à utiliser.
- `RAG_POSTGRES_DSN` : DSN Postgres (avec pgvector).
- `RAG_MONGODB_URI` / `RAG_MONGO_DB` : accès au knowledge store.
- `RAG_SEARXNG_BASE_URL`, `RAG_TIKA_BASE_URL` : services optionnels pour la recherche web et l’extraction.
- `RAG_AUTH_TOKEN` : token Bearer attendu côté frontend.
- `RAG_RELOAD` : si `true`, active l’autoreload (développement).

### Structure du module
```
src/rag_api/
  api.py               # Factory FastAPI + CORS + routers
  config.py            # Pydantic Settings
  dependencies/auth.py # Vérification Bearer token
  routes/              # Endpoints (chat, ingestion, health)
  services/            # Implémentations pipelines (à compléter)
```

Les routes retournent pour l’instant des réponses placeholder; elles seront remplacées par des appels réels à LlamaIndex/LangChain aux étapes suivantes.
