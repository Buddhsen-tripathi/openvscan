# OpenVScan - AI Agent Context Guide

## Project Overview

**OpenVScan** is a web-based vulnerability scanner that pairs open-source security tooling with AI-assisted analysis for faster, more reliable pre-production security testing. It runs **entirely on Cloudflare** — Workers, Containers, D1, R2, and Queues.

**Repository**: https://github.com/Buddhsen-tripathi/openvscan
**Creator**: Buddhsen Tripathi
**License**: GNU Affero General Public License v3.0 only

---

## Architecture Overview

OpenVScan is an all-Cloudflare application. There is no separate API server, Redis, or Postgres — the web Worker owns data access, and a consumer Worker drives a container to run scanners.

| Tier | Stack | Responsibilities |
|------|-------|------------------|
| **Web Worker** (`web/`) | TanStack Start, React 19, Tailwind 4, Cloudflare Workers | UI, Better-auth, server functions (project/scan CRUD), queue producer, export routes |
| **Scanner Worker** (`workers/`) | Cloudflare Worker + Container, Queues | Consumes scan jobs, runs Trivy in a container, writes findings to D1 and artifacts to R2 |
| **Database** | Cloudflare **D1** (SQLite) | Users, sessions, projects, scans, findings, scan logs |
| **Object storage** | Cloudflare **R2** | Raw scanner output artifacts |
| **Queue** | Cloudflare **Queues** | Decouples scan dispatch (web) from execution (scanner Worker) |
| **Shared packages** (`packages/`) | Drizzle schema, TS types, GitHub helpers | `@openvscan/db`, `@openvscan/types`, `@openvscan/github` (octokit App auth, webhook verify, PR comment builder) |

> **Plan requirement:** Cloudflare **Containers** require the Workers Paid plan ($5/mo). D1, R2, Queues, and Workers all have usable free tiers.

---

## Request flow

```
Browser → Web Worker (TanStack Start)
  ├── Better-auth (session cookies)  ──────────────► D1 (user/session/account)
  └── server fn: startScan
        ├── insert scan row (status=pending) ───────► D1
        └── SCAN_QUEUE.send({ scanId, config }) ────► Cloudflare Queue
                                                          │
Scanner Worker  ◄─────────────────────────────────────── consumes batch
  ├── set status=running ──────────────────────────► D1
  ├── ScannerContainer.fetch("/scan") ─────────────► Container (Trivy)
  ├── insert findings ─────────────────────────────► D1
  ├── put raw output ──────────────────────────────► R2
  └── set status=completed | failed | cancelled ───► D1
```

Cancellation is a **DB flag**: the web Worker sets `scan.cancel_requested = true`; the consumer checks it before/after running and marks the scan `cancelled` (Cloudflare Queues has no random-access job removal).

### GitHub-driven scans

```
GitHub App install ──► /api/github/setup    (associate installation_id with user → github_installation)
push event ─────────► /api/github/webhook   (verify HMAC; if repo.scan_mode='automatic' &
                                              branch matches repo.branch_filter → insert scan + enqueue
                                              with a `github` context, incl. open-PR number)
Scanner Worker:
  ├─ mint installation token → authenticated clone URL → container (private-repo capable)
  ├─ write findings → D1   (config.target in D1 stays token-free)
  └─ if github.prNumber → POST a findings summary comment on the PR (sets scan.comment_posted)
```

A `scan` belongs to **either** a `project` (ad-hoc manual target) **or** a `repository`
(GitHub-connected); `scan.project_id` is now nullable. GitHub login is Better-auth's social
provider; repo access is the separate App installation.

---

## Repository Structure

```
openvscan/
├── web/                       # TanStack Start app on Cloudflare Workers
│   ├── src/
│   │   ├── routes/            # Router routes incl. api/auth/$ and api/scans.$id.export
│   │   └── lib/               # session.ts, env.ts (cloudflare:workers bindings)
│   ├── components/            # auth/, dashboard/, homepage/, ui/
│   ├── lib/
│   │   ├── auth.ts            # Better-auth (lazy getAuth(), drizzle-orm/d1, provider "sqlite")
│   │   ├── db.ts              # getDb() (drizzle d1) + requireUserId()
│   │   ├── server.ts          # server functions: project/scan CRUD, queue producer, cancel
│   │   └── api.ts             # React Query hooks calling the server functions
│   └── wrangler.jsonc         # bindings: DB (D1), ARTIFACTS (R2), SCAN_QUEUE (producer)
│
├── workers/                   # Cloudflare consumer Worker (name: openvscan-scanner)
│   ├── src/index.ts           # ScannerContainer class + queue() handler (raw D1 + R2)
│   ├── container/
│   │   ├── Dockerfile         # node:22-slim + Trivy CLI
│   │   └── server.mjs         # dependency-free HTTP scan server (POST /scan)
│   └── wrangler.jsonc         # queue consumer + D1 + R2 + Container/DO bindings
│
├── packages/
│   ├── db/                    # Drizzle SQLite schema for D1 + migrations/
│   └── types/                 # Shared TypeScript types & enums
│
├── AGENTS.MD                  # This file
├── README.md
└── package.json               # Root scripts
```

---

## Technology Stack

### Web Worker (`web/`)
- **Framework**: TanStack Start on Cloudflare Workers (`@cloudflare/vite-plugin`)
- **Data**: TanStack Query + TanStack Start **server functions** (no REST API server)
- **DB access**: Drizzle ORM via `drizzle-orm/d1` against the `DB` binding
- **Auth**: Better-auth (email/password), Drizzle adapter, `provider: "sqlite"`
- **UI**: Tailwind CSS 4 (semantic tokens in `src/styles.css`), Lucide icons, Framer Motion

### Scanner Worker (`workers/`)
- **Runtime**: Cloudflare Worker (`queue()` consumer) + Cloudflare **Container**
- **Container**: `node:22-slim` image with the Trivy CLI; stateless HTTP server (`POST /scan`)
- **Persistence**: raw D1 prepared statements + R2 `put` (no ORM in the Worker)

### Shared (`packages/`)
- `@openvscan/db`: Drizzle `sqlite-core` schema + relations; migrations applied via `wrangler d1 migrations apply`
- `@openvscan/types`: `ScanStatus`, `ScanType`, `Severity`, and entity types

---

## Key Features & Modules

### Authentication & Multi-Tenancy
- Better-auth email/password; sessions in D1 (`user`, `session`, `account`, `verification`)
- All server functions resolve the user via `requireUserId()` and scope every query
- `web/lib/auth.ts` builds the auth instance lazily so the `env.DB` binding is bound at request time

### Scans (web server functions — `web/lib/server.ts`)
- `listProjects`, `getProject`, `createProject`
- `listScans` (project **and** repository scans), `getScan`, `startScan` (inserts + `SCAN_QUEUE.send`), `cancelScan`
- Export: `web/src/routes/api/scans.$id.export.ts` returns JSON or SARIF as a download
- Tables: `project`, `scan`, `finding`, `scan_log` (schema in `packages/db/src/schema/scan.ts`)

### GitHub integration
- Schema: `github_installation`, `repository` (`packages/db/src/schema/github.ts`); `scan` gained
  `repository_id`, `trigger`, `branch`, `commit_sha`, `pr_number`, `comment_posted`
- Server fns: `web/lib/github-server.ts` (`getGithubConnection`, `listConnectableRepos`,
  `connectRepository`, `listRepositories`, `getRepository`, `updateRepositoryConfig`,
  `startRepositoryScan`, `disconnectRepository`)
- Server glue: `web/lib/github.ts` (App creds, install URL, `syncInstallation`, octokit factory)
- Routes: `web/src/routes/api/github/setup.ts` (install callback) + `webhook.ts` (push/installation)
- UI: `dashboard.repositories.tsx` (connect/list) + `dashboard.repositories.$id.tsx` (config)
- Provider-agnostic helpers live in `@openvscan/github`; only this package imports octokit

### Scanner execution (`workers/`)
- **Trivy** runs in the container: `fs`, `image`, or `repo` subcommand chosen from the target shape
- Consumer parses findings → D1, stores raw output → R2 (`scans/<id>/trivy.json`)
- Nmap, Semgrep, and OWASP ZAP are **roadmap** (not yet wired)

### AI Integration
- AI-assisted triage is on the roadmap for the consumer Worker. (The legacy BullMQ AI enrichment was removed during the Cloudflare migration and has not yet been re-wired.)

---

## Development Workflow

### Install
```bash
git clone https://github.com/Buddhsen-tripathi/openvscan.git
cd openvscan
pnpm install
```

### Provision Cloudflare resources (first time)
```bash
pnpm --filter openvscan-web exec wrangler login
pnpm --filter openvscan-web exec wrangler d1 create openvscan
pnpm --filter openvscan-web exec wrangler r2 bucket create openvscan-artifacts
pnpm --filter openvscan-web exec wrangler queues create openvscan-scans
# Put the D1 database_id into web/wrangler.jsonc and workers/wrangler.jsonc
```

### Database (D1 migrations)
```bash
pnpm db:generate          # drizzle-kit generate (SQLite) into packages/db/migrations
pnpm db:migrate:local     # apply to local D1
pnpm db:migrate           # apply to remote D1
```

### Run locally
```bash
pnpm dev:web              # web Worker via vite + cloudflare plugin (local D1/R2/Queue)
# scanner Worker (needs Docker running for the container image):
pnpm --filter openvscan-workers dev
```

### Deploy
```bash
pnpm --filter openvscan-workers deploy   # builds + pushes the container image (Docker required)
pnpm deploy                              # builds + deploys the web Worker
# then set secrets:
pnpm --filter openvscan-web exec wrangler secret put BETTER_AUTH_SECRET
```

---

## Configuration

Bindings live in `wrangler.jsonc` (not `.env`). Local secrets go in `web/.dev.vars`.

### Web Worker secrets
```
BETTER_AUTH_SECRET   # 32+ char random secret
BETTER_AUTH_URL      # deployed origin (e.g. https://openvscan-web.<acct>.workers.dev)
VITE_APP_URL         # same origin, exposed to the client
# GitHub (optional — enables repo connect + auto-scan + social login):
GITHUB_APP_ID  GITHUB_APP_SLUG  GITHUB_APP_PRIVATE_KEY  GITHUB_WEBHOOK_SECRET
GITHUB_CLIENT_ID  GITHUB_CLIENT_SECRET
```

### Scanner Worker secrets (GitHub-linked scans)
```
GITHUB_APP_ID  GITHUB_APP_PRIVATE_KEY  APP_URL
```
See `web/.dev.vars.example` and `workers/.dev.vars.example` for local setup, and README
"GitHub integration" for registering the App.

### Bindings (web/wrangler.jsonc)
- `DB` → D1 database `openvscan`
- `ARTIFACTS` → R2 bucket `openvscan-artifacts`
- `SCAN_QUEUE` → Queue `openvscan-scans` (producer)

### Bindings (workers/wrangler.jsonc)
- `DB`, `ARTIFACTS`, `SCANNER` (Container/Durable Object) + `openvscan-scans` consumer

---

**For AI Agents**: OpenVScan is all-Cloudflare. There is no NestJS API, Redis, or Postgres — those were removed. Data access lives in `web/lib/server.ts` (D1 via Drizzle) and scan execution in `workers/` (Container + Queue consumer, raw D1). Note Drizzle's `integer({ mode: "timestamp" })` stores epoch **seconds**, which the raw-SQL Worker matches.
