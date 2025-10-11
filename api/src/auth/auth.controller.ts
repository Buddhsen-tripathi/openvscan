import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './services';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
import { RegisterDto, LoginDto } from './dtos';
import { type ExpressRequest } from './types';

@Controller('auth')
@ApiTags('auth (Authentication flow)')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('session')
  async getSession(@Request() req: ExpressRequest) {
    return this.authService.getSession(req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req: ExpressRequest) {
    return this.authService.signOut(req);
  }
}
