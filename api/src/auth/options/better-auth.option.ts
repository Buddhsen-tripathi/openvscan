import * as authSchema from '../../database/models/auth-schema';
import { ConfigService } from '@nestjs/config';
import { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { convertToSeconds } from 'src/common';

export const createBetterAuthOptions = (
  config: ConfigService,
  db: NeonHttpDatabase<typeof authSchema>,
): BetterAuthOptions => {
  const expiresIn = config.getOrThrow<string>('SESSION_EXPIRES_IN');
  const updateIn = config.getOrThrow<string>('SESSION_UPDATE_IN');

  return {
    basePath: '/auth',
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
      // debugLogs: true,
    }),
    secret: config.getOrThrow<string>('AUTH_SECRET'),
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },
    session: {
      modelName: 'session',
      expiresIn: convertToSeconds(expiresIn),
      updateAge: convertToSeconds(updateIn),
      preserveSessionInDatabase: true,
      cookieCache: { enabled: false },
    },
  };
};
