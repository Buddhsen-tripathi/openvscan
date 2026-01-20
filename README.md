# OpenVScan

OpenVScan is a web-based vulnerability scanner that integrates open-source security tools with AI to deliver smarter, faster, and more reliable pre-production security testing.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![GitHub Stars](https://img.shields.io/github/stars/Buddhsen-tripathi/openvscan?style=social)
[![GitHub Issues](https://img.shields.io/github/issues/Buddhsen-tripathi/openvscan.svg)](https://github.com/Buddhsen-tripathi/openvscan/issues)

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# Clone and install
git clone https://github.com/Buddhsen-tripathi/openvscan.git
cd openvscan
pnpm install

# Start infrastructure
docker compose up -d

# Build shared packages and run migrations
pnpm run prebuild
pnpm --filter openvscan-api db:push

# Start all services
pnpm run dev
```

**Access Points:**
- 🌐 Web App: http://localhost:3000
- 🔧 API: http://localhost:5000
- 📚 API Docs: http://localhost:5000/api/docs

For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md) or [SETUP.md](SETUP.md).

## ✨ Features

### Current (MVP)
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

See [MVP_STATUS.md](MVP_STATUS.md) for complete feature list and roadmap.

## 🏗️ Architecture

| Tier | Stack | Responsibilities |
|------|-------|------------------|
| **UI** (`web/`) | Next.js 15, React 19, Tailwind CSS | Scan setup, dashboards, reporting |
| **API** (`api/`) | NestJS 11, PostgreSQL (Drizzle ORM) | Auth, projects, scan orchestration |
| **Workers** (`workers/`) | BullMQ, Redis | Execute scanners, process findings |
| **Storage** | PostgreSQL, Redis | Metadata, queue coordination |
| **AI** | OpenAI/Anthropic | Analysis, deduplication, remediation |

## 📁 Repository Structure

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
├── web/                   # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/               # API client, utilities
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

## 🛠️ Development

### Prerequisites
- Node.js 18+
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

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[MVP_STATUS.md](MVP_STATUS.md)** - Current features and roadmap
- **[AGENTS.MD](AGENTS.MD)** - Architecture context for AI agents
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community standards

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgements

OpenVScan builds on trusted open-source security tools:
- [Trivy](https://github.com/aquasecurity/trivy) - Container & filesystem scanning
- [OWASP ZAP](https://www.zaproxy.org/) - DAST scanning (planned)
- [Nmap](https://nmap.org/) - Network scanning (planned)
- [Semgrep](https://semgrep.dev/) - Static analysis (planned)

---

**Made with ❤️ by [Buddhsen Tripathi](https://github.com/Buddhsen-tripathi)**

For questions or support, please [open an issue](https://github.com/Buddhsen-tripathi/openvscan/issues).
