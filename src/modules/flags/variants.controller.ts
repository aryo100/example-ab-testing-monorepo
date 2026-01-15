import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { API_VERSION } from '../../common/constants/api.constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { UpdateWeightsDto } from './dto/update-weights.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'flags/:flagId/variants', version: API_VERSION })
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create a new variant for a flag' })
  @ApiResponse({
    status: 201,
    description: 'Variant created successfully',
    schema: {
      example: {
        id: 'uuid',
        flagId: 'uuid',
        key: 'variant_a',
        weight: 50,
      },
    },
  })
  create(
    @Param('flagId', ParseUUIDPipe) flagId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.variantsService.create(flagId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all variants for a flag' })
  @ApiResponse({ status: 200, description: 'List of variants' })
  findAll(@Param('flagId', ParseUUIDPipe) flagId: string) {
    return this.variantsService.findAll(flagId);
  }

  @Get(':variantId')
  @ApiOperation({ summary: 'Get a variant by ID' })
  @ApiResponse({ status: 200, description: 'Variant details' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  findOne(
    @Param('flagId', ParseUUIDPipe) flagId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.variantsService.findOne(flagId, variantId);
  }

  @Patch(':variantId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update a variant' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  update(
    @Param('flagId', ParseUUIDPipe) flagId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.variantsService.update(flagId, variantId, dto);
  }

  @Patch('weights')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update all variant weights for a flag' })
  @ApiResponse({ status: 200, description: 'Weights updated successfully' })
  updateWeights(
    @Param('flagId', ParseUUIDPipe) flagId: string,
    @Body() dto: UpdateWeightsDto,
  ) {
    return this.variantsService.updateWeights(flagId, dto.weights);
  }

  @Delete(':variantId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a variant' })
  @ApiResponse({ status: 200, description: 'Variant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  remove(
    @Param('flagId', ParseUUIDPipe) flagId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.variantsService.remove(flagId, variantId);
  }
}


