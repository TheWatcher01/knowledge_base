# RAG API Service

Ce service FastAPI prend le relais d’Open WebUI pour la partie RAG : ingestion de contenus, stockage vectoriel et complétions de chat locales. Il s’appuie sur Ollama (modèles open source), LlamaIndex (pipeline ingestion/indexation) et LangChain (outils complémentaires comme SearxNG).

---

## 🛣️ Roadmap

| Statut | Tâche |
| --- | --- |
| ✅ | Création du squelette FastAPI + configuration uv / Docker |
| ✅ | Ingestion texte (LlamaIndex : chunking + embeddings Ollama + PGVector) |
| ⬜️ | Ingestion URL (SearxNG + Tika) et pipeline asynchrone |
| ⬜️ | Suppression / resynchronisation complète des KB (`rag-sync`) |
| ⬜️ | Endpoint chat streaming (ChatOllama + SSE) avec fallback Prisma |
| ⬜️ | Intégration SearxNG comme outil de recherche live + observabilité |
| ⬜️ | Jeux de tests (pytest + Vitest/Playwright) et documentation finale |

## ✅ À faire ensuite

- Mutualiser un pool Postgres psycopg pour éviter les connexions répétées.
- Ajouter un loader Tika résilient (timeouts, retries, fallback Unstructured).
- Mettre en place une file de traitement pour les crawls URL volumineux.
- Implémenter la suppression des chunks + métadonnées dans PGVector.
- Instrumenter les logs (JSON) et exposer des métriques Prometheus / OTEL.
- Couvrir les endpoints FastAPI avec pytest (ingestion, delete, chat).
- Rédiger le playbook de déploiement (pgvector init, modèles Ollama, secrets).

---

## 🔧 Prérequis

- Python 3.12 (géré automatiquement par `uv`).
- Services externes via `docker compose` : `ollama`, `mongo`, `postgres`, `tika`, `searxng`.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances (génère .venv et uv.lock)
uv sync

# Lancement du serveur en mode développement
uv run -- uvicorn rag_api.api:app --host 0.0.0.0 --port 8000 --reload

# Ou via le script
uv run main.py
```

## 🔑 Variables d’environnement (`RAG_`)

- `RAG_OLLAMA_BASE_URL` : URL du service Ollama (`http://ollama:11434`).
- `RAG_OLLAMA_LLM_MODEL` / `RAG_OLLAMA_EMBEDDING_MODEL` : noms de modèles à utiliser.
- `RAG_POSTGRES_DSN` : DSN Postgres (avec pgvector).
- `RAG_MONGODB_URI` / `RAG_MONGO_DB` : accès au knowledge store.
- `RAG_SEARXNG_BASE_URL`, `RAG_TIKA_BASE_URL` : services optionnels pour la recherche web et l’extraction.
- `RAG_AUTH_TOKEN` : token Bearer attendu côté frontend.
- `RAG_RELOAD` : si `true`, active l’autoreload (développement).

## 🗂️ Structure du module

```bash
src/rag_api/
  api.py               # Factory FastAPI + CORS + routers
  config.py            # Pydantic Settings
  dependencies/auth.py # Vérification Bearer token
  routes/              # Endpoints (chat, ingestion, health)
  services/            # Implémentations pipelines (ingestion, vector store, etc.)
```

Les routes retournent pour l’instant des réponses placeholder; elles seront remplacées par des appels réels à LlamaIndex/LangChain aux étapes suivantes.
