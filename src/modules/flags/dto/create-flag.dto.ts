import { IsString, IsOptional, IsBoolean, IsEnum, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FlagType } from '@prisma/client';

export class CreateFlagDto {
  @ApiProperty({
    example: 'new_checkout_flow',
    description: 'Unique key for the flag (lowercase, underscores, no spaces)',
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Key must start with a letter and contain only lowercase letters, numbers, and underscores',
  })
  key: string;

  @ApiProperty({
    example: 'New Checkout Flow',
    description: 'Human-readable name for the flag',
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: 'Enable the new checkout experience for users',
    description: 'Description of what the flag does',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: FlagType,
    example: 'BOOLEAN',
    description: 'Type of flag (BOOLEAN, PERCENTAGE, or VARIANT)',
  })
  @IsOptional()
  @IsEnum(FlagType)
  type?: FlagType;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the flag is enabled by default',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}


