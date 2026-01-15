import {
  IsString,
  IsOptional,
  IsObject,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackExposureDto {
  @ApiProperty({
    example: 'button_color',
    description: 'The feature flag key',
  })
  @IsString()
  flagKey: string;

  @ApiPropertyOptional({
    example: 'user_123',
    description: 'The user identifier (if authenticated)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    example: 'variant_blue',
    description: 'The variant key the user was exposed to',
  })
  @IsOptional()
  @IsString()
  variantKey?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp of the exposure (defaults to now)',
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({
    example: { sessionId: 'abc123', page: '/checkout' },
    description: 'Additional metadata about the exposure',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class TrackExposureBatchDto {
  @ApiProperty({
    type: [TrackExposureDto],
    description: 'Array of exposure events to track',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackExposureDto)
  exposures: TrackExposureDto[];
}


