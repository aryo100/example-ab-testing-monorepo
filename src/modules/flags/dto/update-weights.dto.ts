import { IsArray, ValidateNested, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class WeightItem {
  @ApiProperty({ description: 'Variant ID' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ description: 'Weight (0-100)', minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  weight: number;
}

export class UpdateWeightsDto {
  @ApiProperty({
    description: 'Array of variant weights (must total 100)',
    type: [WeightItem],
    example: [
      { variantId: 'uuid-1', weight: 50 },
      { variantId: 'uuid-2', weight: 30 },
      { variantId: 'uuid-3', weight: 20 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightItem)
  weights: WeightItem[];
}


