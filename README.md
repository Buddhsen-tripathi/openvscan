# OpenVScan

OpenVScan is a web-based vulnerability scanner that integrates open-source security tools with AI to deliver smarter, faster, and more reliable pre-production security testing.

[![License](https://img.shields.io/badge/License-AGPL--3.0--only-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
![GitHub Stars](https://img.shields.io/github/stars/Buddhsen-tripathi/openvscan?style=social)
[![GitHub Issues](https://img.shields.io/github/issues/Buddhsen-tripathi/openvscan.svg)](https://github.com/Buddhsen-tripathi/openvscan/issues)

## Quick Start

Get OpenVScan running locally:

```bash
# Clone and install
git clone https://github.com/Buddhsen-tripathi/openvscan.git
cd openvscan
pnpm install

# Start Redis
docker compose up -d

# Build shared packages and apply schema
pnpm run prebuild
pnpm --filter openvscan-api db:push

# Start all services
pnpm run dev
```

**Access Points:**
- Web App: http://localhost:3000
- API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

### Environment

Create local environment files before running the stack.

`api/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=log
DATABASE_URL="postgresql://user:password@host/db_name"
REDIS_URL=redis://localhost:6379
AUTH_SECRET="generate-a-random-32-char-secret"
SESSION_EXPIRES_IN=1d
SESSION_UPDATE_IN=1h
```

`web/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@host/db_name"
BETTER_AUTH_SECRET="generate-a-random-32-char-secret"
```

`workers/.env`:

```env
DATABASE_URL="postgresql://user:password@host/db_name"
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY="" # Optional, for AI enrichment
```

### First Run

1. Go to http://localhost:3000/signup and create an account.
2. Create a project from the dashboard.
3. Start a scan from the project page.
4. Open the scan details page to view status, findings, logs, and exports.

### Troubleshooting

- If shared packages are missing, run `pnpm run prebuild`.
- If auth fails with a missing session token, clear browser cookies and sign in again.
- If scans stay pending, confirm Redis and workers are running with `docker compose ps`.
- If the database fails to connect, verify `DATABASE_URL` and run `pnpm --filter openvscan-api db:push`.

## Features

### Current
- ✅ User authentication with email/password
- ✅ Multi-tenant project management
- ✅ Async vulnerability scanning with Trivy
- ✅ Real-time scan status updates
- ✅ Findings display with severity breakdown
- ✅ Scan execution logs
- ✅ RESTful API with Swagger documentation

### Planned
- 🔜 Multiple scanner integration (Nmap, OWASP ZAP, Semgrep)
- 🔜 AI-powered vulnerability analysis and deduplication
- 🔜 Export formats (SARIF, JSON, PDF)
- 🔜 Scheduled scans and baselines
- 🔜 Team collaboration features
- 🔜 CI/CD pipeline integration

## Architecture

| Tier | Stack | Responsibilities |
|------|-------|------------------|
| **UI** (`web/`) | TanStack Start, React 19, Tailwind CSS, Cloudflare Workers | Scan setup, dashboards, reporting |
| **API** (`api/`) | NestJS 11, PostgreSQL (Drizzle ORM) | Auth, projects, scan orchestration |
| **Workers** (`workers/`) | BullMQ, Redis | Execute scanners, process findings |
| **Storage** | PostgreSQL, Redis | Metadata, queue coordination |
| **AI** | OpenAI/Anthropic | Analysis, deduplication, remediation |

## Repository Structure

```
openvscan/
├── api/                    # NestJS backend
│   ├── src/
│   │   ├── common/        # Guards, interceptors, filters
│   │   ├── database/      # Database configuration
│   │   ├── project/       # Project CRUD
│   │   ├── scan/          # Scan orchestration
│   │   └── queue/         # BullMQ setup
│   └── database/          # Migrations
├── web/                   # TanStack Start frontend
│   ├── src/routes/        # TanStack Router routes
│   ├── components/        # React components
│   ├── lib/               # API client, auth, utilities
│   └── wrangler.jsonc     # Cloudflare Workers deployment
├── workers/               # Background job processors
│   ├── src/
│   │   ├── processors/   # Job handlers
│   │   ├── scanners/     # Scanner integrations
│   │   └── ai/           # AI service
├── packages/              # Shared monorepo packages
│   ├── db/               # Database schema
│   └── types/            # Shared TypeScript types
└── docker-compose.yml    # Infrastructure (Redis)
```

## Development

### Prerequisites
- Node.js 22.12+ for TanStack Start
- pnpm 8+
- PostgreSQL database (Neon recommended)
- Docker (for Redis)
- Trivy CLI (for scanning)

### Commands

```bash
# Development
pnpm run dev              # Start all services
pnpm run dev:api          # API only
pnpm run dev:web          # Web only
pnpm run dev:workers      # Workers only

# Building
pnpm run prebuild         # Build shared packages
pnpm run build            # Build all services

# Database
pnpm --filter openvscan-api db:generate  # Generate migrations
pnpm --filter openvscan-api db:push      # Apply migrations

# Code Quality
pnpm lint                 # Lint all projects
pnpm format               # Format all code
pnpm test                 # Run tests
```

### Cloudflare Web Deployment

The web app is a TanStack Start app configured for Cloudflare Workers.

```bash
pnpm --filter openvscan-web build
pnpm --filter openvscan-web exec wrangler deploy --dry-run
pnpm --filter openvscan-web deploy
```

The deployment config lives in `web/wrangler.jsonc`.

## Documentation

- **[AGENTS.MD](AGENTS.MD)** - Architecture context for AI agents
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community standards

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Licensed under the GNU Affero General Public License v3.0 only. See [LICENSE](LICENSE) for details.

## Acknowledgements

OpenVScan builds on trusted open-source security tools:
- [Trivy](https://github.com/aquasecurity/trivy) - Container & filesystem scanning
- [OWASP ZAP](https://www.zaproxy.org/) - DAST scanning (planned)
- [Nmap](https://nmap.org/) - Network scanning (planned)
- [Semgrep](https://semgrep.dev/) - Static analysis (planned)

---

**Made by [Buddhsen Tripathi](https://github.com/Buddhsen-tripathi)**

For questions or support, please [open an issue](https://github.com/Buddhsen-tripathi/openvscan/issues).
