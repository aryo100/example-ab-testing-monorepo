import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AggregationProcessor } from './processors/aggregation.processor';
import { AggregationService } from './aggregation.service';
import { SchedulerService } from './scheduler.service';
import { AGGREGATION_QUEUE } from './constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: AGGREGATION_QUEUE,
    }),
  ],
  providers: [AggregationProcessor, AggregationService, SchedulerService],
  exports: [AggregationService],
})
export class WorkerModule {}


