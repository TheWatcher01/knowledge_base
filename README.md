# 📘 Knowledge Base Platform

Knowledge Base est une application **Next.js 15.5.3 / React 19.1** soutenue par
**Prisma 6** et un service **FastAPI RAG**. Elle permet aux équipes de **créer,
ingérer et interroger** leurs bases de connaissances tout en pilotant les
modèles Ollama depuis une interface moderne.

---

## 🚀 Highlights

- Authentification complète (Auth.js credentials, RBAC) et tableau de bord
  multi-KB.
- Ingestion notes/fichiers/URLs avec pipeline asynchrone (Tika, SearxNG,
  PGVector) et historisation des jobs.
- Chat persistant façon ChatGPT avec mock RAG embarqué et transition planifiée
  vers le service FastAPI temps réel.
- Console admin « Ollama jobs » pour suivre les pulls de modèles et l’état du
  backend.
- Observabilité activée (logs structurés, métriques Prometheus) et
  documentation fonctionnelle en cours de finalisation.

---

## 🛠️ Architecture

- **Frontend** : Next.js App Router + Tailwind CSS 4/shadcn-ui, React Query,
  internationalisation `next-intl`.
- **Backend** : API routes Next.js pour l’UI + service `services/rag-api`
  (FastAPI, PostgreSQL, MongoDB, Ollama).
- **Persistance** : PostgreSQL (Prisma 6), PGVector pour les embeddings,
  MongoDB pour les logs/events.
- **Ingestion** : Apache Tika pour l’extraction, SearxNG pour l’enrichissement,
  workers async gérés par FastAPI.
- **Ops** : Docker Compose pour l’écosystème (Postgres, Mongo, Tika, SearxNG,
  Ollama, RAG API), scripts PNPM pour le développement.

---

## 📂 Monorepo

```bash
knowledge_base/
├── apps/
│   └── web/           # Next.js frontend & API routes (App Router)
├── services/
│   └── rag-api/       # FastAPI RAG service (ingestion, chat, jobs)
├── docs/              # Guides, roadmap et procédures d’exploitation
├── compose.yml        # Docker Compose : Postgres, Mongo, Tika, SearxNG, Ollama
└── tmp/               # Scripts de seed/tests (mock RAG, Playwright, etc.)
```

---

## ⚡ Getting Started

### Prérequis

- Node.js 20+
- pnpm 9+
- Python 3.12+ (pour le service RAG)
- Docker + Docker Compose (recommandé pour lancer la stack complète)

### Installation

```bash
git clone https://github.com/TheWatcher01/knowledge_base.git
cd knowledge_base

pnpm install
pnpm --filter web exec prisma generate

# Facultatif mais recommandé : configurer les variables d'environnement
cp apps/web/.env.example apps/web/.env.local
```

### Lancer l’environnement

```bash
# Services externes (Postgres, Mongo, Ollama, etc.)
docker compose up -d

# Front + API Next.js (mock RAG inclus)
pnpm --filter web dev        # http://localhost:3001

# (Optionnel) Service FastAPI RAG réel
uv run uvicorn rag_api.main:app --reload --port 8000

# (Optionnel) Détection matériel / backend recommandé
python services/rag-api/scripts/hardware_probe.py
```

> Par défaut, l’application cible directement le service FastAPI ; activez
> explicitement le mock en cas de besoin via `USE_RAG_MOCK="true"`.
> Assurez-vous que `RAG_API_TOKEN` dans `.env.local` correspond à
> `RAG_AUTH_TOKEN` défini dans `compose.yml`.
> Valeur par défaut : `kb-dev-token`.

### Variables RAG utiles

- `RAG_API_BASE`, `RAG_API_TOKEN` : connexion directe au service FastAPI.
- `USE_RAG_MOCK` : bascule explicite du front vers le mock (tests E2E).
- `RAG_SYNC_SERVICE_TOKEN` : jeton partagé avec FastAPI pour les relances
  automatiques.
- `RAG_WEB_BASE_URL`, `RAG_SYNC_INTERVAL_SECONDS` (côté service FastAPI) :
  activent le job périodique de resynchronisation des connaissances.
- `RAG_EMBEDDING_BACKEND` : `auto` (défaut), `ollama`, `huggingface`.
  Ajuster `RAG_FALLBACK_EMBEDDING_DEVICE` pour forcer `cpu`/`cuda` si besoin.

---

## ✅ Feature Overview

### Authentification & accès

- Connexion/inscription via Auth.js avec mots de passe bcryptés et sessions JWT.
- Secret unifié : `AUTH_SECRET` peut rester vide côté Next.js, la configuration retombe automatiquement sur `NEXTAUTH_SECRET` (simplifie les runs Playwright/CI).
- Rôles `ADMIN`, `EDITOR`, `VIEWER` avec enforcement serveur + UI contextuelle.
- Middleware et helpers Prisma pour sécuriser chaque KB.

### Bases de connaissance & contenu

- CRUD sur les KB avec métriques (documents, dates, propriétaires).
- Notes Markdown, fichiers (upload/remplacement), URLs avec relance
  d’ingestion.
- Pipeline d’ingestion asynchrone : suivi des statuts (`queued`, `processing`,
  `synced`, `error`).

### Chat & RAG

- Conversations persistantes, renommage, suppression, deep-link
  `?conversation=`.
- Streaming SSE via API Next.js + mock RAG (fixtures Playwright,
  tests Vitest).
- Service FastAPI prêt pour l’ingestion et les jobs de modèles
  (pull/install) avant la bascule chat.
- Choix dynamique des embeddings : Ollama (GPU si disponible) ou
  SentenceTransformers HuggingFace avec détection automatique CPU/GPU.

### Administration & observabilité

- Tableau de bord des modèles Ollama (jobs planifiés, statut, erreurs).
- Logs structurés (structlog), métriques Prometheus, endpoints de supervision.
- Documentation fonctionnelle : `docs/rag-service/README.md`,
  `docs/FEATURES.md`, guides QA & utilisateur.

---

## 🧪 Tests & QA

```bash
# Tests unitaires & intégration web
pnpm --filter web exec vitest run

# Tests E2E (Playwright)
pnpm --filter web exec -- playwright test

# Tests service RAG (pytest)
uv run pytest tests/test_models_api.py
```

Avant tout commit : lint (`pnpm --filter web lint`), markdownlint,
build (`pnpm --filter web build`).

---

## 🚧 Current Priorities

1. Finaliser `rag-sync` et l’endpoint chat streaming FastAPI puis
   basculer l’UI sur ce flux (retrait du mock).
2. Stabiliser la CI GitHub Actions (services Next.js/RAG, secrets,
   base de données) pour faire passer la suite Playwright.
3. Étendre la couverture tests/doc (OpenAPI, guides de déploiement) et
   durcir le pipeline ingestion (Mongo format, Tika resiliency).

---

## 🗺️ Roadmap

### ✅ Réalisé

- Service FastAPI initialisé, ingestion texte/URLs, historisation des
  jobs.
- Migration du front vers `RAG_API_*`, mock RAG intégré côté Next.js.
- Tableau de bord Ollama + observabilité (logs, métriques).

### ⏳ En cours

- Synchronisation complète vecteurs/métadonnées (`rag-sync`).
- Endpoint chat streaming avec fallback Prisma.
- Documentation API détaillée + guides de déploiement.

### 🔜 À venir

- Intégration SearxNG temps réel dans le chat.
- Fallback embeddings (SentenceTransformers) & multi-fournisseurs LLM.
- Pipeline CI end-to-end avec Playwright sur environnement
  provisionné.

---

## 📚 Documentation utile

- `docs/rag-service/README.md` – plan de remplacement d’Open WebUI et
  TODO détaillé.
- `docs/FEATURES.md` – inventaire fonctionnel complet.
- `docs/user-guide/README.md` – guide utilisateur.
- `docs/qa/` – checklists et fixtures QA.

---

## 📖 Licence

Ce projet est open-source et distribué sous licence **MIT**.
