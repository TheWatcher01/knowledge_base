# RAG API Service

Ce service FastAPI prend le relais d’Open WebUI pour la partie RAG : ingestion de contenus, stockage vectoriel et complétions de chat locales. Il s’appuie sur Ollama (modèles open source), LlamaIndex (pipeline ingestion/indexation) et LangChain (outils complémentaires comme SearxNG).

---

## 🛣️ Roadmap

| Statut | Tâche |
| --- | --- |
| ✅ | Création du squelette FastAPI + configuration uv / Docker |
| ✅ | Ingestion texte (LlamaIndex : chunking + embeddings Ollama + PGVector) |
| ✅ | Ingestion URL (SearxNG + Tika) et pipeline asynchrone |
| ⬜️ | Suppression / resynchronisation complète des KB (`rag-sync`) |
| ⬜️ | Endpoint chat streaming (ChatOllama + SSE) avec fallback Prisma |
| ⬜️ | Intégration SearxNG comme outil de recherche live + observabilité |
| ⬜️ | Fallback embeddings (SentenceTransformers) lorsque Ollama n’est pas disponible |
| ⬜️ | Support multi-fournisseurs LLM (OpenAI, Azure, Mistral) avec sélection runtime |
| ⬜️ | UI/Endpoints de gestion des modèles (listing/pull/delete/defaults) |
| ⬜️ | Jeux de tests (pytest + Vitest/Playwright) et documentation finale |

## ✅ À faire ensuite

- Mutualiser un pool Postgres psycopg pour éviter les connexions répétées.
- Ajouter un loader Tika résilient (timeouts, retries, fallback Unstructured).
- Consolider la file de traitement pour les crawls URL volumineux (priorités, retries, déduplication).
- Finaliser la suppression des chunks + métadonnées dans PGVector.
- Instrumenter les logs (JSON) et exposer des métriques Prometheus / OTEL.
- Étendre la couverture de tests (pytest delete/chat, Vitest & Playwright côté web).
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
- `RAG_RATE_LIMIT` : limite globale SlowAPI appliquée à tous les endpoints (`60/minute` par défaut, chaîne vide pour désactiver).
- `RAG_MAX_TEXT_CHARS` : taille maximale (caractères) d’un document texte ingéré (défaut : 20 000).
- `RAG_MAX_JSON_BYTES` : taille maximale (octets) d’un payload JSON (défaut : 262 144).
- `RAG_MAX_CONCURRENT_JOBS` : nombre maximum de jobs d’ingestion web simultanés par base (`5`).

## ⚙️ Endpoints clés

- `POST /api/v1/retrieval/process/text` — ingestion texte (rate limit 5/min, 413 si charges > limites).
- `POST /api/v1/retrieval/process/web` — ingestion URL asynchrone (rate limit 3/min, 429 si file pleine).
- `POST /api/v1/retrieval/delete` — suppression d’un document (rate limit 10/min).
- `POST /api/v1/retrieval/query/doc` — requêtes vectorielles (rate limit 60/min).
- `GET /api/v1/retrieval/status/{documentId}` — statut le plus récent d’une ingestion.
- `GET /api/v1/retrieval/jobs?documentId=…|kbId=…` — historique des jobs (limité à 100 entrées).
- `GET /api/v1/retrieval/jobs/{jobId}` — détail d’un job (timestamps, métadonnées, erreurs).
- `POST /api/v1/chat/completions` — streaming SSE propulsé par Ollama (rate limit 30/min).
- `GET /api/v1/models` — liste des modèles Ollama installés.
- `POST /api/v1/models/pull` — installation d’un modèle Ollama.

## 🛡️ Rate limiting & garde-fous

- SlowAPI utilise le jeton Bearer comme clé de throttling (sinon l’adresse IP).
- `RAG_RATE_LIMIT` définit une limite globale ; chaque endpoint critique ajoute en plus sa propre dépendance (`5/min`, `3/min`, etc.).
- Les payloads dépassant `RAG_MAX_TEXT_CHARS` ou `RAG_MAX_JSON_BYTES` renvoient `413 Content Too Large`.
- L’ingestion web renvoie `429 Too Many Requests` lorsque `RAG_MAX_CONCURRENT_JOBS` est atteint pour une KB donnée.
- Les logs structlog et les métriques Prometheus (`prometheus_fastapi_instrumentator`) exposent les informations de quota (`rate.limit.hit`).

## 🕸️ Pipeline d’ingestion web

La pipeline web est désormais orchestrée par `pipelines/web.py` et repose sur trois étapes clés :

1. **Découverte** — `discover_urls` interroge SearxNG (LangChain `SearxSearchWrapper`) pour proposer une liste d’URLs.
2. **Traitement** — `run_pipeline` gère des `UrlPipelineTask`, crée/relit les jobs `UrlIngestionJob`, met à jour les statuts `UrlEntry` (`queued` → `processing` → `synced|error`) et collecte les résultats (`UrlPipelineResult`).
3. **Extraction & ingestion** — `ingest_url_document` télécharge l’URL, extrait le texte via Tika, récupère le titre, ajoute des snippets Searx si disponibles puis pousse le contenu vers `ingest_text_into_store` (Ollama embeddings + PGVector).

Les helpers `_safe_update_url_status`/`_safe_mark_job_*` maintiennent la robustesse en cas de indisponibilité Postgres. Chaque exécution retourne les métadonnées enrichies (titre, content-type, URL finale, snippets) exploitables côté orchestrateur ou UI. Les appels réseau sont désormais protégés par un retry exponentiel et un fallback HTML→texte lorsque Tika est indisponible.

**Observabilité** : la pipeline journalise chaque transition (`pipeline.queued`, `pipeline.synced`, `pipeline.job_failed`) avec `job_id`, `kb_id` et métadonnées pour faciliter la corrélation dans les logs structlog.

**Scripts utiles** :

- `pnpm --filter web exec -- node scripts/seed-kb-sample.mjs` — peupler une base de démonstration (notes/fichiers/URLs) côté Prisma.
- `pnpm --filter web exec -- node scripts/backfill-url-status.mjs --dry-run` — vérifier la cohérence `UrlEntry.status` ↔ dernier job sans modifier la base (retirer `--dry-run` pour appliquer).

## ✅ Tests recommandés

```bash
# Côté service FastAPI
cd services/rag-api
uv run pytest

# Scénarios orchestrateur web
uv run pytest tests/test_web_pipeline.py

# Côté web (dialogue historique + UI)
cd apps/web
pnpm --filter web exec -- vitest run tests/urls-list.test.tsx
```

Avant d’exécuter les tests Vitest globaux, regénérez Prisma : `pnpm --filter web prisma generate`.

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
