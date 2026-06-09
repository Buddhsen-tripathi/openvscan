# OpenVScan Web

OpenVScan Web is a TanStack Start app built with React 19, TanStack Router, TanStack Query, Tailwind CSS, Better Auth, and Cloudflare Workers.

## Getting Started

From the repository root, run:

```bash
pnpm run dev:web
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Routes live in `src/routes`, shared UI lives in `components`, and API/auth helpers live in `lib`.

## Environment

```env
DATABASE_URL="..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL=http://localhost:3000
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000
```

## Commands

```bash
pnpm dev        # Vite dev server
pnpm build      # TanStack Start build + TypeScript check
pnpm preview    # Vite preview
pnpm deploy     # Build and deploy with Wrangler
pnpm cf-typegen # Generate Cloudflare Worker env types
```

## Cloudflare Workers

Deployment is configured in `wrangler.jsonc`. The app keeps authentication on Better Auth and talks to the NestJS API with `credentials: 'include'` so the `better-auth.session_token` cookie remains available to the API.
