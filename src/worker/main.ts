import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerAppModule } from './worker-app.module';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  
  const app = await NestFactory.createApplicationContext(WorkerAppModule);
  
  logger.log('🚀 Worker started successfully');
  logger.log('📊 Listening for aggregation jobs...');

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down worker...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down worker...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();


