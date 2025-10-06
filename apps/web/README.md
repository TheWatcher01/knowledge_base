# Knowledge Base Platform

> A production-ready, full-stack knowledge management system with AI-powered chat capabilities

**Version:** 1.0.0 (MVP)  
**License:** MIT  
**Last Updated:** January 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [Project Structure](#project-structure)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [API Documentation](#api-documentation)
12. [Contributing](#contributing)
13. [Troubleshooting](#troubleshooting)
14. [Roadmap](#roadmap)
15. [License](#license)

---

## Overview

**Knowledge Base Platform** is a modern, enterprise-grade application designed to help teams organize, manage, and interact with their knowledge repositories through an intelligent chat interface. Built with Next.js 15 and powered by AI, it combines traditional document management with cutting-edge retrieval-augmented generation (RAG) capabilities.

### Key Highlights

- **AI-Powered Search**: Query your knowledge base using natural language with streaming responses
- **Multi-Format Support**: Ingest notes, files (PDF, DOCX, TXT), and web URLs
- **Role-Based Access**: Granular permissions (Admin, Editor, Viewer)
- **Conversation History**: ChatGPT-like interface with persistent conversation management
- **Multilingual**: Full internationalization support (French, English)
- **Production-Ready**: Docker-based architecture with PostgreSQL, MongoDB, and Apache Tika

---

## Features

### Authentication & Authorization

#### Authentication

- Secure credential-based authentication via [Auth.js](https://authjs.dev/)
- bcrypt password hashing with salt rounds
- JWT session management
- Automatic redirection after login/logout
- User registration endpoint (`/api/register`)

#### Role-Based Access Control (RBAC)

- **Three user roles**:
  - `ADMIN`: Full system access + user management
  - `EDITOR`: Create, modify, delete content
  - `VIEWER`: Read-only access to assigned knowledge bases
- Server-side permission validation with `assertRole` middleware
- Adaptive UI (disabled buttons for insufficient permissions)

**Related Files:**

- [`apps/web/src/lib/auth.ts`](apps/web/src/lib/auth.ts)
- [`apps/web/src/lib/authz.ts`](apps/web/src/lib/authz.ts)
- [`apps/web/middleware.ts`](apps/web/middleware.ts)

---

### Knowledge Base Management

#### CRUD Operations

- Create new knowledge bases with metadata
- List all accessible KBs (with pagination support)
- View detailed statistics (notes, files, URLs count)
- Update name and description
- Delete KB (cascade deletion of all documents and conversations)

#### Statistics & Metrics

- Document count by type (notes, files, URLs)
- Creation and last modification timestamps
- Total indexed documents for RAG

#### User Interface

- Grid/list view toggle
- Sorting options (recent, alphabetical)
- Search by name or description
- Visual cards with statistics

**Main Pages:**

- [`apps/web/src/app/[locale]/(app)/kb/page.tsx`](apps/web/src/app/[locale]/(app)/kb/page.tsx)
- [`apps/web/src/app/[locale]/(app)/kb/[id]/page.tsx`](apps/web/src/app/[locale]/(app)/kb/[id]/page.tsx)

---

### Content Management

#### 1. Notes

- Create text-based notes with Markdown support
- Inline editing with auto-save
- Delete with confirmation dialog
- Chronological listing (newest first)
- Automatic RAG indexing

**Components:**

- [`apps/web/src/app/[locale]/(app)/kb/[id]/notes/_components/note-actions.tsx`](apps/web/src/app/[locale]/(app)/kb/[id]/notes/_components/note-actions.tsx)

#### 2. Files

- Upload files (PDF, DOCX, TXT, and more)
- Automatic parsing via [Apache Tika](https://tika.apache.org/)
- Binary storage in PostgreSQL (BYTEA)
- Download original files
- Rename and replace files
- Delete with confirmation
- Display metadata (size, MIME type, upload date)

**API Endpoints:**

- `POST /api/files` - Upload file
- `PATCH /api/files/[id]` - Update file
- `DELETE /api/files/[id]` - Delete file

**Related Files:**

- [`apps/web/src/app/api/files/route.ts`](apps/web/src/app/api/files/route.ts)
- [`apps/web/src/app/api/files/[id]/route.ts`](apps/web/src/app/api/files/[id]/route.ts)

#### 3. URLs

- Add external links with title and description
- Ingestion status tracking: `DRAFT`, `QUEUED`, `SYNCED`, `ERROR`
- Automatic ingestion via [SearxNG](https://docs.searxng.org/)
- Manual re-indexing ("Retry Ingestion" button)
- Edit and delete URLs

**Components:**

- [`apps/web/src/app/[locale]/(app)/kb/[id]/urls/page.tsx`](apps/web/src/app/[locale]/(app)/kb/[id]/urls/page.tsx)

---

### AI Chat & Conversations

#### Core Features

- Real-time chat with Server-Sent Events (SSE) streaming
- [Open-WebUI](https://github.com/open-webui/open-webui) integration for RAG
- LLM model selection (Ollama: Llama, Qwen, DeepSeek, etc.)
- Conversation persistence in PostgreSQL
- ChatGPT-like conversation history sidebar
- Rename and delete conversations
- Dynamic history loading
- URL synchronization with `?conversation=` parameter

#### Conversation Management

- Auto-create conversation on first message
- Auto-generated titles (based on first message)
- Inline actions: rename (pencil icon), delete (trash icon)
- Rename modal with validation
- Delete confirmation dialog
- Relative timestamps (e.g., "2 hours ago")

#### Complete REST API

```http
GET    /api/kb/:id/chat/conversations                      # List conversations
POST   /api/kb/:id/chat/conversations                      # Create conversation
GET    /api/kb/:id/chat/conversations/:conversationId      # Get details + messages
PATCH  /api/kb/:id/chat/conversations/:conversationId      # Rename conversation
DELETE /api/kb/:id/chat/conversations/:conversationId      # Delete conversation
POST   /api/chat                                           # Send message (with optional conversationId)
```

**Detailed Documentation:**

- [`docs/chat-persistence-plan.md`](docs/chat-persistence-plan.md)

---

### Internationalization

- **Multi-language support**: French, English
- **Automatic locale detection**
- **Complete UI translations**
- **Localized formatting**: dates, times, numbers
- **Locale-prefixed URLs**: `/fr/kb`, `/en/kb`

**Library:** [next-intl](https://next-intl-docs.vercel.app/)

**Translation Files:**

- [`apps/web/src/i18n/messages/fr.json`](apps/web/src/i18n/messages/fr.json)
- [`apps/web/src/i18n/messages/en.json`](apps/web/src/i18n/messages/en.json)

---

### Application UI

#### Theme & Design

- Dark mode and light mode with system preference detection
- Design system based on [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- WCAG 2.1 accessible components (ARIA labels, focus management)
- Responsive design (mobile, tablet, desktop)

#### UI Components

- Syntax-highlighted code blocks ([`code-block/index.tsx`](apps/web/src/components/ui/shadcn-io/code-block/index.tsx))
- Toast notifications (success, error, info)
- Modal dialogs and confirmations
- Dropdown menus and context menus
- Cards (KB, notes, files, URLs)
- Forms with Zod validation

**Theme Component:**

- [`apps/web/src/components/theme-toggle.tsx`](apps/web/src/components/theme-toggle.tsx)

---

### External Integrations

#### Docker Services

- **PostgreSQL**: Primary database (users, KB, documents, conversations)
- **MongoDB**: Logs and analytics
- **Apache Tika**: File parsing and text extraction
- **SearxNG**: URL indexing and web scraping
- **Open-WebUI**: RAG and LLM orchestration
- **Ollama**: Local LLM models

#### Orchestration

- Docker Compose for local development
- `.env` configuration for secrets
- Persistent volumes for data

**File:** [`compose.yml`](compose.yml)

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.x | React framework (App Router) |
| [React](https://react.dev/) | 19.x | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Component library |
| [next-intl](https://next-intl-docs.vercel.app/) | Latest | Internationalization |
| [Zod](https://zod.dev/) | 4.x | Schema validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Prisma](https://www.prisma.io/) | Latest | ORM for PostgreSQL |
| [Auth.js](https://authjs.dev/) | Latest | Authentication |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | 6.x | Password hashing |
| [formidable](https://www.npmjs.com/package/formidable) | 3.x | File uploads |
| [AI SDK](https://sdk.vercel.ai/) | 5.x | LLM streaming |

### Database & Storage

- **PostgreSQL** 16.x (relational data)
- **MongoDB** 8.x (logs, analytics)

### Testing & Quality

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev/) | Unit testing |
| [React Testing Library](https://testing-library.com/react) | Component testing |
| [ESLint](https://eslint.org/) | Code linting |
| [Prettier](https://prettier.io/) | Code formatting |
| TypeScript (strict mode) | Type checking |

---

## Architecture

### High-Level Overview

```md
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                       │
│  (React 19 + App Router + shadcn/ui + Tailwind CSS)       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/SSE
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Next.js API Routes                       │
│        (/api/auth, /api/kb, /api/files, /api/chat)        │
└────┬────────────────────┬────────────────────┬─────────────┘
     │                    │                    │
     │ Prisma ORM         │ MongoDB Driver     │ HTTP Client
     │                    │                    │
┌────▼─────┐       ┌─────▼──────┐      ┌──────▼────────┐
│PostgreSQL│       │  MongoDB   │      │  Open-WebUI   │
│  (Data)  │       │   (Logs)   │      │     (RAG)     │
└──────────┘       └────────────┘      └───────┬───────┘
                                               │
                                        ┌──────▼───────┐
                                        │    Ollama    │
                                        │    (LLMs)    │
                                        └──────────────┘
```

### Database Schema (Prisma)

**Core Models:**

- `User` - Authentication and profile
- `KnowledgeBase` - KB metadata
- `Document` - Notes, files, URLs
- `Conversation` - Chat history
- `Message` - Individual chat messages

**Key Relationships:**

- User 1:N KnowledgeBase
- KnowledgeBase 1:N Document
- KnowledgeBase 1:N Conversation
- Conversation 1:N Message

See [`apps/web/prisma/schema.prisma`](apps/web/prisma/schema.prisma) for full schema.

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **pnpm** >= 10.x (recommended)
- **Docker** >= 24.x
- **Docker Compose** >= 2.x

### Quick Start

#### 1. Clone the repository

```bash
git clone https://github.com/TheWatcher01/knowledge_base.git
cd knowledge_base
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/knowledge_base"
MONGODB_URI="mongodb://localhost:27017/knowledge_base_logs"

# Auth.js
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key-here"

# Open-WebUI
OPENWEBUI_API_URL="http://localhost:3000/api"
OPENWEBUI_API_KEY="your-openwebui-api-key"

# Apache Tika
TIKA_SERVER_URL="http://localhost:9998"

# SearxNG
SEARXNG_API_URL="http://localhost:8080"
```

#### 4. Start Docker services

```bash
docker compose up -d
```

**Services started:**

- PostgreSQL: `localhost:5432`
- MongoDB: `localhost:27017`
- Apache Tika: `localhost:9998`
- SearxNG: `localhost:8080`
- Open-WebUI: `localhost:3000`
- Ollama: `localhost:11434`

#### 5. Run database migrations

```bash
cd apps/web
npx prisma migrate dev
npx prisma generate
```

#### 6. Seed sample data (optional)

```bash
pnpm --filter web run seed:authz-fixtures
```

**Test accounts created:**

- Admin: `admin@test.local` / `password123`
- Editor: `editor@test.local` / `password123`
- Viewer: `viewer@test.local` / `password123`

#### 7. Start development server

```bash
pnpm --filter web dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Project Structure

```md
knowledge_base/
├── .codex/                     # Code analysis and audits
├── .turbo/                     # Turborepo cache
├── .vscode/                    # VS Code settings
├── apps/
│   └── web/                    # Next.js application
│       ├── prisma/             # Database schema and migrations
│       ├── public/             # Static assets
│       ├── scripts/            # Seed scripts
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   │   ├── api/        # API routes
│       │   │   └── [locale]/   # Localized pages
│       │   ├── components/     # React components
│       │   ├── i18n/           # Internationalization
│       │   ├── lib/            # Utilities and helpers
│       │   └── styles/         # Global styles
│       ├── .env.example        # Environment template
│       ├── next.config.ts      # Next.js configuration
│       ├── package.json        # Dependencies
│       ├── tailwind.config.ts  # Tailwind configuration
│       └── tsconfig.json       # TypeScript configuration
├── docs/                       # Documentation
│   ├── api/                    # API reference
│   ├── architecture/           # System architecture
│   ├── operations/             # Deployment guides
│   ├── qa/                     # QA checklists
│   └── user-guide/             # User documentation
├── searxng/                    # SearxNG configuration
├── screenshot/                 # Application screenshots
├── compose.yml                 # Docker Compose configuration
├── package.json                # Monorepo root package
├── pnpm-workspace.yaml         # pnpm workspace config
└── README.md                   # This file
```

---

## Configuration

### Environment Variables

**Required:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/kb` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Random 32+ char string |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3001` |

**Optional:**

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kb_logs` |
| `OPENWEBUI_API_URL` | Open-WebUI API endpoint | `http://localhost:3000/api` |
| `OPENWEBUI_API_KEY` | Open-WebUI API key | Empty (disable RAG) |
| `TIKA_SERVER_URL` | Apache Tika endpoint | `http://localhost:9998` |
| `SEARXNG_API_URL` | SearxNG endpoint | `http://localhost:8080` |
| `NODE_ENV` | Environment | `development` |

### Prisma Configuration

**Run migrations:**

```bash
npx prisma migrate dev --name <migration_name>
```

**Generate client:**

```bash
npx prisma generate
```

**Open Prisma Studio:**

```bash
npx prisma studio
```

---

## Development

### Common Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter web dev

# Build production
pnpm --filter web build

# Start production server
pnpm --filter web start

# Lint code
pnpm --filter web lint

# Format code
pnpm --filter web format

# Run tests
pnpm --filter web test

# Run tests in watch mode
pnpm --filter web test:watch

# Type check
pnpm --filter web type-check
```

### Adding a New Feature

1. **Create feature branch:**

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes:**
   - Add components in `src/components/`
   - Add API routes in `src/app/api/`
   - Update Prisma schema if needed
   - Add translations to `src/i18n/messages/`

3. **Run migrations (if schema changed):**

   ```bash
   npx prisma migrate dev --name add_my_feature
   ```

4. **Test locally:**

   ```bash
   pnpm --filter web dev
   ```

5. **Commit and push:**

   ```bash
   git add .
   git commit -m "feat: add my new feature"
   git push origin feature/my-new-feature
   ```

6. **Open Pull Request**

---

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
pnpm --filter web test
```

**Example test:**

```typescript
// apps/web/src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });
});
```

### Integration Tests

**Testing API routes:**

```typescript
// apps/web/src/app/api/kb/route.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from './route';

describe('GET /api/kb', () => {
  it('should return 401 when unauthenticated', async () => {
    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);
    expect(response.status).toBe(401);
  });
});
```

### End-to-End Tests (Planned)

**Using Playwright:**

```bash
# Install Playwright
pnpm add -D @playwright/test

# Run E2E tests
pnpm --filter web test:e2e
```

**Example E2E test:**

```typescript
// apps/web/tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('http://localhost:3001/login');
  await page.fill('input[name="email"]', 'admin@test.local');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/.*\/kb/);
});
```

### QA Checklists

Manual testing checklists are available in [`docs/qa/`](docs/qa/):

- [`authz-qa-checklist.md`](docs/qa/authz-qa-checklist.md) - Role-based permissions testing

---

## Deployment

### Docker Production Build

#### 1. Build production image

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter web build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

#### 2. Build and run

```bash
docker build -t knowledge-base:latest .
docker run -p 3000:3000 --env-file .env knowledge-base:latest
```

### Vercel Deployment

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Link project

```bash
cd apps/web
vercel link
```

#### 3. Set environment variables

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
# ... add other variables
```

#### 4. Deploy

```bash
vercel --prod
```

**Environment variables required:**

- `DATABASE_URL` (use Vercel Postgres or external PostgreSQL)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production domain)
- `OPENWEBUI_API_URL` (if using RAG)
- `OPENWEBUI_API_KEY`

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS certificates configured
- [ ] CORS settings reviewed
- [ ] Rate limiting enabled
- [ ] Monitoring configured (Sentry, Datadog, etc.)
- [ ] Backup strategy in place
- [ ] CDN configured for static assets
- [ ] Health check endpoint (`/api/health`)

---

## API Documentation

### API Authentication

#### Register

```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "id": "clxxx...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "VIEWER"
}
```

#### Login

```http
POST /api/auth/callback/credentials
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Knowledge Bases

#### List KBs

```http
GET /api/kb
Authorization: Bearer <session_token>
```

**Response:**

```json
[
  {
    "id": "clxxx...",
    "name": "My Knowledge Base",
    "description": "Contains project documentation",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-20T15:30:00.000Z",
    "_count": {
      "documents": 42
    }
  }
]
```

#### Create KB

```http
POST /api/kb
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "name": "New Knowledge Base",
  "description": "Optional description"
}
```

### Conversations

See full API documentation: [`docs/chat-persistence-plan.md`](docs/chat-persistence-plan.md)

#### List Conversations

```http
GET /api/kb/{kbId}/chat/conversations
Authorization: Bearer <session_token>
```

**Response:**

```json
[
  {
    "id": "conv_xxx",
    "title": "How to deploy Next.js",
    "createdAt": "2025-01-20T10:00:00.000Z",
    "updatedAt": "2025-01-20T10:15:00.000Z",
    "messageCount": 8
  }
]
```

#### Send Message

```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "kbId": "clxxx...",
  "conversationId": "conv_xxx",
  "message": "What is RAG?",
  "model": "qwen2.5:32b"
}
```

**Response:** Server-Sent Events (SSE) stream

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** rules (run `pnpm lint`)
- Format code with **Prettier** (run `pnpm format`)
- Write **descriptive commit messages** following [Conventional Commits](https://www.conventionalcommits.org/)

**Commit message format:**

```git
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**

```git
feat(chat): add conversation rename functionality

- Add rename modal with validation
- Update API route PATCH /api/kb/:id/chat/conversations/:conversationId
- Add i18n translations for fr/en

Closes #123
```

### Pull Request Process

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

**PR Checklist:**

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if applicable)
- [ ] No new warnings or errors
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)

### Reporting Bugs

**Before submitting:**

- Check existing issues to avoid duplicates
- Collect relevant information (browser, OS, Node version)

**Bug report template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.2]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 20.10.0]
- pnpm version: [e.g., 10.17.0]

**Additional context**
Any other relevant information.
```

---

## Troubleshooting

### Common Issues

#### Database connection errors

**Error:** `Connection refused` or `ECONNREFUSED`

**Solution:**

```bash
# Check if PostgreSQL is running
docker compose ps

# Restart services
docker compose restart postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

#### Prisma migration errors

**Error:** `Migration failed`

**Solution:**

```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Or manually fix migration
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate deploy
```

#### Open-WebUI connection issues

**Error:** `Failed to fetch from Open-WebUI`

**Solution:**

```bash
# Check if Open-WebUI is running
curl http://localhost:3000/api/health

# Check API key
echo $OPENWEBUI_API_KEY

# Verify network
docker compose logs openwebui
```

#### File upload failing

**Error:** `Tika server unreachable`

**Solution:**

```bash
# Check Tika service
docker compose ps tika

# Test Tika
curl -X PUT --data-binary @test.pdf http://localhost:9998/tika --header "Accept: text/plain"

# Restart Tika
docker compose restart tika
```

#### Build errors

**Error:** `Module not found` or `Cannot find module`

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules .next apps/web/.next
pnpm install
pnpm --filter web build
```

### Debugging

**Enable verbose logging:**

```env
# .env
DEBUG=*
LOG_LEVEL=debug
```

**Check logs:**

```bash
# Application logs
pnpm --filter web dev | tee app.log

# Docker logs
docker compose logs -f

# Specific service logs
docker compose logs -f postgres
docker compose logs -f openwebui
```

**Prisma debugging:**

```env
# .env
DEBUG=prisma:*
```

### Getting Help

- **Documentation**: Check [`docs/`](docs/) directory
- **Issues**: Search [GitHub Issues](https://github.com/TheWatcher01/knowledge_base/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/TheWatcher01/knowledge_base/discussions)
- **Community**: Discord/Slack (link here)

---

## Roadmap

### Completed

- [x] User authentication (register, login, JWT sessions)
- [x] Dashboard with Knowledge Base CRUD
- [x] Notes CRUD with RAG ingestion
- [x] File uploads with Apache Tika parsing
- [x] URL ingestion via SearxNG
- [x] Chat interface with SSE streaming
- [x] Conversation persistence in PostgreSQL
- [x] ChatGPT-like conversation history
- [x] Role-based access control (RBAC)
- [x] Internationalization (French, English)
- [x] Dark mode support
- [x] Usage logs (MongoDB)

### In Progress

- [ ] Automated testing (unit, integration, E2E)
- [ ] Complete API documentation
- [ ] User guide and tutorials
- [ ] Deployment to staging environment
- [ ] Auto-generated conversation titles

### Short Term (Q1 2025)

- [ ] **Export conversations** (JSON, Markdown, PDF)
- [ ] **Full-text search** in conversation history
- [ ] **Message pagination** (conversations > 100 messages)
- [ ] **Share conversations** (public links)
- [ ] **Tags and categories** for KBs
- [ ] **Advanced filters** (by date, model, sources)
- [ ] **Keyboard shortcuts** (Vim-like navigation)

### Medium Term (Q2-Q3 2025)

- [ ] **Real-time collaboration** (multi-user editing)
- [ ] **Push notifications** (new messages, ingestion complete)
- [ ] **AI Studio** (audio summaries, video generation, mindmaps)
- [ ] **Public API** with OAuth authentication
- [ ] **Webhook integrations** (Slack, Discord, Teams)
- [ ] **Advanced analytics** (usage dashboards, insights)
- [ ] **Mobile apps** (React Native)

### Long Term (2026+)

- [ ] **Plugin system** (community extensions)
- [ ] **Self-hosted LLMs** (local Ollama clusters)
- [ ] **Enterprise features** (SSO, audit logs, compliance)
- [ ] **Multi-tenancy** (organizations, teams)
- [ ] **Advanced RAG** (hybrid search, reranking, citations)
- [ ] **Voice interface** (speech-to-text, text-to-speech)

**Feature Requests:** [Submit here](https://github.com/TheWatcher01/knowledge_base/issues/new?template=feature_request.md)

---

## License

This project is licensed under the **MIT License**

---

## Acknowledgments

**Built with:**

- [Next.js](https://nextjs.org/) by Vercel
- [shadcn/ui](https://ui.shadcn.com/) by shadcn
- [Prisma](https://www.prisma.io/) by Prisma Data
- [Auth.js](https://authjs.dev/) by the Auth.js team
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs
- [Open-WebUI](https://github.com/open-webui/open-webui) by Open-WebUI team
- [Ollama](https://ollama.ai/) by Ollama
- [Apache Tika](https://tika.apache.org/) by Apache Foundation
- [SearxNG](https://docs.searxng.org/) by SearxNG contributors

**Special thanks to:**

- All open-source contributors
- Our beta testers
- The Next.js and React communities

---

## Contact

**Project Maintainer:** TheWatcher01
**Email:** <teddydeberdt@gmail.com>  
**GitHub:** [@TheWatcher01](https://github.com/TheWatcher01)  
**Website:** [https://yourwebsite.com](https://yourwebsite.com)

**Project Links:**

- **Repository:** [https://github.com/TheWatcher01/knowledge_base](https://github.com/TheWatcher01/knowledge_base)
- **Documentation:** [https://docs.yourwebsite.com](https://docs.yourwebsite.com)
- **Issue Tracker:** [https://github.com/TheWatcher01/knowledge_base/issues](https://github.com/TheWatcher01/knowledge_base/issues)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

### Made with ❤️ by the Knowledge Base team
