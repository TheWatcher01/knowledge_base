# 📡 API Reference

Documentation complète des endpoints REST de la plateforme.

## Endpoints disponibles

### Authentification

- [`POST /api/auth/callback/credentials`](../../apps/web/src/app/api/auth/[...nextauth]/route.ts)
- [`POST /api/register`](../../apps/web/src/app/api/register/route.ts)
- Le middleware Next.js (`apps/web/middleware.ts`) et la configuration NextAuth acceptent désormais `AUTH_SECRET` ou, par défaut, `NEXTAUTH_SECRET`.

### Bases de connaissance

- `GET /api/kb` - Lister les KB
- `POST /api/kb` - Créer une KB
- `PATCH /api/kb/:id` - Modifier une KB
- `DELETE /api/kb/:id` - Supprimer une KB

### Conversations

- [`POST /api/chat`](../../apps/web/src/app/api/chat/route.ts) — orchestrateur Next.js qui persiste les conversations et relaie le service RAG.
- [`POST /api/v1/chat/completions`](../../services/rag-api/src/rag_api/routes/chat.py) — endpoint FastAPI en streaming SSE.
- Pour le détail fonctionnel (roadmap, intégration RAG), se référer à [`docs/rag-service/README.md`](../rag-service/README.md).
- [`GET /api/rag/status`](../../apps/web/src/app/api/rag/status/route.ts) — état temps réel du service RAG (utilisé par la bannière de disponibilité).

### Fichiers

- [`POST /api/files`](../../apps/web/src/app/api/files/route.ts)
- [`PATCH /api/files/:id`](../../apps/web/src/app/api/files/[id]/route.ts)
- [`DELETE /api/files/:id`](../../apps/web/src/app/api/files/[id]/route.ts)

### URLs

- [`POST /api/urls`](../../apps/web/src/app/api/urls/route.ts)
- [`PATCH /api/urls/:id`](../../apps/web/src/app/api/urls/[id]/route.ts)
- [`DELETE /api/urls/:id`](../../apps/web/src/app/api/urls/[id]/route.ts)

### RAG Service

- [`POST /api/v1/retrieval/process/text`](../../services/rag-api/src/rag_api/routes/retrieval.py)
- [`POST /api/v1/retrieval/process/web`](../../services/rag-api/src/rag_api/routes/retrieval.py)
- [`POST /api/v1/retrieval/delete`](../../services/rag-api/src/rag_api/routes/retrieval.py)
- [`GET /api/v1/retrieval/status/:documentId`](../../services/rag-api/src/rag_api/routes/retrieval.py)
- [`POST /api/v1/retrieval/query/doc`](../../services/rag-api/src/rag_api/routes/retrieval.py)
- [`POST /api/v1/chat/completions`](../../services/rag-api/src/rag_api/routes/chat.py)
- [`GET /metrics`](../../services/rag-api/src/rag_api/api.py)
- [`POST /api/v1/search/web`](../../services/rag-api/src/rag_api/routes/search.py)
- OpenAPI complet : `services/rag-api/openapi.json` (regénéré via `uv run python scripts/generate-openapi.py`).
- Swagger UI local : `http://localhost:8000/docs` — à mettre à jour avec l’URL du portail hébergé si différente.
