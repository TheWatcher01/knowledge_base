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
- `RAG_RATE_LIMIT` : limite globale par défaut appliquée par SlowAPI (`60/minute` par défaut, désactiver via valeur vide).
- `RAG_MAX_TEXT_CHARS` : taille maximale (caractères) acceptée pour l’ingestion texte (`20000`).
- `RAG_MAX_JSON_BYTES` : taille maximale (octets) des payloads JSON (`262144`).
- `RAG_MAX_CONCURRENT_JOBS` : nombre maximum de jobs d’ingestion web en file par KB (`5`).

## ⚙️ Endpoints disponibles

- `POST /api/v1/retrieval/process/text` : ingestion texte (retour 413 si charge > limites, rate limit 5/min).
- `POST /api/v1/retrieval/process/web` : ingestion URL asynchrone, crée un job (`429` si file pleine, 3/min).
- `POST /api/v1/retrieval/delete` : suppression, rate limit 10/min.
- `POST /api/v1/retrieval/query/doc` : requêtes vecteur (k ≤ 50, rate limit 60/min).
- `GET /api/v1/retrieval/status/{documentId}` : statut agrégé (job + entrée URL).
- `GET /api/v1/retrieval/jobs?documentId=...|kbId=...` : liste des jobs récents (limite 100).
- `GET /api/v1/retrieval/jobs/{jobId}` : détail d’un job (timestamps, métadonnées, erreurs).
- `POST /api/v1/chat/completions` : streaming SSE propulsé par Ollama (rate limit 30/min).

## 🛡️ Garde-fous & observabilité

- **Rate limiting** : basé sur SlowAPI avec clé `Bearer` ou IP. Dépendances spécifiques par endpoint (cf. quotas ci-dessus) + limite globale configurable (`RAG_RATE_LIMIT`).
- **Clients surdimensionnés** : 413 `Text payload exceeds allowed size` si `content` dépasse `RAG_MAX_TEXT_CHARS`, 413 `Ingestion payload too large` si JSON > `RAG_MAX_JSON_BYTES`.
- **Concurrence URL** : 429 `Web ingestion queue is full` lorsque `RAG_MAX_CONCURRENT_JOBS` est atteint pour une KB.
- **Logs & metrics** : structlog JSON + `prometheus_fastapi_instrumentator` exposent métriques Prometheus.

## ✅ Tests recommandés

```bash
# Lancer la suite pytest (inclut contrôles de rate limit / payload / endpoints jobs)
cd services/rag-api
uv run pytest

# Exemple ciblé depuis la racine
uv run pytest tests/test_retrieval_api.py
```

Les tests utilisent un `client_factory` qui force les variables d’environnement et simule les dépendances (`count_active_jobs`). Ajoutez les scénarios Playwright/Vitest côté Next.js selon les features front (cf. docs `apps/web/tests`).

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
