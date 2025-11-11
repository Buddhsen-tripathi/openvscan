import { Global, Module } from '@nestjs/common';
import {
  DrizzleProvider,
  DATABASE_PROVIDER,
  NeonClientProvider,
  NEON_PROVIDER,
} from './drizzle.provider';

@Global()
@Module({
  providers: [NeonClientProvider, DrizzleProvider],
  exports: [DATABASE_PROVIDER, NEON_PROVIDER],
})
export class DatabaseModule {}
