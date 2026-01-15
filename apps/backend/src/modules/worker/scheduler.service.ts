import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AGGREGATION_QUEUE } from './constants';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue(AGGREGATION_QUEUE)
    private readonly aggregationQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule the nightly aggregation job
    await this.scheduleNightlyAggregation();
  }

  /**
   * Schedule the daily aggregation job to run at 2:00 AM every day
   */
  async scheduleNightlyAggregation() {
    // Remove any existing repeatable jobs first
    const existingJobs = await this.aggregationQueue.getRepeatableJobs();
    for (const job of existingJobs) {
      if (job.name === 'daily-aggregation') {
        await this.aggregationQueue.removeRepeatableByKey(job.key);
      }
    }

    // Add new repeatable job
    await this.aggregationQueue.add(
      'daily-aggregation',
      { type: 'daily' },
      {
        repeat: {
          cron: '0 2 * * *', // Run at 2:00 AM every day
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
      },
    );

    this.logger.log('Scheduled nightly aggregation job at 2:00 AM daily');
  }

  /**
   * Manually trigger a daily aggregation for a specific date
   */
  async triggerDailyAggregation(targetDate?: Date) {
    const job = await this.aggregationQueue.add('daily-aggregation', {
      type: 'daily',
      targetDate: targetDate?.toISOString(),
    });

    this.logger.log(`Manually triggered daily aggregation job ${job.id}`);
    return job;
  }

  /**
   * Trigger a backfill aggregation for a date range
   */
  async triggerBackfillAggregation(startDate: Date, endDate: Date) {
    const job = await this.aggregationQueue.add('backfill-aggregation', {
      type: 'backfill',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    this.logger.log(`Triggered backfill aggregation job ${job.id} from ${startDate} to ${endDate}`);
    return job;
  }

  /**
   * Get queue status
   */
  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.aggregationQueue.getWaitingCount(),
      this.aggregationQueue.getActiveCount(),
      this.aggregationQueue.getCompletedCount(),
      this.aggregationQueue.getFailedCount(),
      this.aggregationQueue.getDelayedCount(),
    ]);

    const repeatableJobs = await this.aggregationQueue.getRepeatableJobs();

    return {
      queue: AGGREGATION_QUEUE,
      counts: {
        waiting,
        active,
        completed,
        failed,
        delayed,
      },
      repeatableJobs: repeatableJobs.map((job) => ({
        name: job.name,
        cron: job.cron,
        next: job.next,
      })),
    };
  }
}


