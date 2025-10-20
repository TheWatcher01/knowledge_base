# Boucle RAG Next.js + FastAPI

Cette page centralise la documentation du service RAG FastAPI et de son intégration avec l’application Next.js. Elle remplace les anciennes roadmaps dispersées et doit être considérée comme la source de vérité.

## Architecture côté RAG

- FastAPI (`services/rag-api`) expose ingestion, requêtes vectorielles et complétions de chat.
- Ollama fournit les modèles LLM et embeddings (CPU ou GPU selon l’hôte).
- Postgres avec l’extension `pgvector` conserve les vecteurs, MongoDB stocke les connaissances dérivées et l’historique.
- Apache Tika et SearxNG alimentent les pipelines d’extraction et d’enrichissement.
- Next.js appelle le service via `apps/web/src/lib/rag.ts`, `rag-sync.ts` et les routes API (`/api/chat`, `/api/files`, `/api/urls`, etc.).

## Roadmap (13 octobre 2025)

- [x] Initialisation FastAPI (`rag-api`), Dockerfile et configuration `uv`.
- [x] Migration Next.js vers `RAG_API_*`, helpers `rag.ts` et collecte des tokens.
- [x] Ingestion texte (chunking, embeddings Ollama, stockage PGVector).
- [x] Ingestion URL (pipeline asynchrone SearxNG + Tika, statut exposé côté UI).
- [x] Suppression et resynchronisation (`rag-sync`) déclenchées depuis les routes Next.js, y compris renommage automatique des collections legacy.
- [x] Chat streaming réel via `/api/v1/chat/completions` avec fallback Prisma en cas d’échec.
- [x] Feedback UI global quand le service RAG est indisponible (chat, ingestion, synchronisation).
- [x] Automatisation `rag-sync` (job FastAPI) avec documentation opérationnelle.
- [x] Couverture de tests renforcée (pytest delete/rag-sync, Vitest streaming, Playwright complet) et publication d’un plan QA.
- [ ] Documentation OpenAPI/Swagger complète et vérifiée.
- [ ] Intégration SearxNG temps réel dans le chat.
- [ ] Fallback embeddings (SentenceTransformers) et support multi-fournisseurs LLM (OpenAI, Azure, Mistral).
- [ ] UI de gestion des modèles Ollama (liste, installation, suppression, sélection par défaut).
- [ ] Pipeline GitHub Actions incluant Next.js, FastAPI, Postgres, Mongo et Playwright.

## Travaux ouverts priorisés

1. Générer et publier un schéma OpenAPI complet (annotations FastAPI, vérification Swagger UI).
2. Documenter le playbook de déploiement : initialisation pgvector, préparation des modèles Ollama, configuration des secrets.
3. Planifier l’intégration SearxNG live search et les fallback embeddings.
4. Finaliser la pipeline GitHub Actions incluant Next.js, FastAPI, Postgres, Mongo et Playwright.

## Pré-requis et services externes

- Node.js 20+, pnpm 9+ pour le front.
- Python 3.12+ et `uv` pour le service FastAPI.
- Docker Compose pour lancer Postgres, Mongo, Ollama, Tika, SearxNG et le service RAG.
- Variables d’environnement cohérentes entre Next.js et FastAPI (`RAG_API_TOKEN` côté web ↔ `RAG_AUTH_TOKEN` côté service).

### Commandes de démarrage rapides

```bash
# Dépendances front
pnpm install
pnpm --filter web exec prisma generate

# Services externes
docker compose up -d

# FastAPI
uv sync
uv run -- uvicorn rag_api.main:app --reload --host 0.0.0.0 --port 8000

# Front Next.js (port 3001)
pnpm --filter web dev
```

Les redémarrages doivent être effectués manuellement en utilisant les commandes ci-dessus.

### Variables d’environnement principales (`apps/web`)

- `RAG_API_BASE` (ou `NEXT_PUBLIC_RAG_API_BASE`) : base URL du service FastAPI.
- `RAG_API_TOKEN` / `NEXT_PUBLIC_RAG_API_TOKEN` : jeton Bearer envoyé par Next.js (exposé côté client pour les requêtes fetch).
- `RAG_ALLOWED_ORIGINS` : (optionnel) liste séparée par des virgules des origines autorisées pour les appels front → FastAPI. Par défaut : `http://localhost:3001,http://localhost:3000`.
- `USE_RAG_MOCK` : bascule vers le mock interne (doit rester `false` en mode service réel).
- `RAG_SYNC_SERVICE_TOKEN` : secret partagé si le service RAG déclenche des synchronisations vers le web.
- `AUTH_SECRET` *(optionnel)* : correspond au secret NextAuth côté middleware. À défaut, la webapp retombe automatiquement sur `NEXTAUTH_SECRET`.
- `RAG_EMBEDDING_BACKEND` : `auto` (défaut), `ollama` ou `huggingface` selon le backend souhaité.
- `RAG_ENABLE_FALLBACK_EMBEDDINGS`, `RAG_FALLBACK_EMBEDDING_MODEL`, `RAG_FALLBACK_EMBEDDING_DEVICE` : contrôlent SentenceTransformers (détection auto du device si valeur vide).
- `RAG_HF_EMBED_MODEL` *(défaut : `Qwen/Qwen3-Embedding-0.6B`)* : modèle SentenceTransformers utilisé quand on retombe sur HuggingFace.
- `RAG_RERANK_BACKEND` : `auto`, `openrouter`, `huggingface` ou `disabled` selon le reranker souhaité.
- `RAG_HF_RERANK_MODEL` *(défaut : `Qwen/Qwen3-Reranker-0.6B`)* et `RAG_HF_RERANK_DEVICE` : configuration du cross-encoder local.
- `RAG_HYBRID_RETRIEVAL_ENABLED`, `RAG_HYBRID_VECTOR_WEIGHT`, `RAG_HYBRID_BM25_LIMIT`, `RAG_HYBRID_BM25_CORPUS_LIMIT` : paramètrent la fusion vectorielle/BM25.

### Variables FastAPI (`services/rag-api`)

- `RAG_AUTH_TOKEN` : jeton attendu pour toutes les requêtes entrantes.
- `RAG_POSTGRES_DSN` et `RAG_MONGODB_URI` : connexions au vector store et au knowledge store. (L'image Postgres utilisée dans `compose.yml` est construite depuis `docker/postgres/Dockerfile` et embarque pgvector par défaut.)
- `RAG_OLLAMA_BASE_URL`, `RAG_OLLAMA_LLM_MODEL`, `RAG_OLLAMA_EMBEDDING_MODEL` : configuration Ollama.
- `RAG_TIKA_BASE_URL`, `RAG_SEARXNG_BASE_URL` : services d’extraction et de recherche.
- `RAG_HF_EMBED_MODEL`, `RAG_HF_RERANK_MODEL` : modèles HuggingFace téléchargés localement (voir section Qwen3 ci-dessous).
- `RAG_RATE_LIMIT`, `RAG_MAX_TEXT_CHARS`, `RAG_MAX_JSON_BYTES`, `RAG_MAX_CONCURRENT_JOBS` : garde-fous SlowAPI.
- `RAG_SYNC_INTERVAL_SECONDS`, `RAG_WEB_BASE_URL` : activation du scheduler (à documenter avant mise en production).
- `RAG_ENABLE_FALLBACK_EMBEDDINGS`, `RAG_FALLBACK_EMBEDDING_MODEL`, `RAG_FALLBACK_EMBEDDING_DEVICE` : contrôlent l’activation de SentenceTransformers lorsque Ollama est indisponible.
- En développement local, définir `RAG_SYNC_INTERVAL_SECONDS=0` pour désactiver la boucle autosync et éviter les dépassements de quota ; ne réactivez la boucle (valeur ≥ 60) que dans les environnements où Postgres/Ollama supportent la charge.

## Modèles Qwen3 (embeddings + reranker)

- **Dépendances Python** : `services/rag-api/pyproject.toml` installe `torch>=2.2.0`, `transformers>=4.51.0` et `sentence-transformers>=3.2.0` pour charger Qwen3. Activez Flash Attention si vous exploitez un GPU.
- **VRAM** : `Qwen3-Embedding-0.6B` et `Qwen3-Reranker-0.6B` consomment ~3–4 Go en FP16 (≈2 Go en FP8). Vérifiez la capacité de vos GPU/serveurs avant déploiement.
- **Téléchargement** : `services/rag-api/scripts/download_qwen_models.sh` (basé sur `huggingface-cli download`) télécharge les modèles dans `~/.cache/huggingface/models/Qwen/...`. Ajustez `HF_HOME` ou `CACHE_DIR` si besoin.
- **Variables d’environnement** :
  - `RAG_HF_EMBED_MODEL=Qwen/Qwen3-Embedding-0.6B`
  - `RAG_RERANK_BACKEND=huggingface` (ou `auto` si vous disposez encore d’une clé OpenRouter)
  - `RAG_HF_RERANK_MODEL=Qwen/Qwen3-Reranker-0.6B`
  - `RAG_HF_RERANK_DEVICE=cuda:0` (ou `cpu` par défaut)
- **Réindexation obligatoire** : les embeddings Qwen3 sont en 1024 dimensions. Après bascule, ré-ingérez les collections PGVector pour éviter les erreurs `different vector dimensions 384 and 1024`.
- **Reranker instruction-aware** : adoptez un prompt du type `Query: {question}\nDocument: {passage}\nRelevance:` si vous utilisez directement le `CrossEncoder` SentenceTransformers.
- **Option GGUF/Ollama** : des builds quantifiés existent sur le hub Ollama (`ollama pull dengcao/qwen3-reranker-0.6b`), mais la pile principale reste basée sur Sentence Transformers.

### Gestion des jobs modèles Ollama

- **Persistance obligatoire** : `RAG_POSTGRES_DSN` doit pointer vers la base Postgres contenant la table `ModelJob`. Sans cela, FastAPI logge `models.jobs.persistence_disabled` et les téléchargements restent transitoires dans l’UI.
- **Redémarrage requis** : toute modification des fichiers `.env` du service doit être suivie d’un `Ctrl+C` / relance de `uvicorn` pour que les variables (DSN, tokens) soient prises en compte.
- **Contrôle UI** : `/fr/admin/models` affiche désormais la file et l’historique via `/api/v1/models/jobs`. Vérifier après déploiement avec `curl -H "Authorization: Bearer $RAG_AUTH_TOKEN" http://localhost:8000/api/v1/models/jobs`.
- **Tests associés** : `services/rag-api/tests/test_models_api.py` couvre la lecture/persistance et `apps/web/tests/e2e/chat-history-badge.spec.ts` valide l’actualisation du compteur côté UI. Exécuter ces suites avant toute PR.

## Intégration Next.js ↔ FastAPI

- `apps/web/src/lib/rag.ts` centralise les appels (`triggerWebIngestion`, `deleteFromCollection`, `ragApiJson`).
- `apps/web/src/lib/rag-sync.ts` reconstruit les collections `kb_<slug>` lorsque nécessaire et gère les documents manquants.
- `apps/web/src/lib/rag-sync-scheduler.ts` planifie des relances côté Next.js hors environnement de test.
- Routes API Next.js mises à jour :
- `/api/chat` relaye les complétions SSE et sauvegarde l’historique Prisma,
- `/api/chat` relaye les complétions SSE, enrichit les prompts avec SearxNG et conserve désormais les métadonnées de sources (vector/web/fallback) dans `ChatMessage.meta`.
  - `/api/files`, `/api/urls`, `/api/notebook` notifient la suppression au vector store,
  - `/api/kb` assure la création ou la relance `rag-sync` lors de la création d’une base.
- `apps/web/src/app/[locale]/(app)/kb/[id]/urls/_components/` gère le feedback utilisateur (messages `RAG_SERVICE_DISABLED_MESSAGE`).
- `apps/web/src/components/rag/rag-status-banner.tsx` affiche une bannière globale quand le service RAG est indisponible (s’appuie sur `/api/rag/status`, rafraîchissement 30 s).
- `/api/chat` interroge `/api/v1/search/web` pour ajouter des extraits SearxNG temps réel et republie les références côté client via l’en-tête `X-Rag-Sources` (affichage des sources dans l’UI).

### Automatisation rag-sync (FastAPI)

- La tâche périodique est activée lorsque trois variables sont présentes : `RAG_WEB_BASE_URL`, `RAG_SYNC_SERVICE_TOKEN`, `RAG_SYNC_INTERVAL_SECONDS` (> 0).
- Au démarrage, `rag_api.scheduler.start_scheduler` crée une tâche `asyncio` qui :
  1. attend 10 s (laisser le front démarrer),
  2. lit la table `KnowledgeBase` dans Postgres,
  3. appelle `POST {RAG_WEB_BASE_URL}/api/kb/{kbId}/rag/reconcile` avec le bearer `RAG_SYNC_SERVICE_TOKEN`.
- La fréquence minimale est 60 s ; mettre `RAG_SYNC_INTERVAL_SECONDS=0` désactive totalement la boucle.
- Journaux disponibles (`autosync.*`) via structlog pour suivre les succès/échecs (voir `services/rag-api/src/rag_api/scheduler.py`).

## Fonctionnement du service FastAPI

- Routes principales (`services/rag-api/src/rag_api/routes/`) :
  - `/api/v1/retrieval/process/text` pour l’ingestion de notes et fichiers texte,
  - `/api/v1/retrieval/process/web` pour l’ingestion URL asynchrone,
  - `/api/v1/retrieval/delete` pour la suppression du vecteur,
- `/api/v1/retrieval/query/doc` pour les requêtes vectorielles,
- `/api/v1/chat/completions` pour le streaming SSE,
- `/api/v1/search/web` pour les recherches SearxNG (résultats temps réel injectés dans le chat),
- `/api/v1/retrieval/jobs` et `/api/v1/retrieval/status/{documentId}` pour l’historique.
- Les services `ingestion.py`, `retrieval.py` et `vector_store.py` encapsulent LlamaIndex et la migration automatique des anciennes tables (`data-kb-...`).
- `pipelines/web.py` s’occupe des jobs SearxNG/Tika, gère les statuts `UrlEntry` et publie des événements structlog.
- `rate_limit.py` applique SlowAPI avec des clés fondées sur le token ou l’IP.

### Retrieval hybride (dense + BM25)

- Activé par défaut (`RAG_HYBRID_RETRIEVAL_ENABLED=true`). Le service combine le score vectoriel PGVector et un score BM25 (via `rank-bm25`) calculé sur les chunks de la table `data_<collection>`.
- Pondération : `RAG_HYBRID_VECTOR_WEIGHT` contrôle la part vectorielle (0–1). Le complément est appliqué au score BM25.
- Performance : `RAG_HYBRID_BM25_LIMIT` détermine le nombre de candidats renvoyés, `RAG_HYBRID_BM25_CORPUS_LIMIT` borne le nombre de chunks analysés côté SQL (par défaut 2 000).
- Désactivation : positionnez `RAG_HYBRID_RETRIEVAL_ENABLED=false` pour revenir au mode vectoriel pur (utile en test ou si Postgres ne contient pas encore les chunks).

### Mode mock vs service réel

- `USE_RAG_MOCK=true` (ou `NEXT_PUBLIC_USE_RAG_MOCK=true`) force l’utilisation du mock interne (`rag-mock.ts`). Une bannière n’est pas affichée dans ce cas.
- En mode service réel :
  - Définir `RAG_API_BASE` côté web + `RAG_AUTH_TOKEN` côté FastAPI (même valeur).
  - Désactiver explicitement `USE_RAG_MOCK`.
  - Vérifier la bannière : absence = service disponible, affichage = problème de configuration ou service hors ligne.
- L’API `/api/rag/status` retourne l’état courant (`mock`, `healthy`, `disabled`, `error`) et est utilisée par la bannière et par les tests automatisés.

## Observabilité et sécurité

- Logs structurés via structlog et métriques Prometheus (`prometheus_fastapi_instrumentator`).
- Rate limiting configuré sur chaque endpoint (5/min texte, 3/min web, 10/min delete, 60/min query, 30/min chat).
- Garde-fous payload (`RAG_MAX_TEXT_CHARS`, `RAG_MAX_JSON_BYTES`) et limitation de jobs simultanés (`RAG_MAX_CONCURRENT_JOBS`).
- Prévoir une instrumentation additionnelle (OTEL, Langfuse) pour tracer les requêtes LLM.

## Documentation API

- Schéma OpenAPI exporté dans `services/rag-api/openapi.json`.
- Regénération : `cd services/rag-api && uv run python scripts/generate-openapi.py` (voir ci-dessous) ou exécuter :

  ```bash
  cd services/rag-api
  uv run python - <<'PY'
  from pathlib import Path
  from rag_api.api import create_app
  from fastapi.openapi.utils import get_openapi
  import json

  app = create_app()
  schema = get_openapi(title=app.title, version=app.version, description=app.description, routes=app.routes)
  Path("openapi.json").write_text(json.dumps(schema, indent=2) + "\n")
  PY
  ```

- Ajouter le fichier `openapi.json` aux PR lorsqu’il change pour conserver la documentation à jour.
- Portail Swagger local : `http://localhost:8000/docs` (serveur FastAPI) expose la documentation interactive ; Redoc disponible via `http://localhost:8000/redoc`. Mettre à jour le lien correspondant dans la documentation interne si l’URL de déploiement change (ex. portail d’équipe).

## Tests recommandés

```bash
# Service FastAPI
cd services/rag-api
uv run pytest

# Pipelines web
uv run pytest tests/test_web_pipeline.py

# Front Next.js
cd apps/web
pnpm --filter web exec vitest run
pnpm --filter web exec -- playwright test
```

Avant les tests front, exécuter `pnpm --filter web exec prisma generate`.

## Checklist de validation locale

1. Démarrer l’infrastructure (`docker compose up -d`) puis lancer FastAPI (`uv run -- uvicorn rag_api.main:app --reload --host 0.0.0.0 --port 8000`) et Next.js (`pnpm --filter web dev`).
2. Vérifier l’absence de bannière rouge « Service RAG indisponible » dans l’interface (sinon consulter `/api/rag/status`).
3. Créer une base de connaissance, ingérer une note/un fichier/une URL et contrôler l’historique (`/api/v1/retrieval/jobs` + timeline UI).
4. Lancer manuellement `POST /api/kb/{kbId}/rag/reconcile` (via l’UI « Re-sync knowledge » ou via le scheduler) et vérifier les logs FastAPI `autosync.reconcile_success`.
5. Tester le chat : streaming SSE actif, conversation persistée, fallback Prisma actif si interruption volontaire du service RAG.
6. Exécuter la suite de tests : `uv run pytest`, `pnpm --filter web exec vitest run`, `pnpm --filter web exec -- playwright test`.

## Procédures de validation

1. Lancer la stack Compose et démarrer FastAPI puis Next.js avec le même token.
2. Créer une KB, ajouter note/fichier/URL et vérifier l’historique d’ingestion.
3. Exécuter `rag-sync` manuellement via `ensureCollectionForKnowledgeBase` (console Node) pour confirmer la reconstruction.
4. Tester le chat : conversation créée, streaming SSE fonctionnel, fallback Prisma en cas de panne du service.
5. Supprimer un document et contrôler la suppression côté vector store (`rag_api/services/vector_store.py`).

## Références internes

- `services/rag-api/README.md` renvoie vers ce document et fournit le rappel des commandes locales.
- `docs/api/README.md` référence les endpoints et pointe ici pour la partie conversations.
- `README.md` (racine) présente la plateforme et renvoie à cette page pour la boucle RAG.
- `docs/rag-service/deployment-playbook.md` détaille l’orchestration complète (pgvector, Ollama, secrets, validations).

### Tests Playwright

- `tests/e2e/admin-models.spec.ts` s'exécute toujours avec le mock RAG (`USE_RAG_MOCK=true`).
- `tests/e2e/admin-models-real.spec.ts` vérifie l'affichage réel sans mock. Pour le lancer :
  ```bash
  E2E_USE_RAG_MOCK=false USE_RAG_MOCK=false pnpm --filter web exec -- playwright test tests/e2e/admin-models-real.spec.ts
  ```
- Dernière exécution complète : 13 octobre 2025 à 20:50 UTC (mock + scénario réel) après correction i18n (`kb.ragStatus`), ajustement des secrets NextAuth et validation fallback GPU/CPU.
