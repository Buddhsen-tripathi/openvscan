import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = parseException(exception);

    return response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

export function parseException(exception: any): {
  status: number;
  message: string | string[];
} {
  if (!exception || typeof exception !== 'object') {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  if (exception instanceof Error) {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message,
    };
  }

  switch (exception.name) {
    case 'HttpException': {
      const status = exception.getStatus();
      const res = exception.getResponse();
      let message: string | string[];

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && 'message' in res) {
        message = res.message;
      } else {
        message = 'Internal server error';
      }

      return { status, message };
    }

    case 'APIError': {
      const status = exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        exception.body?.message || exception.message || 'Internal server error';
      return { status, message };
    }

    default: {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
      };
    }
  }
}
