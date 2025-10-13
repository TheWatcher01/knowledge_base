# RAG API (services/rag-api)

Service FastAPI responsable de l’ingestion, du stockage vectoriel et du chat RAG. Ce document décrit les actions concrètes côté dossier `services/rag-api`; pour la vision globale consulter `docs/rag-service/README.md`.

## Installation locale

```bash
uv sync
```

- Crée un environnement virtuel `.venv` dédié (géré par `uv`).
- Résout les dépendances Python définies dans `pyproject.toml` et `uv.lock`.

> Référez-vous à `docs/rag-service/README.md` pour la liste exhaustive des variables `RAG_*`, la roadmap et les scénarios de validation. Les points ci-dessous se limitent aux actions propres au répertoire `services/rag-api`.

## Lancement

```bash
uv run -- uvicorn rag_api.main:app --reload --host 0.0.0.0 --port 8000
```

- `--reload` à conserver en local uniquement.
- Le service suppose que Postgres, Mongo, Ollama, Tika et SearxNG tournent (Docker Compose recommandé).

## Automatisation rag-sync

- Configurer les variables suivantes pour activer la boucle d’auto-réconciliation :
  - `RAG_WEB_BASE_URL` : URL publique de l’app Next.js (ex. `http://localhost:3001`).
  - `RAG_SYNC_SERVICE_TOKEN` : bearer partagé avec l’endpoint `/api/kb/{id}/rag/reconcile`.
  - `RAG_SYNC_INTERVAL_SECONDS` : intervalle (> 0) entre deux passages. Valeur minimale forcée à 60 s.
- Au démarrage, `start_scheduler` attend 10 s, récupère les IDs de `KnowledgeBase` dans Postgres, puis appelle l’endpoint Next.js pour chaque KB.
- Les logs `autosync.*` (structlog) confirment les succès/échecs. Pour désactiver la tâche, laisser `RAG_SYNC_INTERVAL_SECONDS=0` ou retirer l’un des paramètres ci-dessus.

## Scripts et tests

```bash
# Tests unitaires / d’intégration Python
uv run pytest

# Pipeline web (URL ingestion) ciblée
uv run pytest tests/test_web_pipeline.py -k \"pipeline\"

# Schéma OpenAPI
uv run python scripts/generate-openapi.py

# Ingestion web (Document+UrlEntry + job asynchrone)
uv run python scripts/ingest_url_job.py <kb-id> https://www.wikipedia.org --title "Autosync"
```

> Variables requises : `RAG_POSTGRES_DSN`, `RAG_AUTH_TOKEN`, `RAG_API_BASE`. Exemple validé le 13/10/2025 avec la KB `00000000-0000-4000-8000-000000000000` (document `2aa3a28b-3cb0-402d-a838-6e46f35af896` → job `c761092d-aa92-421d-94f3-64d699c89ad6` en statut `synced`).

Avant de lancer les tests front (Vitest/Playwright), exécuter côté monorepo `pnpm --filter web exec prisma generate`.

## Structure principale

```
rag_api/
  api.py                # Factory FastAPI, route import, instrumentation
  config.py             # Paramétrage Pydantic (Settings)
  routes/               # Endpoints (chat, retrieval, models, health, search)
  services/             # Logique métier (ingestion, vector store, jobs, pipelines)
  dependencies/         # Authentification Bearer, rate limiting
  pipelines/            # Orchestration SearxNG/Tika -> pgvector
  tests/                # Pytest (services + API)
```

## Points de vigilance

- L’extension `vector` doit être disponible sur Postgres avant démarrage.
- Les jobs d’ingestion URL s’appuient sur `asyncio.create_task`; surveiller les logs structlog pour les erreurs.
- En cas de renommage de collection (`kb-` → `kb_`), le module `services/vector_store.py` migre tables, index et séquences au runtime.
- Si Ollama est indisponible, le service passe automatiquement sur SentenceTransformers (`RAG_ENABLE_FALLBACK_EMBEDDINGS=true`).
- Pour le streaming, `langchain_ollama.ChatOllama.astream` nécessite un serveur Ollama récent (> 0.3); vérifier la compatibilité.

## Validation manuelle rapide

1. Lancer le service avec les variables ci-dessus et le front Next.js (`pnpm --filter web dev`).
2. Créer une KB, ingérer note/fichier/URL, vérifier les entrées `UrlIngestionJob` et le statut via `/api/v1/retrieval/jobs`.
3. Supprimer un document depuis l’UI et confirmer la suppression dans PGVector (`SELECT COUNT(*) FROM data_kb_<id>`).
4. Ouvrir le chat et s’assurer que le streaming SSE fonctionne (console réseau → `EventStream`).
5. Valider les métriques sur `GET /metrics` et que les limites de rate limit renvoient bien 429/413 en cas de dépassement.
