import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { API_VERSION } from './common/constants/api.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'],
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
  });

  // Swagger documentation
  if (configService.get<string>('SWAGGER_ENABLED', 'true') === 'true') {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'A/B Testing API'))
      .setDescription(
        configService.get<string>(
          'SWAGGER_DESCRIPTION',
          'API for A/B Testing and Feature Flags Platform',
        ),
      )
      .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0'))
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Flags', 'Feature flags management')
      .addTag('Experiments', 'Experiments management')
      .addTag('Decision', 'Client-side decision API')
      .addTag('Events', 'Telemetry events')
      .addTag('Analytics', 'Analytics and reporting')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap();


