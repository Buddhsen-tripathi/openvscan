# OpenVScan API

NestJS backend for OpenVScan. The API owns project and scan orchestration, validates Better Auth sessions, writes scan metadata to PostgreSQL through Drizzle, and queues scan jobs through BullMQ/Redis.

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm run start:dev
```

The API listens on `PORT` from the environment, defaulting to `3000` if unset. In local development this project uses `5000`.

## Database

```bash
pnpm run db:generate
pnpm run db:push
pnpm run db:migrate
```

## Tests

```bash
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

## Environment

Copy `.env.example` and provide real values locally:

```env
FRONTEND_URL=http://localhost:3000
PORT=5000
REDIS_URL=redis://localhost:6379
DATABASE_URL="postgresql://user:password@host/db_name"
AUTH_SECRET="generate-a-random-32-char-secret"
```

## API Docs

Swagger docs are available at `/api/docs` when the API is running.

## License

OpenVScan API is licensed under the GNU Affero General Public License v3.0 only. See the repository `LICENSE` for details.
