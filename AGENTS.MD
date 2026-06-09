# OpenVScan - AI Agent Context Guide

## Project Overview

**OpenVScan** is a web-based vulnerability scanner that integrates open-source security tools with AI to deliver smarter, faster, and more reliable pre-production security testing. The platform combines trusted security scanners (OWASP ZAP, Nmap, Trivy) with AI-driven analysis for vulnerability deduplication, triage, and remediation guidance.

**Repository**: https://github.com/Buddhsen-tripathi/openvscan
**Creator**: Buddhsen Tripathi
**License**: GNU Affero General Public License v3.0 only
**Live Preview**: https://openvscan-web.buddhsen-work.workers.dev/

---

## Architecture Overview

OpenVScan follows a modern full-stack architecture with clear separation of concerns:

| Tier | Stack | Responsibilities |
|------|-------|------------------|
| **UI** (`web/`) | TanStack Start, React 19, Tailwind CSS, Cloudflare Workers | Scan setup, dashboards, reporting, multi-tenant UX |
| **API** (`api/`) | NestJS 11, TypeScript, PostgreSQL ORM | Projects, auth, scan orchestration, findings API |
| **Workers** (`workers/`) | Node.js, BullMQ, Redis | Execute scanners, aggregate artifacts, stream telemetry |
| **Storage** | PostgreSQL, Redis | Metadata, artifacts, coordination primitives |
| **AI Services** | LLM providers | Summaries, deduplication, remediation guidance |

---

## Repository Structure

```
openvscan/
├── api/                    # NestJS 11 backend service
│   ├── src/
│   │   ├── common/        # AuthGuard, exception filter, logging interceptor
│   │   ├── database/      # Drizzle provider + module (schema in packages/db)
│   │   ├── queue/         # BullMQ configuration (retry, backoff)
│   │   ├── scan/          # Scan CRUD, cancel, export (JSON/SARIF)
│   │   ├── project/       # Project CRUD with multi-tenant isolation
│   │   ├── app.module.ts  # Root module (ThrottlerModule for rate limiting)
│   │   └── main.ts        # Application entry point
│   ├── database/          # Drizzle migrations
│   ├── .env               # API environment variables
│   └── package.json       # Dependencies
│
├── web/                   # TanStack Start / React 19 frontend
│   ├── src/
│   │   ├── routes/        # TanStack Router routes + server auth handler
│   │   ├── lib/           # Start server functions and Worker env helpers
│   │   └── styles.css     # Tailwind CSS entry
│   ├── components/
│   │   ├── dashboard/     # Sidebar, ProjectList, CreateScanForm, DashboardContext
│   │   └── ui/            # Shared UI components
│   ├── lib/               # API client, Better Auth, utilities
│   ├── vite.config.ts     # TanStack Start + Cloudflare Vite plugins
│   ├── wrangler.jsonc     # Cloudflare Workers deployment
│   └── package.json       # Dependencies
│
├── workers/               # Worker service
│   ├── src/
│   │   ├── scanners/      # Trivy, Nmap, Semgrep, ZAP scanners
│   │   ├── processors/    # Scan processor with AI enrichment
│   │   ├── ai/            # AI service (multi-provider via AI SDK)
│   │   └── index.ts       # Worker entry (timeout, concurrency, graceful shutdown)
│   ├── .env               # Worker environment variables
│   └── package.json       # Dependencies
│
├── packages/
│   ├── db/                # Shared Drizzle schemas + relations
│   └── types/             # Shared TypeScript types & enums
│
├── AGENTS.md             # This file - AI agent context guide
├── README.md             # Project documentation
├── docker-compose.yml    # Infrastructure (Redis)
└── package.json          # Root scripts
```

---

## Technology Stack

### Backend (API)
- **Framework**: NestJS 11
- **Database**: PostgreSQL (Drizzle ORM with relations)
- **Queue**: BullMQ with Redis (3 retries, exponential backoff)
- **Security**: AuthGuard, ThrottlerModule (60 req/min global, 5/min scan creation)
- **Documentation**: Swagger/OpenAPI

### Frontend (Web)
- **Framework**: TanStack Start on Cloudflare Workers
- **Routing/Data**: TanStack Router + TanStack Query
- **UI**: Tailwind CSS 4, Lucide icons
- **Auth**: Better-auth (email/password)
- **State**: DashboardContext for user session

### Workers
- **Runtime**: Node.js (ES2022 target)
- **Queue Client**: BullMQ (concurrency: 3)
- **Scanners**: Trivy, Nmap, Semgrep, OWASP ZAP
- **AI**: Vercel AI SDK (OpenAI, Anthropic, Google)
- **Timeout**: Configurable (default 10 minutes)

---

## Key Features & Modules

### Authentication & Multi-Tenancy
- Better-auth with email/password authentication
- AuthGuard on all protected routes
- User-scoped data isolation (projects, scans, findings)
- Database tables: `user`, `session`, `account`, `verification`

### Scan Module (API)
- **Endpoints**: Create, list, get, cancel, export (JSON/SARIF)
- **Rate limiting**: 5 scan creations per minute per user
- Database tables: `project`, `scan`, `finding`, `scan_log`
- Schema + relations in `packages/db/src/schema/scan.ts`

### Scanner System (Workers)
- **Trivy**: Dependency audit + container scanning
- **Semgrep**: Static analysis (SAST)
- **Nmap**: Network port scanning
- **OWASP ZAP**: DAST web scanning
- Scanner availability auto-detected at runtime

### AI Integration
- Multi-provider support via Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`)
- Selective enrichment: only critical/high severity findings
- Per-scan opt-in/out via `enableAi` config
- Token usage tracking per scan

### Dashboard (Web)
- Real user name via DashboardContext
- Scan list with search + status filtering
- Scan results with export buttons (JSON/SARIF)
- Cancel running scans from UI
- Settings page with sign-out
- Sidebar with Lucide icons

---

## Development Workflow

### Installation
```bash
git clone https://github.com/Buddhsen-tripathi/openvscan.git
cd openvscan
pnpm install
```

### Infrastructure Setup
Start Redis for the worker queue:
```bash
docker compose up -d redis
```

### Running Locally

**Full Stack (Recommended)**:
```bash
pnpm run dev
```
- Runs API (5000), Web (3000), and Workers concurrently
- API Swagger docs: http://localhost:5000/api/docs
- Web UI: http://localhost:3000

**Individual Services**:
```bash
pnpm run dev:api      # API only
pnpm run dev:web      # Web only
pnpm run dev:workers  # Workers only
```

### Database Operations
```bash
pnpm --filter openvscan-api db:generate
pnpm --filter openvscan-api db:migrate
pnpm --filter openvscan-api db:push
```

---

## Configuration Files

### API (`api/.env`)
```env
PORT=5000
REDIS_URL=redis://localhost:6379
DATABASE_URL="..."
FRONTEND_URL=http://localhost:3000
```

### Web (`web/.env`)
```env
DATABASE_URL="..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL=http://localhost:3000
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000
```

### Workers (`workers/.env`)
```env
REDIS_URL=redis://localhost:6379
DATABASE_URL="..."
SCAN_TIMEOUT_MS=600000

# AI Provider: openai | anthropic | google
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514
GOOGLE_API_KEY=
GOOGLE_MODEL=gemini-2.0-flash
```

---

## Quick Reference Commands

```bash
# Development
pnpm run dev              # Start all services
pnpm run dev:api          # Start API
pnpm run dev:web          # Start Web
pnpm run dev:workers      # Start Workers

# Database
pnpm --filter openvscan-api db:migrate

# Testing
pnpm test
```

---

**For AI Agents**: This document provides context for the OpenVScan codebase, including the new Worker system and database schema. Use it to understand the architecture and development workflow.
