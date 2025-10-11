import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as schema from './models/schema';

export const DATABASE_PROVIDER = 'DATABASE_PROVIDER';
export const POOL_PROVIDER = 'POOL_PROVIDER';

export const PoolProvider: Provider = {
  provide: POOL_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });
    return pool;
  },
};

export const DrizzleProvider: Provider = {
  provide: DATABASE_PROVIDER,
  inject: [POOL_PROVIDER],
  useFactory: (pool: Pool): NodePgDatabase<typeof schema> => {
    return drizzle(pool, { schema });
  },
};
