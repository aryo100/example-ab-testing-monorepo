import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExperimentStatus } from '@prisma/client';
import { CreateExperimentDto } from './create-experiment.dto';

export class UpdateExperimentDto extends PartialType(CreateExperimentDto) {
  @ApiPropertyOptional({
    enum: ExperimentStatus,
    description: 'Experiment status',
  })
  @IsOptional()
  @IsEnum(ExperimentStatus)
  status?: ExperimentStatus;
}


