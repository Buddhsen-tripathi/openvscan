# OpenVScan - AI Agent Context Guide

## Project Overview

**OpenVScan** is a web-based vulnerability scanner that integrates open-source security tools with AI to deliver smarter, faster, and more reliable pre-production security testing. The platform combines trusted security scanners (OWASP ZAP, Nmap, Trivy) with AI-driven analysis for vulnerability deduplication, triage, and remediation guidance.

**Repository**: https://github.com/Buddhsen-tripathi/openvscan  
**Creator**: Buddhsen Tripathi  
**License**: Apache License 2.0  
**Live Preview**: https://openvscan-web.buddhsen-work.workers.dev/

---

## Architecture Overview

OpenVScan follows a modern full-stack architecture with clear separation of concerns:

| Tier | Stack | Responsibilities |
|------|-------|------------------|
| **UI** (`web/`) | Next.js 15, React 19, Tailwind CSS | Scan setup, dashboards, reporting, multi-tenant UX |
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
│   │   ├── common/        # Shared utilities
│   │   ├── database/      # Database configuration and models
│   │   │   ├── models/    # Drizzle ORM schemas
│   │   │   ├── database.module.ts
│   │   │   └── drizzle.provider.ts
│   │   ├── queue/         # BullMQ configuration
│   │   ├── scan/          # Scan module
│   │   ├── app.module.ts  # Root application module
│   │   └── main.ts        # Application entry point
│   ├── database/          # Drizzle migrations
│   ├── .env               # API environment variables
│   └── package.json       # Dependencies
│
├── web/                   # Next.js 15 / React 19 frontend
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   ├── .env               # Web environment variables
│   └── package.json       # Dependencies
│
├── workers/               # Worker service
│   ├── src/
│   │   └── index.ts       # Worker entry point
│   ├── .env               # Worker environment variables
│   └── package.json       # Dependencies
│
├── packages/              # Shared packages
│   └── types/             # Shared TypeScript types
│
├── AGENTS.md             # This file - AI agent context guide
├── README.md             # Project documentation
├── IMPLEMENTATION_PLAN.md # Implementation roadmap
├── docker-compose.yml    # Infrastructure (Redis)
└── package.json          # Root scripts
```

---

## Technology Stack

### Backend (API)
- **Framework**: NestJS 11
- **Database**: PostgreSQL (Drizzle ORM)
- **Queue**: BullMQ with Redis
- **Documentation**: Swagger/OpenAPI

### Frontend (Web)
- **Framework**: Next.js 15
- **UI**: shadcn/ui, Tailwind CSS 4
- **Auth**: Better-auth

### Workers
- **Runtime**: Node.js
- **Queue Client**: BullMQ
- **Connection**: Redis

---

## Key Features & Modules

### Authentication System
- Better-auth with email/password authentication
- Database tables: `user`, `session`, `account`, `verification`

### Scan Module (API)
- Scan orchestration via Queue
- Database tables: `project`, `scan`, `finding`, `scan_log`
- Models defined in `api/src/database/models/scan-schema.ts`

### Worker System
- Dedicated worker service in `workers/`
- Listens to `scan-queue` in Redis
- Updates scan status and stores findings

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
NEXT_PUBLIC_API_URL=http://localhost:5000
DATABASE_URL="..."
```

### Workers (`workers/.env`)
```env
REDIS_URL=redis://localhost:6379
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
