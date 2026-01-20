# OpenVScan Quick Start

Get OpenVScan running in under 5 minutes.

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check pnpm (need 8+)
pnpm --version

# Install pnpm if needed
npm install -g pnpm
```

## 1-2-3 Setup

### 1️⃣ Install & Build

```bash
# Clone and install
pnpm install

# Build shared packages
pnpm run prebuild
```

### 2️⃣ Configure Environment

Create environment files (or copy from examples):

**`api/.env`**:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL="your-neon-or-postgres-url"
REDIS_URL=redis://localhost:6379
AUTH_SECRET="generate-a-random-32-char-string"
```

**`web/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="same-as-api"
AUTH_SECRET="same-as-api"
```

**`workers/.env`**:
```env
DATABASE_URL="same-as-api"
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY="sk-..." # Optional
```

### 3️⃣ Start Services

```bash
# Start Redis
docker compose up -d

# Run migrations
pnpm --filter openvscan-api db:push

# Start everything
pnpm run dev
```

## Access Points

- 🌐 **Web App**: http://localhost:3000
- 🔧 **API**: http://localhost:5000
- 📚 **Swagger Docs**: http://localhost:5000/api/docs

## First Steps

1. Go to http://localhost:3000/signup
2. Create an account
3. Create a project
4. Run a scan (try `alpine:latest` as target)
5. View results

## Common Issues

### "Cannot find module '@openvscan/db'"
```bash
pnpm run prebuild
```

### "Session token not provided"
- Clear browser cookies
- Sign in again

### "Scan stuck in pending"
- Check workers are running
- Check Redis is running: `docker compose ps`

### "Database connection error"
- Verify DATABASE_URL is correct
- For Neon, ensure SSL is enabled

## Development Workflow

```bash
# Run individual services
pnpm run dev:api      # API only
pnpm run dev:web      # Web only
pnpm run dev:workers  # Workers only

# Rebuild packages after changes
pnpm run prebuild

# Reset database
pnpm --filter openvscan-api tsx src/scripts/reset-db.ts
pnpm --filter openvscan-api db:push
```

## Need Help?

- Full setup guide: [SETUP.md](SETUP.md)
- Project status: [MVP_STATUS.md](MVP_STATUS.md)
- Architecture context: [AGENTS.MD](AGENTS.MD)

---

**Pro Tip**: Install Trivy for actual scanning: https://aquasecurity.github.io/trivy/latest/getting-started/installation/
