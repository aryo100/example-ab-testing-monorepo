import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { FlagsModule } from './modules/flags/flags.module';
import { ExperimentsModule } from './modules/experiments/experiments.module';
import { DecisionModule } from './modules/decision/decision.module';
import { EventsModule } from './modules/events/events.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WorkerModule } from './modules/worker/worker.module';
import { HealthController } from './health.controller';
import { RedisService } from './modules/redis/redis.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // BullMQ Queue
    BullModule.forRoot({
      redis: {
        host: process.env.BULL_REDIS_HOST || 'localhost',
        port: parseInt(process.env.BULL_REDIS_PORT || '6379', 10),
      },
    }),

    // Core modules
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    FlagsModule,
    ExperimentsModule,
    DecisionModule,
    EventsModule,
    AnalyticsModule,
    WorkerModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    // Warm up Redis cache on application bootstrap
    await this.redisService.warmUpCache();
  }
}


