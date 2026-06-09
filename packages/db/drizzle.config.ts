import { defineConfig } from 'drizzle-kit';

// SQLite dialect for Cloudflare D1. Migrations are generated into ./migrations
// and applied to D1 via `wrangler d1 migrations apply openvscan --remote`.
export default defineConfig({
  schema: 'src/schema/index.ts',
  out: 'migrations',
  dialect: 'sqlite',
  verbose: true,
  strict: true,
});
