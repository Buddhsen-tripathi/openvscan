import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
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
    logger.log(`CORS enabled for origin: ${allowedOrigins}`);
  } catch (error) {
    logger.error(`[CORS] ${error instanceof Error ? error.message : error}`);
    await app.close();
    process.exit(1);
  }

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('OpenVScan API')
    .setDescription(
      'OpenVScan API documentation - A vulnerability scanning platform that combines open-source scanners with AI-assisted analysis',
    )
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('scan', 'Vulnerability scanning endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api/docs', app as any, document, {
    customSiteTitle: 'OpenVScan API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();