import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackConversionDto {
  @ApiProperty({
    example: 'uuid',
    description: 'The experiment ID this conversion is for',
  })
  @IsUUID()
  experimentId: string;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'The exposure ID that led to this conversion (optional)',
  })
  @IsOptional()
  @IsUUID()
  exposureId?: string;

  @ApiProperty({
    example: 'purchase',
    description: 'The metric key for this conversion',
  })
  @IsString()
  metricKey: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'The conversion value (defaults to 1)',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp of the conversion (defaults to now)',
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class TrackConversionBatchDto {
  @ApiProperty({
    type: [TrackConversionDto],
    description: 'Array of conversion events to track',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackConversionDto)
  conversions: TrackConversionDto[];
}


