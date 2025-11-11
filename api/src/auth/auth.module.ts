import { Module } from '@nestjs/common';
import { createBetterAuthOptions } from './options/better-auth.option';
import { ConfigService } from '@nestjs/config';
import { DATABASE_PROVIDER } from 'src/database/drizzle.provider';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as authSchema from 'src/database/models/auth-schema';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';

@Module({
  imports: [
    DatabaseModule,
    BetterAuthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [ConfigService, DATABASE_PROVIDER],
      useFactory: (
        config: ConfigService,
        db: NeonHttpDatabase<typeof authSchema>,
      ) => ({
        auth: betterAuth(createBetterAuthOptions(config, db)),
      }),
    }),
  ],
})
export class AuthModule {}
