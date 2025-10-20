# Playbook de déploiement RAG (environnement local / staging)

## 1. Pré-requis

- Docker + Docker Compose (pour Postgres, Mongo, Ollama, Tika, SearxNG).
- `uv` (Python 3.12), `pnpm` (Node 20), `psql` accessible.
- Variables d’environnement décidées à l’avance :
  - `RAG_AUTH_TOKEN` (auth FastAPI) — ex. `kb-dev-token`
  - `RAG_SYNC_SERVICE_TOKEN` (scheduler → Next.js)
  - `RAG_API_BASE` / `NEXT_PUBLIC_RAG_API_BASE` (front)
  - Secrets Next.js habituels (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.). `AUTH_SECRET` peut être omis : la webapp retombe automatiquement sur `NEXTAUTH_SECRET`.

## 2. Provisionner Postgres (pgvector)

> ℹ️ L'image Postgres utilisée par `compose.yml` est désormais construite depuis `docker/postgres/Dockerfile`, qui installe automatiquement l'extension **pgvector**. Après toute mise à jour du `Dockerfile`, exécuter `docker compose build postgres` pour mettre à jour l'image locale `kb-postgres:16.4-pgvector`.

```bash
docker compose up -d postgres

# Activer pgvector (une seule fois)
docker compose exec postgres psql -U postgres -d knowledge_base -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

> Adapter le nom de la base (`knowledge_base`) selon votre configuration.

## 3. Initialiser Mongo & services auxiliaires

```bash
docker compose up -d mongo ollama tika searxng
```

## 4. Installer les dépendances

```bash
# FastAPI
cd services/rag-api
uv sync

# Next.js
cd ../../apps/web
pnpm install
pnpm --filter web exec prisma generate
```

## 5. Charger les modèles Ollama + HuggingFace

```bash
# (Optionnel) modèles servis via Ollama
docker compose exec ollama ollama pull llama3.1:8b
docker compose exec ollama ollama pull mxbai-embed-large

# Modèles Qwen3 pour SentenceTransformers
cd services/rag-api
./scripts/download_qwen_models.sh  # nécessite `huggingface-cli login`
```

Mettre à jour `RAG_OLLAMA_LLM_MODEL` / `RAG_OLLAMA_EMBEDDING_MODEL` si vous utilisez d’autres modèles. Les poids Qwen3 sont stockés dans `~/.cache/huggingface/models/Qwen/...` par défaut ; ajustez `HF_HOME` au besoin.

## 6. Configurer les variables d’environnement

`apps/web/.env.local` :

```
RAG_API_BASE=http://localhost:8000
RAG_API_TOKEN=kb-dev-token
RAG_SYNC_SERVICE_TOKEN=kb-dev-token
USE_RAG_MOCK=false
```

`services/rag-api/.env` :

```
RAG_AUTH_TOKEN=kb-dev-token
RAG_POSTGRES_DSN=postgresql://postgres:postgres@localhost:5432/knowledge_base
RAG_MONGODB_URI=mongodb://localhost:27017
RAG_MONGO_DB=kbapp
RAG_OLLAMA_BASE_URL=http://localhost:11434
RAG_TIKA_BASE_URL=http://localhost:9998
RAG_SEARXNG_BASE_URL=http://localhost:8080
RAG_WEB_BASE_URL=http://localhost:3001
RAG_SYNC_SERVICE_TOKEN=kb-dev-token
RAG_SYNC_INTERVAL_SECONDS=0
RAG_EMBEDDING_BACKEND=auto
RAG_ENABLE_FALLBACK_EMBEDDINGS=true
RAG_FALLBACK_EMBEDDING_MODEL=Qwen/Qwen3-Embedding-0.6B
RAG_FALLBACK_EMBEDDING_DEVICE=
RAG_RERANK_BACKEND=huggingface
RAG_HF_RERANK_MODEL=Qwen/Qwen3-Reranker-0.6B
RAG_HF_RERANK_DEVICE=
RAG_HYBRID_RETRIEVAL_ENABLED=true
RAG_HYBRID_VECTOR_WEIGHT=0.6
RAG_HYBRID_BM25_LIMIT=20
RAG_HYBRID_BM25_CORPUS_LIMIT=2000
```

Adapter les hôtes/ports si vous utilisez Docker Desktop (`host.docker.internal` côté service).

> ⚠️ Après mise à jour des embeddings vers Qwen3, ré-ingérez les connaissances (ou purgez les tables `data_kb_*`) afin d’éviter les conflits de dimensions.

## 7. Lancer les services

```bash
# Mettre à jour l'image Postgres custom si nécessaire
docker compose build postgres

# FastAPI
cd services/rag-api
uv run -- uvicorn rag_api.main:app --host 0.0.0.0 --port 8000 --reload

> ⚠️ Après chaque modification des fichiers `.env` du service, interrompre puis relancer cette commande pour recharger la configuration (le reloader ne relit pas les variables d’environnement automatiquement).

# Next.js (nouvelle session)
cd apps/web
pnpm --filter web dev -- --port 3001
```

## 8. Vérifications rapides

1. Ouvrir `http://localhost:3001` : aucune bannière rouge « Service RAG indisponible ».
2. `curl http://localhost:8000/health` → `{ "status": "ok" }`.
3. `curl http://localhost:8000/api/v1/models` avec le header `Authorization: Bearer kb-dev-token` — la liste des modèles doit s’afficher.
4. `curl http://localhost:8000/api/v1/models/jobs` avec le même header — les jobs terminés doivent apparaître lorsqu’un téléchargement est lancé depuis l’UI admin.
4. Ingestion test : créer une base, ajouter un document texte, vérifier `/api/v1/retrieval/jobs`.
5. Lancer `POST http://localhost:8000/api/v1/retrieval/process/text` (via HTTPie/curl) pour confirmer la persistance.
6. L’auto-sync est désactivé en local (`RAG_SYNC_INTERVAL_SECONDS=0`). Tester ponctuellement la boucle en déclenchant `POST /api/kb/{id}/rag/reconcile` manuellement (Bearer `kb-dev-token`) ou en réactivant la variable avec une valeur ≥ 60 s sur un environnement de test dédié.

## 9. Générer / diffuser la doc OpenAPI

```bash
cd services/rag-api
uv run python scripts/generate-openapi.py
```

Publier `services/rag-api/openapi.json` dans la documentation interne/portail API.

Checklist de revue PR :
- [ ] `openapi.json` régénéré si les endpoints RAG changent.
- [ ] Lien de diffusion (portail API / Swagger UI hébergé) à jour dans la description de la PR si nécessaire.
- [ ] Vérifier que `http://localhost:8000/docs` (ou l’URL déployée) reste accessible après les modifications.

## 10. Ingestion web (pipeline asynchrone)

```bash
cd services/rag-api
export RAG_POSTGRES_DSN=postgresql://kb:kb@localhost:5432/kb
export RAG_AUTH_TOKEN=kb-dev-token
export RAG_API_BASE=http://localhost:8000

# Crée les enregistrements Prisma et déclenche /api/v1/retrieval/process/web
uv run python scripts/ingest_url_job.py 5b5aa9ef-e50f-474f-b707-2337c147adff https://www.wikipedia.org --title "Autosync test"

# Suivre le job
curl -H "Authorization: Bearer $RAG_AUTH_TOKEN" \
  "http://localhost:8000/api/v1/retrieval/jobs?kb_id=5b5aa9ef-e50f-474f-b707-2337c147adff&limit=5"
```

Le job doit passer par `queued` → `synced` et `UrlEntry.status` être mis à jour. Consulter les logs FastAPI (`autosync.*`) pour valider la boucle complète.

> 13/10/2025 – Validation locale : KB `00000000-0000-4000-8000-000000000000`, document `2aa3a28b-3cb0-402d-a838-6e46f35af896` (`https://www.wikipedia.org`) traité avec succès (`synced`) – voir job `c761092d-aa92-421d-94f3-64d699c89ad6`.

### Détection matériel & recommandation backend

```bash
cd services/rag-api
python scripts/hardware_probe.py
```

Le script retourne un JSON détaillant la présence GPU, la disponibilité d’Ollama et le backend recommandé (`ollama`, `huggingface (cuda)`, `huggingface (cpu)`). Utilisez ces informations pour ajuster `RAG_EMBEDDING_BACKEND` et `RAG_FALLBACK_EMBEDDING_DEVICE` avant de lancer le service.

## 10. Exécuter la suite de tests

```bash
cd services/rag-api && uv run pytest
cd ../apps/web && pnpm --filter web exec vitest run && pnpm --filter web exec -- playwright test
```

## 11. Étapes avant partage

- Mettre à jour `docs/rag-service/README.md` si des variables/ports changent.
- Communiquer la valeur des tokens via le gestionnaire de secrets interne (ne pas commiter les valeurs).
- Générer et consigner les traces nécessaires (logs `autosync`, exports de jobs) si vous préparez une démo.
