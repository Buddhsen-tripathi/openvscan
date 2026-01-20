# OpenVScan MVP Setup Guide

This guide will help you set up and run the OpenVScan MVP locally.

## Prerequisites

- Node.js 18+ and pnpm 8+
- PostgreSQL database (recommend Neon for development)
- Docker (for Redis)
- Trivy CLI installed (for scanning)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

#### API (`api/.env`)

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=log

# Database (use your Neon or PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host/db_name"

# Redis (for queue/workers)
REDIS_URL=redis://localhost:6379

# Better-Auth Session
AUTH_SECRET="your-secret-key-min-32-chars"
SESSION_EXPIRES_IN=1d
SESSION_UPDATE_IN=1h
```

#### Web (`web/.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# App URL (for Better-Auth)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (same as API)
DATABASE_URL="postgresql://user:password@host/db_name"

# Better-Auth (same secret as API)
AUTH_SECRET="your-secret-key-min-32-chars"
```

#### Workers (`workers/.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@host/db_name"

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI (optional, for AI analysis)
OPENAI_API_KEY="sk-..."
```

### 3. Start Infrastructure

Start Redis using Docker Compose:

```bash
docker compose up -d
```

### 4. Run Database Migrations

Build the packages and run migrations:

```bash
# Build shared packages
pnpm --filter @openvscan/db build
pnpm --filter @openvscan/types build

# Run migrations
pnpm --filter openvscan-api db:push
```

### 5. Start the Application

#### Option A: Run All Services (Recommended)

```bash
pnpm run dev
```

This starts:
- API server on http://localhost:5000
- Web app on http://localhost:3000
- Worker process listening to scan queue

#### Option B: Run Services Individually

In separate terminals:

```bash
# Terminal 1: API
pnpm run dev:api

# Terminal 2: Web
pnpm run dev:web

# Terminal 3: Workers
pnpm run dev:workers
```

## Using the Application

1. **Sign Up**: Go to http://localhost:3000/signup and create an account
2. **Sign In**: Log in at http://localhost:3000/signin
3. **Create Project**: From the dashboard, create a new project
4. **Run Scan**:
   - Click on a project
   - Click "New Scan"
   - Enter a target (e.g., `alpine:latest` for container scan)
   - Select scanner types
   - Start scan
5. **View Results**: Click on the scan to see findings and logs

## API Documentation

Swagger documentation is available at: http://localhost:5000/api/docs

## Troubleshooting

### "No session token provided" error

Make sure:
- You're signed in at http://localhost:3000
- The API CORS is configured to allow credentials
- The web client includes credentials in requests

### Scans stay in "pending" status

- Check that the worker process is running
- Check Redis connection in workers
- Check worker logs for errors

### Database connection errors

- Verify DATABASE_URL is correct in all .env files
- For Neon: make sure to use the `?sslmode=require` parameter
- Check that migrations have been run

## Development Tools

### Reset Database

```bash
pnpm --filter openvscan-api tsx src/scripts/reset-db.ts
pnpm --filter openvscan-api db:push
```

### View Queue Jobs

You can connect to Redis CLI to inspect jobs:

```bash
docker exec -it openvscan-redis-1 redis-cli
> KEYS *
> LRANGE bull:scan-queue:wait 0 -1
```

## Project Structure

```
openvscan/
├── api/                 # NestJS backend
├── web/                 # Next.js frontend
├── workers/             # BullMQ workers
├── packages/
│   ├── db/             # Shared database schema
│   └── types/          # Shared TypeScript types
└── docker-compose.yml  # Redis infrastructure
```

## Next Steps

- Install Trivy: https://aquasecurity.github.io/trivy/latest/getting-started/installation/
- Add more scanners (Nmap, OWASP ZAP, Semgrep)
- Enable AI analysis by adding OPENAI_API_KEY
- Deploy to production (see deployment guide)
