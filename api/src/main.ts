import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    const allowedOrigins = process.env.FRONTEND_URL;
    if (!allowedOrigins) {
      throw new Error('FRONTEND_URL environment variable is required to configure CORS.');
    }

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
  } catch (error) {
    console.error(`[CORS] ${error instanceof Error ? error.message : error}`);
    await app.close();
    process.exit(1);
  }

  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();