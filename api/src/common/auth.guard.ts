import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { DATABASE_PROVIDER } from '../database/drizzle.provider';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '@openvscan/db';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'better-auth.session_token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const sessionToken = this.extractSessionToken(request);
    if (!sessionToken) {
      throw new UnauthorizedException('No session token provided');
    }

    const session = await this.db.query.session.findFirst({
      where: eq(schema.session.token, sessionToken),
      with: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    if (new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    request.user = {
      id: session.userId,
      email: session.user.email,
      name: session.user.name,
    };

    return true;
  }

  private extractSessionToken(request: any): string | null {
    // 1. Try Authorization header (Bearer token) — useful for API clients & Swagger
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 2. Parse session token from cookies
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      return null;
    }

    const cookies = this.parseCookies(cookieHeader);
    return cookies[SESSION_COOKIE_NAME] || null;
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    for (const pair of cookieHeader.split(';')) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex === -1) continue;
      const key = pair.slice(0, eqIndex).trim();
      const value = pair.slice(eqIndex + 1).trim();
      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
    }
    return cookies;
  }
}
