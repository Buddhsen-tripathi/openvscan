import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: 'src/database/models/schema.ts',
  out: 'database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
