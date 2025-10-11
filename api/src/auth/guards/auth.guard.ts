import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const session = await this.authService.getSession(request);

    if (!session) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    request.session = session;
    request.user = session.user ?? null;

    return true;
  }
}
