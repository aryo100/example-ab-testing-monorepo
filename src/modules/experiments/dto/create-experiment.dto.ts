import {
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExperimentDto {
  @ApiProperty({
    example: 'Button Color A/B Test',
    description: 'Name of the experiment',
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'uuid',
    description: 'ID of the feature flag to test',
  })
  @IsUUID()
  flagId: string;

  @ApiPropertyOptional({
    example: { primary: 'click_rate', secondary: ['conversion_rate'] },
    description: 'Metrics to track for this experiment',
  })
  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Scheduled start date',
  })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({
    example: '2024-02-15T00:00:00.000Z',
    description: 'Scheduled end date',
  })
  @IsOptional()
  @IsDateString()
  endAt?: string;
}


