# 📘 Knowledge Base Platform

A **full-stack Knowledge Base application** built with **Next.js (App Router)**, **TailwindCSS / shadcn/ui**, **Prisma**, and **Auth.js**.
The platform allows users to **create, ingest, and query knowledge bases** through a modern web interface, while delegating RAG (Retrieval-Augmented Generation) and LLM processing to an in-house FastAPI service powered by Ollama, LlamaIndex et LangChain.

---

## 🚀 Features

* **User Authentication** with [Auth.js](https://authjs.dev/) (credentials provider, bcrypt, JWT).
* **Dashboard** for managing personal Knowledge Bases (CRUD).
* **Knowledge Base content ingestion**:

  * Notes (text CRUD).
  * Files (uploaded, parsed via [Apache Tika](https://tika.apache.org/), ingested in RAG).
  * URLs (indexed with [SearxNG](https://docs.searxng.org/), ingested in RAG).
* **Chat interface**: query your knowledge base with streaming completions via the RAG API (FastAPI + Ollama).
* **Backend logging**: track usage and events (MongoDB).
* **Dockerized services**: PostgreSQL, MongoDB, Tika, SearxNG, Ollama, RAG API service.

---

## 🛠️ Tech Stack

* **Frontend / Backend**: [Next.js 14](https://nextjs.org/) (App Router)
* **UI**: [TailwindCSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
* **Authentication**: [Auth.js](https://authjs.dev/)
* **Database**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)
* **NoSQL Logging**: MongoDB
* **RAG / LLM**: FastAPI service (`services/rag-api`) + [Ollama](https://ollama.com/), orchestrated with [LlamaIndex](https://www.llamaindex.ai/) & [LangChain](https://www.langchain.com/)
* **File Parsing**: [Apache Tika](https://tika.apache.org/)
* **Web Crawling**: [SearxNG](https://docs.searxng.org/)
* **Deployment**: Docker Compose

---

## 📂 Monorepo Structure

```bash
knowledge_base/
├── apps/
│   └── web/           # Next.js frontend / backend (App Router)
├── services/
│   └── rag-api/       # FastAPI microservice (Ollama, LlamaIndex, LangChain)
├── docs/              # Guides & migration notes (incl. RAG service plan)
├── compose.yml        # Docker services: Postgres, Mongo, Tika, SearxNG, Ollama, RAG API
└── screenshot/        # Assets & previews
```

---

## ⚡ Getting Started

### Prerequisites

* Node.js 20+
* PNPM
* Docker + Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/TheWatcher01/knowledge_base.git
cd knowledge_base

# Install dependencies
pnpm install
```

### Development

```bash
# Start Docker services (DBs, Tika, SearxNG, Ollama, RAG API)
docker compose up -d

# Start the web app
cd apps/web
pnpm dev
```

The app will be available at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 📌 Roadmap

* [x] User authentication (register, login).
* [x] Dashboard with Knowledge Base CRUD.
* [ ] Notes CRUD with ingestion.
* [ ] File uploads → Tika → ingestion.
* [ ] URL ingestion via SearxNG.
* [ ] Chat interface (SSE streaming).
* [ ] Usage logs (MongoDB).
* [ ] Documentation (MCD/MLD, C4 diagrams, user guide).

---

## 📖 License

This project is open-source and available under the **MIT License**.
