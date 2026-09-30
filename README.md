# 🔮 Capsule AI (Dock-Orb)

> **The Domain-Agnostic AI Workspace with Persistent Capsule Memory & Model-Neutral Orchestration**

Capsule AI is a unified contextual AI operating layer that turns conversations, specifications, and project decisions into portable, persistent **Capsules**. It enables model-neutral AI routing, governed Model Context Protocol (MCP) skill execution, and semantic cost optimization.

---

## ⚡ Quick Evaluation Guide for Judges

You can run the entire platform in **one single command** using Docker, or run infrastructure services in Docker and app code locally.

### Option A: One-Command Docker Setup (Recommended)

Run the full stack (Database, Cache, Vector DB, AI Router, API, AI Microservices, and Web UI):

```bash
# 1. Clone & navigate into project root
cd Dock-orb

# 2. Launch all services with Docker Compose
npm run docker:build
# OR: docker compose -f docker/docker-compose.yml up --build -d
```

Once started, open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Option B: Local Development Setup (Infra in Docker + Local Node/Python)

**Prerequisites:** Node.js (>= 20.0), Docker & Docker Compose, Python 3.10+ (optional for local AI service).

```bash
# 1. Install dependencies across monorepo
npm install

# 2. Start infrastructure containers (PostgreSQL, Redis, Qdrant, LiteLLM)
npm run docker:up

# 3. Initialize & Seed Database (Creates schema & default evaluation data)
npm run db:setup

# 4. Start all services in dev mode (Next.js web + NestJS API)
npm run dev
```

---

## 🔑 Demo Access Credentials & Services

| Service | Access URL | Details / Credentials |
| :--- | :--- | :--- |
| **Web Interface** | `http://localhost:3000` | **Email:** `demo@capsule.ai`<br>**Password:** `password123` |
| **NestJS API** | `http://localhost:3001/api/v1` | Core REST & WebSocket Gateway |
| **Swagger API Docs** | `http://localhost:3001/docs` | Interactive OpenAPI schema & endpoint tester |
| **AI Microservices** | `http://localhost:8000/docs` | Python FastAPI (Embeddings, RAG, Intent detection) |
| **LiteLLM Gateway** | `http://localhost:4000` | Model-neutral proxy router |

---

## ✨ Key Features & Architecture Highlights

1. **🧠 Persistent Capsule Memory System**
   - Captures architectural decisions, tasks, and project specifications into structured, versioned Capsules.
   - Automatically injects capsule context into LLM conversations based on semantic relevance.

2. **🔀 Model-Neutral AI Router (LiteLLM)**
   - Unified API layer supporting OpenAI, Anthropic Claude, Google Gemini, Ollama, and local models without changing client code.
   - Fallback routing and provider priority management.

3. **🛠️ Executable MCP Skills Framework**
   - Pluggable, governed skills operating via Model Context Protocol (MCP).
   - Extensible skill packages (`@capsule-ai/skill-core`, etc.).

4. **⚡ Token & Cost Optimization**
   - Semantic query caching powered by Qdrant vector database and Redis.
   - Prevents redundant LLM calls by serving cached responses for semantically identical prompts.

5. **🖥️ Modern Interactive Dashboard**
   - Built with Next.js 15, React 19, TailwindCSS, and Framer Motion.
   - Includes real-time interactive architecture node map, workspace management, and security posture displays.

---

## 🏗️ System Topology

```
                  ┌─────────────────────────────────────┐
                  │       Next.js 15 Frontend           │
                  │        (http://localhost:3000)      │
                  └──────────────────┬──────────────────┘
                                     │ REST / WebSockets
                                     ▼
                  ┌─────────────────────────────────────┐
                  │       NestJS API Server             │
                  │        (http://localhost:3001)      │
                  └─────────┬─────────────────┬─────────┘
                            │                 │
             ┌──────────────┴──────┐   ┌──────┴──────────────┐
             │                     │   │                     │
             ▼                     ▼   ▼                     ▼
     ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
     │  PostgreSQL  │     │    Redis     │    │ AI Services  │ (Python FastAPI)
     │ (Relational) │     │ (Cache/PubSub│    │ (Embeddings) │
     └──────────────┘     └──────────────┘    └──────┬───────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │ Qdrant Vector│
                                              │   Database   │
                                              └──────────────┘
```

---

## ⚙️ Environment Variables

The repository comes pre-configured with local default `.env` settings out of the box.

If you wish to attach external AI model providers, edit `.env`:

```env
# AI Provider Keys (Optional - default local fallback provided)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
```

---

## 📂 Project Structure

```
Dock-orb/
├── apps/
│   ├── api/            # NestJS Backend (Auth, Capsules, Workspaces, WebSockets)
│   ├── web/            # Next.js 15 Frontend App (Dashboard, UI, Visualizations)
│   └── ai-services/    # Python FastAPI (SentenceTransformers, RAG, Intent)
├── packages/
│   ├── shared-types/   # TypeScript data models and interfaces
│   ├── skill-core/     # Core MCP execution handler
│   └── ai-n8n-orchestrator/ # Workflow integration package
├── docker/             # Docker compose & individual Dockerfiles
├── skills/             # Preset domain skills
├── package.json        # Turbo workspace root configuration
└── README.md           # Project documentation
```

---

## 🧰 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run docker:build` | Build and start all containers via Docker Compose |
| `npm run docker:up` | Spin up infrastructure containers (DB, Redis, Qdrant, LiteLLM) |
| `npm run docker:down` | Stop and remove all Docker containers |
| `npm run db:setup` | Push Prisma database schema and run seed script |
| `npm run dev` | Launch all apps concurrently in development mode |
| `npm run typecheck` | Run TypeScript check across all packages |
| `npm run build` | Production build for all workspace packages |

---

## 📜 License

MIT License © 2026 Capsule AI
