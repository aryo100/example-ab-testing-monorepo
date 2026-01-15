import {
  IsString,
  IsArray,
  IsOptional,
  IsObject,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface ClientContext {
  userId?: string;
  country?: string;
  plan?: string;
  appVersion?: string;
  platform?: string;
  [key: string]: unknown;
}

export class DecisionRequestDto {
  @ApiProperty({
    example: 'user_123',
    description: 'Unique client/user identifier for consistent bucketing',
  })
  @IsString()
  clientId: string;

  @ApiProperty({
    example: ['dark_mode', 'new_checkout', 'button_color'],
    description: 'Array of flag keys to evaluate',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  flagKeys: string[];

  @ApiPropertyOptional({
    example: {
      country: 'ID',
      plan: 'pro',
      appVersion: '2.5.0',
      platform: 'ios',
    },
    description: 'Client context for constraint evaluation',
  })
  @IsOptional()
  @IsObject()
  context?: ClientContext;

  @ApiPropertyOptional({
    example: 'production',
    description: 'Environment name for target evaluation',
  })
  @IsOptional()
  @IsString()
  environment?: string;
}


