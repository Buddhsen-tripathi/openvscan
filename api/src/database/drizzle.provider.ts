import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as schema from './models/schema';

export const DATABASE_PROVIDER = 'DATABASE_PROVIDER';
export const NEON_PROVIDER = 'NEON_PROVIDER';

export const NeonClientProvider: Provider = {
  provide: NEON_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
    return neon(databaseUrl);
  },
};

export const DrizzleProvider: Provider = {
  provide: DATABASE_PROVIDER,
  inject: [NEON_PROVIDER],
  useFactory: (
    sql: ReturnType<typeof neon>,
  ): NeonHttpDatabase<typeof schema> => {
    return drizzle(sql, { schema });
  },
};
