import { Inject, Injectable, Request } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dtos';
import { betterAuth } from 'better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { ExpressRequest } from '../types';
import { BETTER_AUTH_INSTANCE } from './better-auth.provider';

@Injectable()
export class AuthService {
  constructor(
    @Inject(BETTER_AUTH_INSTANCE)
    private readonly auth: ReturnType<typeof betterAuth>,
  ) {}

  async register(data: RegisterDto) {
    console.log(data, 'Data from request body');

    return await this.auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });
  }

  async login(data: LoginDto) {
    return await this.auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });
  }

  async getSession(req: any) {
    const headers = { ...req.headers };

    if (headers.authorization?.startsWith('Bearer ')) {
      headers.authorization = headers.authorization
        .replace('Bearer', 'Session')
        .trim();
    }

    console.log(headers.authorization);

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    console.log(session);
    return session;
  }

  async signOut(req: ExpressRequest) {
    return await this.auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
  }
}
