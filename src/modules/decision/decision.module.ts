import { Module } from '@nestjs/common';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';
import { ConstraintEvaluator } from './helpers/constraint-evaluator';
import { HashingService } from './helpers/hashing.service';

@Module({
  controllers: [DecisionController],
  providers: [DecisionService, ConstraintEvaluator, HashingService],
  exports: [DecisionService],
})
export class DecisionModule {}


