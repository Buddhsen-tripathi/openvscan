import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { BetterAuthProvider } from './services';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [BetterAuthProvider, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
