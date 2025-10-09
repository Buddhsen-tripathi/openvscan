import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
// import * as dotenv from 'dotenv';

// dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  try {
    const allowedOrigins = configService.get<string>('FRONTEND_URL');
    if (!allowedOrigins) {
      throw new Error(
        'FRONTEND_URL environment variable is required to configure CORS.',
      );
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

  // Swagger documentation
  setupSwaggerDocumentation(app);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}

function setupSwaggerDocumentation(app: INestApplication) {
  // console.log(process);
  const title = process.env.npm_package_name || 'OpenVScan API';
  const description =
    process.env.npm_package_description ||
    'OpenVScan API documentation - A vulnerability scanning platform that combines open-source scanners with AI-assisted analysis';
  const version = process.env.npm_package_version || '1.0';

  const swaggerConfig = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: `${title} docs`,
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true, // ✅ Keeps JWT token even after refresh
    },
  });
}

bootstrap();
