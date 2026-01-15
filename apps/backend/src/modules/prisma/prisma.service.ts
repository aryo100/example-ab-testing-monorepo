import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Delete in correct order to respect foreign key constraints
    await this.$transaction([
      this.aggregate.deleteMany(),
      this.conversion.deleteMany(),
      this.exposure.deleteMany(),
      this.experiment.deleteMany(),
      this.flagTarget.deleteMany(),
      this.flagVariant.deleteMany(),
      this.featureFlag.deleteMany(),
      this.environment.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}


