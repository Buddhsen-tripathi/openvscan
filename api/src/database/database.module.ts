import { Global, Module } from '@nestjs/common';
import {
  DrizzleProvider,
  DATABASE_PROVIDER,
  PoolProvider,
} from './drizzle.provider';

@Global()
@Module({
  providers: [PoolProvider, DrizzleProvider],
  exports: [DATABASE_PROVIDER],
})
export class DatabaseModule {}
