# Plan de remplacement d’Open WebUI

## Objectif

- Remplacer l’intégration actuelle avec Open WebUI par un service RAG Python léger, modulable et réutilisable dans d’autres projets.
- Capitaliser sur les services déjà présents dans `compose.yml` (Ollama, SearxNG, Tika, Postgres, Mongo) et sur les briques applicatives existantes (`apps/web`).

## Intégration actuelle d’Open WebUI

- Points d’entrée : `apps/web/src/lib/rag.ts`, `apps/web/src/lib/rag-sync.ts`, `apps/web/src/app/api/{chat,files,urls,urls/[id],kb/[id],notebook}/route.ts`.
- Configuration : variables `RAG_API_BASE`, `RAG_API_TOKEN`, `MOCK_OPEN_WEBUI` définies dans l’environnement et utilisées via `apps/web/src/lib/config.ts`.
- Cas d’usage :
  - Chat streaming (`/api/v1/chat/completions`) depuis `apps/web/src/app/api/chat/route.ts`.
  - Ingestion texte/fichiers (`/api/v1/retrieval/process/text`) pour notes et fichiers.
  - Ingestion web (`/api/v1/retrieval/process/web`) et suppression (`/api/v1/retrieval/delete`) pour synchroniser les connaissances.
  - Vérification de collection et relance des embeddings via `rag-sync`.
- Fallback local déjà en place (chargement Prisma/Mongo lorsque la collection RAG est indisponible).

## Services et outils déjà disponibles

- **Infrastructure docker** (`compose.yml`) :
  - `ollama` (LLM local, GPU ready) pour l’inférence.
  - `searxng` (métamoteur) exploité par Open WebUI pour la recherche web.
  - `tika` pour l’extraction de texte depuis les documents.
  - `postgres` (utilisé par Prisma) et `mongo` (knowledge store et caches).
- **Application web** :
  - Next.js 15 (`apps/web`) avec API routes et streaming.
  - ORM Prisma (Postgres) + stockage binaire des fichiers.
  - Knowledge store Mongo (`apps/web/src/lib/knowledge-store.ts`) mis à jour lors de chaque ingestion.
  - Scripts Node pour seeds et synchronisation (`apps/web/scripts/*`).
- **Tooling Node** : Vitest, Playwright, ESLint, Prettier, pipelines déjà gérés par pnpm (workspace).

## Stack Python proposée

- **Service HTTP** : FastAPI + Uvicorn pour servir des endpoints compatibles avec l’interface actuelle (chat, ingestion texte/web, suppression).
- **Orchestration RAG** :
  - LlamaIndex pour unifier l’ingestion (documents texte, URLs) et piloter Ollama comme moteur LLM/embedding.
  - LangChain pour composer les chaînes de génération (chat completions, streaming SSE) et gérer les prompts.
- **Vector Store** :
  - Option 1 : réutiliser Postgres en y activant l’extension `pgvector` pour centraliser la donnée.  
  - Option 2 : intégrer un store spécialisé (Chroma, Qdrant) si besoin de performances supérieures.
- **Fonctions critiques à couvrir** :
  - Ingestion texte : endpoint `/api/v1/retrieval/process/text` équivalent.
  - Ingestion web : orchestrer l’extraction via Tika + web scraping (SearxNG + fetch) et lancer l’embedding.
  - Chat : endpoint `/api/v1/chat/completions` avec streaming pour maintenir le comportement de l’UI.
  - Maintenance : suppression de documents, vérification d’existence de collection, re-embedding (`rag-sync`).
- **Déploiement** : conteneur dédié (`services/rag-api`) dans `compose.yml`, dépendant de `ollama`, `mongo`, `postgres`, `tika`, `searxng`.

## Outils complémentaires à envisager

- Gestion de tâches/queues : Celery + Redis ou Dramatiq pour déporter les ingestions coûteuses.
- Observabilité : Langfuse ou OpenTelemetry pour tracer les requêtes LLM.
- Tests : Pytest + httpx pour couvrir les endpoints ; Vitest côté Next.js pour les intégrations.
- Packaging : `uv` ou `poetry` pour gérer l’environnement Python, avec un lockfile fiable.
- Authentification : sécuriser le service via jeton (`RAG_API_TOKEN`) et rate limiting (SlowAPI).

## Plan de migration

1. **Prototype** : exposer des endpoints FastAPI mimant ceux d’Open WebUI (ingestion texte & chat minimal) et les connecter à Ollama en local.
2. **Vector store** : choisir le backend (Postgres/pgvector ou base dédiée), implémenter la création de collections par `kbId`.
3. **Ingestion** : implémenter les routes texte/fichiers/URL et intégrer Tika + SearxNG ; mettre à jour `knowledge-store` via une API dédiée ou directement Mongo.
4. **Chat** : brancher l’endpoint `/api/v1/chat/completions` sur LangChain/LlamaIndex avec streaming, fallback Prisma existant conservé.
5. **Intégration Next.js** : modifier `apps/web/src/lib/rag.ts` pour viser le nouveau service (`RAG_API_BASE`) et ajuster l’authentification.
6. **Observabilité & sécurité** : ajouter logs, métriques, authentification par jeton, limiter la surface réseau.
7. **Décommission Open WebUI** : retirer le service du compose, nettoyer les variables héritées, mettre à jour la documentation utilisateur.

## Points d’attention

- Streaming SSE côté LangChain/Ollama à valider (limites connues avec la classe `ChatOllama`; fallback possible via websockets).
- Temps d’ingestion : prévoir une file asynchrone pour les gros documents/web crawl.
- Gestion des erreurs : les messages côté UI reflètent désormais le libellé « RAG service integration is disabled. »
- Montée en charge : surveiller l’impact GPU d’Ollama et la taille des embeddings dans Postgres/Mongo.
