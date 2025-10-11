import { Provider } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { ConfigService } from '@nestjs/config';
import * as schema from 'src/database/models/schema';
import { DATABASE_PROVIDER } from 'src/database/drizzle.provider';
import { convertToSeconds } from 'src/common';
import { hashPassword, verifyPassword } from '../password';

export const BETTER_AUTH_INSTANCE = 'BETTER_AUTH_INSTANCE';

export const BetterAuthProvider: Provider = {
  provide: BETTER_AUTH_INSTANCE,
  inject: [DATABASE_PROVIDER, ConfigService],
  useFactory: (db, config: ConfigService) => {
    const updateIn = config.getOrThrow<string>('SESSION_UPDATE_IN');
    const expiresIn = config.getOrThrow<string>('SESSION_EXPIRES_IN');

    return betterAuth({
      basePath: 'auth',
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
        debugLogs: true,
      }),

      secret: config.getOrThrow<string>('AUTH_SECRET'),
      emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
        password: { hash: hashPassword, verify: verifyPassword },
      },
      session: {
        modelName: 'session',
        expiresIn: convertToSeconds(expiresIn),
        updateAge: convertToSeconds(updateIn),
        preserveSessionInDatabase: true,
        cookieCache: { enabled: false },
      },
    });
  },
};
