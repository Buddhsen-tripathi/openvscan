import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: drizzleAdapter(
    {},
    {
      provider: 'pg',
    },
  ),
});
