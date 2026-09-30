# 🏛️ Capsule AI (Dock-Orb) — Technical Architecture & System Mechanics

> **Comprehensive Technical Specifications, System Topology, Context Engine Infrastructure, and Execution Workflows**

---

## 1. Executive Architecture Overview

Capsule AI is designed as a **decoupled, multi-tier contextual AI workspace platform**. Its core purpose is to solve context fragmentation, vendor lock-in, and escalating LLM inference costs by introducing a **Persistent Capsule Memory System**, a **Model-Neutral Gateway**, an **Executable MCP Skill Framework**, and a **Semantic Cost Optimization Engine**.

### Architectural Design Principles
- **Domain Agnosticism**: Context structures (Capsules) are schema-flexible and applicable to software engineering, research, legal analysis, product management, and operational workflows.
- **Model Neutrality**: Complete abstraction from LLM provider APIs via LiteLLM proxy gateway.
- **Low-Latency Semantic Caching**: Sub-20ms cache response time for semantically equivalent queries using vector similarity search.
- **Modular Monorepo Structure**: Managed with Turborepo and NPM workspaces to maintain strict boundary isolation between web frontend, core API server, Python ML microservice, and MCP skills.

---

## 2. Multi-Tier System Topology

```text
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                                Next.js 15 Web App                               │
 │         (Dashboard, Interactive Node Map, Capsule Graph, Real-time Chat)        │
 └────────────────                        ┬                        ────────────────┘
                                          │ REST API / WebSockets (WS)
                                          ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                               NestJS Core API Gateway                           │
 │    (Auth, Workspaces, Capsules Engine, MCP Skill Runner, Cache Controller)      │
 └──────────┬─────────────────────────────┬─────────────────────────────┬──────────┘
            │                             │                             │
            ▼                             ▼                             ▼
 ┌──────────────────┐           ┌──────────────────┐          ┌────────────────────┐
 │   PostgreSQL     │           │   Redis Cache    │          │ Python AI Services │
 │ (Relational DB,  │           │ (PubSub, Session │          │  (FastAPI Micro-   │
 │ Capsules, Users) │           │ & Response Cache)│          │   service/Sidecar) │
 └──────────────────┘           └──────────────────┘          └─────────┬──────────┘
                                                                        │
                                                                        ▼
                                                              ┌────────────────────┐
                                                              │ Qdrant Vector DB   │
                                                              │ (Vector Embeddings │
                                                              │ & Similarity Search│
                                                              └────────────────────┘
                                                                        │
                                                                        ▼
                                                              ┌────────────────────┐
                                                              │    LiteLLM Proxy   │
                                                              │ (Unified Model     │
                                                              │ Router Gateway)    │
                                                              └────────────────────┘
```

---

## 3. Subsystem Breakdown

### 3.1. Persistent Capsule Memory Infrastructure (`apps/api/src/capsules`)
The Capsule system replaces stateless chat history with a structured, persistent knowledge graph:

- **Capsule Anatomy**:
  - `id`: Globally unique identifier (`cuid`).
  - `type`: Enum (`PROJECT`, `USER`, `TASK`, `CONVERSATION`, `TEAM`).
  - `content`: JSON schema storing payload data (decisions, specs, progress logs, architectural artifacts).
  - `version`: Incremental snapshot counter.
  - `parentId`: Self-referencing link enabling hierarchical capsule inheritance tree (e.g. `TASK` belongs to `PROJECT`).
- **Snapshot & Lineage Engine**: Every modification creates a `CapsuleSnapshot` record in PostgreSQL, providing an immutable audit trail and point-in-time state recovery.

### 3.2. Model-Neutral AI Router (`docker/litellm`)
- **Gateway Abstraction**: Powered by LiteLLM Proxy on port 4000.
- **Provider Interchangeability**: Standardizes requests into OpenAI format and maps them seamlessly to target providers:
  - OpenAI (`gpt-4o`, `gpt-4o-mini`)
  - Anthropic (`claude-3-5-sonnet`, `claude-3-haiku`)
  - Google Gemini (`gemini-1.5-pro`)
  - Ollama / LM Studio (Local open-weights models)
- **Automatic Fallback & Failover**: Configured in `docker/litellm/config.yaml` to failover to backup providers on HTTP 429/5xx errors without throwing failures to the user.

### 3.3. Python ML Microservice (`apps/ai-services`)
Built with **FastAPI**, **SentenceTransformers**, and **Qdrant-Client**:

- **Embedding Pipeline** (`app/api/embeddings.py`):
  - Uses `all-MiniLM-L6-v2` model generating 384-dimensional dense vector representations.
- **Vector Database (Qdrant)**:
  - Vector storage operating on port 6333 (gRPC 6334).
  - Indexes document chunks and query strings using HNSW (Hierarchical Navigable Small World) graph indexing for sub-millisecond similarity scoring.
- **Intent Classification** (`app/api/intent.py`):
  - Classifies user intent into target categories (`CODE`, `EXPLANATION`, `TASK_AUTOMATION`, `RESEARCH`) to dynamically adjust LLM parameters (e.g., lower temperature for code generation).

### 3.4. Semantic Cost Optimization Engine (`apps/api/src/optimizer`)
To optimize LLM inference budget:

1. **Exact Query Hashing**: SHA-256 hash lookup in Redis for exact query duplicates.
2. **Semantic Similarity Vector Search**:
   - Query embedding checked against Qdrant semantic cache collection.
   - Cosine similarity threshold: `≥ 0.92`.
   - If similarity score passes threshold, cached response is returned immediately.
   - Result: **0ms LLM latency, \$0 token cost**.

### 3.5. Executable MCP Skill System (`packages/skill-core`)
- Based on the **Model Context Protocol (MCP)** standard.
- Wraps external APIs and local tool handlers into sandboxed executable units.
- Workspaces configure active skills with fine-grained permission levels stored in `WorkspaceSkill` database records.

---

## 4. End-to-End Life of a User Query

```text
[User Prompt] ──► (Next.js 15 Web)
                        │
                        ▼ (WebSocket / REST)
           (NestJS API Gateway)
                        │
                        ├───► [1. Validate JWT Auth & Workspace Permissions]
                        │
                        ├───► [2. Query Semantic Cache (Redis/Qdrant)] ───► Cache Hit? ──► Return Cached Response (<20ms)
                        │                                          │ (No)
                        ▼                                          ▼
            [3. Ingest Capsule Context] ◄─── (Fetch relevant Capsules from PostgreSQL & Qdrant)
                        │
                        ▼
            [4. Route to LiteLLM Gateway] ──► (OpenAI / Anthropic / Gemini / Local Model)
                        │
                        ▼
            [5. Stream Tokens via WebSocket] ──► (Display live stream in Frontend UI)
                        │
                        └─► [6. Update Capsule Memory & Write to Semantic Cache]
```

---

## 5. Database Schema & Data Specification (Prisma ORM)

| Entity | Primary Key | Key Relations & Attributes | Description |
| :--- | :--- | :--- | :--- |
| **`User`** | `cuid` | `email`, `passwordHash`, `workspaces`, `capsules` | Core user identity & preferences |
| **`Workspace`** | `cuid` | `members`, `capsules`, `skills`, `providers` | Tenant isolation boundary |
| **`WorkspaceMember`** | `cuid` | `userId`, `workspaceId`, `role` (OWNER/ADMIN/MEMBER/VIEWER) | Access control role binding |
| **`Capsule`** | `cuid` | `workspaceId`, `userId`, `parentId`, `type`, `content` | Persistent contextual memory object |
| **`CapsuleSnapshot`**| `cuid` | `capsuleId`, `version`, `content`, `changeLog` | Point-in-time immutable version history |
| **`Conversation`** | `cuid` | `workspaceId`, `userId`, `capsuleId`, `messages` | Chat thread session linked to Capsule |
| **`Message`** | `cuid` | `conversationId`, `role`, `content`, `tokensUsed`, `cost` | Individual prompt/response log |
| **`ProviderConfig`** | `cuid` | `workspaceId`, `provider`, `apiKeyEnc`, `baseUrl` | LLM Provider settings per workspace |
| **`WorkspaceSkill`** | `cuid` | `workspaceId`, `skillPath`, `isEnabled`, `config` | Activated MCP skill tools |
| **`UsageLog`** | `cuid` | `workspaceId`, `provider`, `model`, `tokens`, `cost` | Analytics tracking ledger |
| **`SemanticCache`** | `cuid` | `queryHash`, `queryEmbedding`, `response`, `hitCount` | Cached LLM responses |

---

## 6. Monorepo Repository Structure

```
Dock-orb/
├── apps/
│   ├── api/                  # NestJS API Server (TypeScript)
│   │   ├── prisma/           # Database Schema (schema.prisma) & Seed script (seed.ts)
│   │   └── src/
│   │       ├── auth/         # JWT Authentication & RBAC Guard
│   │       ├── capsules/     # Persistent Capsule Engine & Hierarchy Service
│   │       ├── chat/         # WebSocket & REST Chat Gateways
│   │       ├── optimizer/    # Semantic Caching & Token Cost Optimization
│   │       ├── skills/       # MCP Tool Execution Infrastructure
│   │       └── workspaces/   # Multi-Tenant Management
│   ├── web/                  # Next.js 15 Web Application (React 19, Tailwind)
│   │   ├── src/app/          # App Router Pages (/workspace, /architecture, etc.)
│   │   └── src/components/   # Component System & Architecture Map
│   └── ai-services/          # Python FastAPI ML Microservice
│       ├── app/api/          # Embeddings, RAG, Intent Router API Endpoints
│       └── requirements.txt  # Python ML Dependencies
├── packages/
│   ├── shared-types/         # Cross-app TypeScript Type Definitions
│   ├── skill-core/           # Core MCP Execution Framework
│   └── ai-n8n-orchestrator/   # Workflow Orchestrator Adapter
├── docker/                   # Dockerfiles & Multi-Container Docker Compose setup
├── skills/                   # Preset Domain Skills (backend, architecture, security)
└── README.md                 # Technical Architecture & System Specification Guide
```

---

## 7. Verification & Quality Assurance

- **Type Safety**: Monorepo static checking via `npm run typecheck` (`tsc --noEmit` across all workspaces).
- **Production Build**: Verified clean static optimization and server builds via `npm run build`.
- **Database Seeding**: Verified database setup via `npm run db:setup` (`prisma db push` + `ts-node prisma/seed.ts`).
