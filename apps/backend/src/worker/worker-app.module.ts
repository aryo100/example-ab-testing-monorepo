import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { WorkerModule } from '../modules/worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.BULL_REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.BULL_REDIS_PORT || '6379', 10),
    //   },
    // }),
    
    PrismaModule,
    WorkerModule,
  ],
})
export class WorkerAppModule {}


