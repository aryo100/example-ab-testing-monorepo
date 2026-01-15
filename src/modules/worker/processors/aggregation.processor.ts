import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AggregationService } from '../aggregation.service';
import { AGGREGATION_QUEUE } from '../constants';

export interface AggregationJobData {
  type: 'daily' | 'backfill';
  targetDate?: string;
  startDate?: string;
  endDate?: string;
}

@Processor(AGGREGATION_QUEUE)
export class AggregationProcessor {
  private readonly logger = new Logger(AggregationProcessor.name);

  constructor(private readonly aggregationService: AggregationService) {}

  @Process('daily-aggregation')
  async handleDailyAggregation(job: Job<AggregationJobData>) {
    this.logger.debug(`Processing daily aggregation job ${job.id}`);

    const targetDate = job.data.targetDate ? new Date(job.data.targetDate) : undefined;
    
    const result = await this.aggregationService.runDailyAggregation(targetDate);
    
    return result;
  }

  @Process('backfill-aggregation')
  async handleBackfillAggregation(job: Job<AggregationJobData>) {
    this.logger.debug(`Processing backfill aggregation job ${job.id}`);

    if (!job.data.startDate || !job.data.endDate) {
      throw new Error('startDate and endDate are required for backfill');
    }

    const startDate = new Date(job.data.startDate);
    const endDate = new Date(job.data.endDate);

    await this.aggregationService.backfillAggregates(startDate, endDate);

    return { success: true, startDate, endDate };
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} started processing`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: unknown) {
    this.logger.log(`Job ${job.id} completed with result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`, error.stack);
  }
}


