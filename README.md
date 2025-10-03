# OpenVScan

OpenVScan is a web-based vulnerability scanner that integrates open-source tools with AI to deliver smarter, faster and more reliable pre-production security testing.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Buddhsen-tripathi/openvscan.svg?style=social&label=Star)](https://github.com/Buddhsen-tripathi/openvscan)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2025-orange.svg)](https://hacktoberfest.com/)
[![GitHub issues](https://img.shields.io/github/issues/Buddhsen-tripathi/openvscan.svg)](https://github.com/Buddhsen-tripathi/openvscan/issues)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Buddhsen-tripathi/openvscan/actions)


## Planned Architecture

| Tier | Stack | Responsibilities |
| --- | --- | --- |
| UI (`web/`) | Next.js 15, React 19, Tailwind CSS | Scan setup, dashboards, reporting, multi-tenant UX |
| API (`api/`) | NestJS 11, TypeScript, PostgreSQL ORM | Projects, auth, scan orchestration, findings API |
| Workers | Containerized runners + message queue | Execute scanners, aggregate artifacts, stream telemetry |
| Storage | PostgreSQL, object storage, Redis | Metadata, artifacts, coordination primitives |
| AI Services | LLM providers | Summaries, deduplication, remediation guidance |

## Repository Layout

```
openvscan/
├── api/                 # NestJS 11 service (REST + background jobs)
├── web/                 # Next.js 15 / React 19 application
├── deploy/              # charts and infra manifests
├── docker/              # Local development containers & scripts
├── packages/            # Shared libraries (future)
├── scripts/             # Tooling, scanner runners, automation
└── README.md
└── LICENSE
```

## Installation

```bash
git clone https://github.com/your-username/openvscan.git
cd openvscan
pnpm install
```

> This repository will remain a pnpm workspace; use filters for project-specific commands (e.g., `pnpm --filter api …`).

## Environment Configuration

1. Duplicate the root environment file:
   ```bash
   cp .env.example .env
   ```
2. Populate service-specific overrides as they appear:
   - `api/.env` for the NestJS backend
   - `web/.env.local` for the Next.js UI

## Running Locally (Roadmap)

### Full Stack (Docker)

```bash
docker compose up --build
```

- UI will serve at <http://localhost:3000>.
- API will expose <http://localhost:5000>.

### API Only

```bash
pnpm --filter api start:dev
```

- Nest CLI will provide hot reload.
- Swagger (when enabled) will live at `/docs`.

### Web UI Only

```bash
pnpm --filter web dev
```

- Next.js dev server will proxy API requests to `localhost:5000`.

## Usage (Vision)

1. Upload a target (artifact, URL, or Git connection).
2. Select scanners (static analysis, dependency audit, DAST, container checks).
3. Run the pipeline and allow AI triage to surface critical issues.
4. Review findings in the dashboard and apply recommended fixes.
5. Export reports (JSON, SARIF, PDF) for stakeholders.

## Example Outcomes (Planned)

- Critical findings such as SQL injection, XSS, RCE, SSRF.
- Dependency exposure reports for outdated or vulnerable packages.
- Infrastructure misconfiguration insights (e.g., Kubernetes, Terraform).
- AI-enhanced remediation steps with code snippets and context.

## Testing & Quality (Planned)

```bash
pnpm lint
pnpm test
pnpm --filter api test
pnpm --filter web test
pnpm test:e2e
pytest tests/workers
```

Static analysis (`pnpm --filter api lint`) and formatting (`pnpm format`) will enforce workspace standards.

## Contributing

1. Fork the repository and create a feature branch.
2. Run `pnpm lint` and `pnpm test` (plus relevant filters) before opening a PR.
3. Include screenshots or recordings for UI-facing changes.
4. Reference linked issues and follow the [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

Licensed under the Apache License 2.0. See [LICENSE](./LICENSE) for terms.

## Acknowledgements

OpenVScan will build on trusted open-source security tools (e.g., OWASP ZAP, Nmap, Trivy) and layer AI-driven analysis to make vulnerability scanning more effective and accessible.
