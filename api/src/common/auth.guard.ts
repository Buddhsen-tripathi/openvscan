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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract session token from cookie or header
    const sessionToken = this.extractSessionToken(request);

    if (!sessionToken) {
      throw new UnauthorizedException('No session token provided');
    }

    // Query session from database
    const session = await this.db.query.session.findFirst({
      where: eq(schema.session.token, sessionToken),
      with: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    // Attach user to request
    request.user = {
      id: session.userId,
      email: session.user.email,
      name: session.user.name,
    };

    return true;
  }

  private extractSessionToken(request: any): string | null {
    // Better-auth uses a cookie named 'better-auth.session_token' by default
    const cookies = request.headers.cookie;

    if (!cookies) {
      return null;
    }

    // Parse cookies
    const cookieArray = cookies.split(';').map((c: string) => c.trim());
    const sessionCookie = cookieArray.find((c: string) =>
      c.startsWith('better-auth.session_token=')
    );

    if (!sessionCookie) {
      return null;
    }

    return sessionCookie.split('=')[1];
  }
}
