import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      ip,
      userAgent,
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const { statusCode } = response;
          const responseTime = Date.now() - now;

          this.logger.log({
            message: 'Outgoing response',
            method,
            url,
            statusCode,
            responseTime: `${responseTime}ms`,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - now;

          this.logger.error({
            message: 'Request failed',
            method,
            url,
            error: error.message,
            stack: error.stack,
            responseTime: `${responseTime}ms`,
          });
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}