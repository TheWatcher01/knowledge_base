# 📡 API Reference

Documentation complète des endpoints REST de la plateforme.

## Endpoints disponibles

### Authentification

- [`POST /api/auth/callback/credentials`](../../apps/web/src/app/api/auth/[...nextauth]/route.ts)
- [`POST /api/register`](../../apps/web/src/app/api/register/route.ts)

### Bases de connaissance

- `GET /api/kb` - Lister les KB
- `POST /api/kb` - Créer une KB
- `PATCH /api/kb/:id` - Modifier une KB
- `DELETE /api/kb/:id` - Supprimer une KB

### Conversations

Voir [`docs/chat-persistence-plan.md`](../chat-persistence-plan.md#phase-2-api-backend) pour la documentation complète.

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
