# OpenVScan

OpenVScan is a web-based vulnerability scanner that pairs open-source security tooling with AI-assisted analysis for faster, more reliable pre-production security testing. It runs **entirely on Cloudflare** — Workers, Containers, D1, R2, and Queues.

[![License](https://img.shields.io/badge/License-AGPL--3.0--only-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
![GitHub Stars](https://img.shields.io/github/stars/Buddhsen-tripathi/openvscan?style=social)
[![GitHub Issues](https://img.shields.io/github/issues/Buddhsen-tripathi/openvscan.svg)](https://github.com/Buddhsen-tripathi/openvscan/issues)

## Architecture

| Tier | Stack | Responsibilities |
|------|-------|------------------|
| **Web Worker** (`web/`) | TanStack Start, React 19, Tailwind 4, Cloudflare Workers | UI, Better-auth, server functions (project/scan CRUD), queue producer, exports |
| **Scanner Worker** (`workers/`) | Cloudflare Worker + Container, Queues | Consumes scan jobs, runs Trivy in a container, writes findings to D1 and artifacts to R2 |
| **Database** | Cloudflare **D1** (SQLite, Drizzle ORM) | Users, sessions, projects, scans, findings, logs |
| **Object storage** | Cloudflare **R2** | Raw scanner output artifacts |
| **Queue** | Cloudflare **Queues** | Decouples scan dispatch from execution |

There is **no separate API server, Redis, or Postgres** — the web Worker owns data access via TanStack Start server functions, and a consumer Worker drives the scanner container.

> **Plan requirement:** Cloudflare **Containers** require the Workers Paid plan ($5/mo). D1, R2, Queues, and Workers all have usable free tiers.

## Quick Start

```bash
# Clone and install
git clone https://github.com/Buddhsen-tripathi/openvscan.git
cd openvscan
pnpm install

# Authenticate and provision Cloudflare resources (first time only)
pnpm --filter openvscan-web exec wrangler login
pnpm --filter openvscan-web exec wrangler d1 create openvscan
pnpm --filter openvscan-web exec wrangler r2 bucket create openvscan-artifacts
pnpm --filter openvscan-web exec wrangler queues create openvscan-scans
# → copy the printed D1 database_id into web/wrangler.jsonc and workers/wrangler.jsonc

# Apply the schema to your local D1, then start the web app
pnpm db:migrate:local
pnpm dev:web
```

The web app runs at http://localhost:3000.

### Environment

Bindings (D1, R2, Queue) live in `wrangler.jsonc`, not `.env`. Provide secrets for local dev in `web/.dev.vars`:

```env
BETTER_AUTH_SECRET="generate-a-random-32-char-secret"
BETTER_AUTH_URL=http://localhost:3000
VITE_APP_URL=http://localhost:3000
```

Generate a secret with `openssl rand -base64 32`.

### First Run

1. Go to http://localhost:3000/signup and create an account.
2. Create a project from the dashboard.
3. Start a scan from the project page (target = a repo URL, container image, or path).
4. Open the scan detail page to view status, findings, logs, and exports.

> Local scan **execution** requires the scanner Worker (and Docker, for the container). Without it, scans queue but stay pending. See **Deployment**.

## Features

### Current
- ✅ Email/password authentication (Better-auth on D1)
- ✅ Multi-tenant project management
- ✅ Async vulnerability scanning with Trivy (dependencies, container images, repos)
- ✅ Findings grouped by severity with remediation guidance
- ✅ Scan execution logs and status polling
- ✅ Scan cancellation (DB-flag based)
- ✅ JSON & SARIF export
- ✅ Raw scanner artifacts stored in R2

### Planned
- 🔜 Additional scanners (Nmap, Semgrep, OWASP ZAP)
- 🔜 AI-assisted triage in the consumer Worker
- 🔜 Scheduled scans and baselines
- 🔜 CI/CD integration (GitHub Actions)
- 🔜 Team collaboration

## Repository Structure

```
openvscan/
├── web/                   # TanStack Start app on Cloudflare Workers
│   ├── src/routes/        # routes incl. api/auth/$ and api/scans.$id.export
│   ├── components/        # auth/, dashboard/, homepage/, ui/
│   ├── lib/               # auth.ts, db.ts, server.ts (server functions), api.ts
│   └── wrangler.jsonc     # bindings: DB (D1), ARTIFACTS (R2), SCAN_QUEUE
├── workers/               # Cloudflare consumer Worker (openvscan-scanner)
│   ├── src/index.ts       # ScannerContainer + queue() handler
│   ├── container/         # Dockerfile (node + Trivy) + server.mjs
│   └── wrangler.jsonc     # queue consumer + D1 + R2 + Container bindings
├── packages/
│   ├── db/                # Drizzle SQLite schema for D1 + migrations
│   └── types/             # Shared TypeScript types & enums
└── package.json           # Root scripts
```

## Development

### Prerequisites
- Node.js 22.12+
- pnpm 8+
- A Cloudflare account (Workers Paid for the scanner container)
- Docker (only to build/run the scanner container)

### Commands

```bash
# Develop
pnpm dev:web                       # web Worker (local D1/R2/Queue via vite plugin)
pnpm --filter openvscan-workers dev  # scanner Worker (needs Docker)

# Build
pnpm prebuild                      # build shared packages
pnpm build                         # build the web Worker

# Database (D1)
pnpm db:generate                   # generate SQLite migrations from the schema
pnpm db:migrate:local              # apply to local D1
pnpm db:migrate                    # apply to remote D1
```

## Deployment

Everything deploys to Cloudflare.

```bash
# 1. Apply migrations to remote D1
pnpm db:migrate

# 2. Deploy the scanner Worker (builds + pushes the container image — Docker required)
pnpm --filter openvscan-workers deploy

# 3. Deploy the web Worker
pnpm deploy

# 4. Set production secrets on the web Worker
pnpm --filter openvscan-web exec wrangler secret put BETTER_AUTH_SECRET
# also set BETTER_AUTH_URL / VITE_APP_URL to the deployed origin, then redeploy
```

## Documentation

- **[AGENTS.MD](AGENTS.MD)** — architecture context for AI agents
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — contribution guidelines
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — community standards

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run lint and build
5. Submit a pull request

## License

Licensed under the GNU Affero General Public License v3.0 only. See [LICENSE](LICENSE) for details.

## Acknowledgements

OpenVScan builds on trusted open-source security tools:
- [Trivy](https://github.com/aquasecurity/trivy) — container, filesystem & repository scanning
- [OWASP ZAP](https://www.zaproxy.org/) — DAST scanning (planned)
- [Nmap](https://nmap.org/) — network scanning (planned)
- [Semgrep](https://semgrep.dev/) — static analysis (planned)

---

**Made by [Buddhsen Tripathi](https://github.com/Buddhsen-tripathi)**

For questions or support, please [open an issue](https://github.com/Buddhsen-tripathi/openvscan/issues).
