import { IsString, IsOptional, IsInt, Min, Max, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiProperty({
    example: 'variant_a',
    description: 'Unique key for the variant within the flag',
  })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Key must start with a letter and contain only lowercase letters, numbers, and underscores',
  })
  key: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Weight for variant distribution (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  weight?: number;
}


