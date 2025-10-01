# OpenVScan

OpenVScan is a web-based vulnerability scanner that integrates open-source tools with AI to deliver smarter, faster and more reliable pre-production security testing.

## Planned Highlights

- **Unified scanning pipeline** – OWASP ZAP, Nmap, Trivy, and custom scanners will be coordinated through a single workflow.
- **AI-guided remediation** – LLM-backed services will summarize findings, filter likely false positives, and suggest fixes.
- **Workspace-centric management** – Teams will organize targets, schedules, baselines, and historical findings per project.
- **Extensible plugin model** – Contributors will add scanners, enrichments, or exporters with minimal boilerplate.
- **Modern operator UX** – Dashboards will provide real-time visibility, drill-down reporting, and exportable artifacts.

## Planned Architecture

| Tier | Stack | Responsibilities |
| --- | --- | --- |
| UI (`web/`) | Next.js 14, React, Tailwind | Scan setup, dashboards, reports, user workflows |
| API (`api/`) | NestJS, TypeScript, PostgreSQL ORM | Projects, scans, auth, findings, task orchestration |
| Workers | Containerized runners, message queue | Execute scanners, collect artifacts, push telemetry |
| Storage | PostgreSQL, object storage, Redis | Persistent metadata, artifacts, queueing |
| AI Services | gRPC/REST bridge to LLMs | Summaries, confidence scoring, remediation guidance |

## Repository Layout (Under Construction)

```
openvscan/
├── api/                 # NestJS service (REST + background jobs)
├── web/                 # Next.js application (UI dashboards & flows)
├── deploy/              # Helm charts and infra manifests
├── docker/              # Local development containers & scripts
├── packages/            # Shared libraries (future)
├── scripts/             # Tooling, scanner runners, automation
└── README.md
```

## Prerequisites (Expected)

- macOS or Linux host with Docker Engine ≥ 24
- Node.js ≥ 20 and [`pnpm`](https://pnpm.io) ≥ 9 for the workspace
- Python ≥ 3.11 for select scanners
- OpenAI-compatible API key (or compatible provider) exported in `.env`

## Installation (Planned)

```bash
pnpm install
```

> The repository will remain a pnpm workspace; root-level commands will target individual projects via filters (e.g. `pnpm --filter api ...`).

## Environment Configuration (Planned)

1. Copy the template and populate secrets:
   ```bash
   cp .env.example .env
   ```
2. Override per-app settings (optional once available):
   - `api/.env` for the NestJS service
   - `web/.env.local` for the Next.js UI
3. Expose the OpenAI-compatible key as `OPENAI_API_KEY` (or provider-specific equivalent).

## Running Locally (Roadmap)

### Full stack (Docker)

```bash
docker compose up --build
```

The UI will be served at <http://localhost:3000>; the API will default to <http://localhost:4000>.

### API service only

```bash
pnpm --filter api start:dev
```

- Hot reload will be provided via the Nest CLI.
- Swagger UI (if enabled) will live at `/docs`.

### Web UI only

```bash
pnpm --filter web dev
```

- Next.js dev mode will proxy API calls to `localhost:4000`.

## Testing & Quality (Planned)

```bash
pnpm lint
pnpm test
pnpm --filter api test
pnpm --filter web test
pnpm test:e2e
pytest tests/workers
```

Static analysis (e.g. `pnpm --filter api lint`) and formatting (`pnpm format`) will run per workspace.

## Deployment (Future)

- Continuous delivery will be handled via GitHub Actions (see `.github/workflows/`).
- Container images will push to the registry defined by `REGISTRY_URL`.
- Kubernetes deploys will be managed with Helm charts in `deploy/helm/openvscan`.
- Required secrets: `OPENAI_API_KEY`, `POSTGRES_URL`, `REDIS_URL`, `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`, etc.

## Roadmap

- [ ] SARIF export for CI ingestion
- [ ] Authenticated mobile app scanning
- [ ] AI remediation for infrastructure-as-code templates
- [ ] Enterprise SSO (SAML/OIDC)
- [ ] Dynamic plugin marketplace

## Contributing

1. Fork the project and create a feature branch.
2. Run planned quality checks (`pnpm lint`, `pnpm test`, and relevant filters) before submitting a PR.
3. Provide screenshots or recordings for UI-facing changes when available.
4. Reference linked issues and follow the [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

Licensed under the Apache License 2.0. See [LICENSE](./LICENSE) for more details.