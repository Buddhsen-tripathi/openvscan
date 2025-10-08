import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
