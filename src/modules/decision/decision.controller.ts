import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { API_VERSION } from '../../common/constants/api.constants';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DecisionService, DecisionResponse } from './decision.service';
import { DecisionRequestDto } from './dto/decision-request.dto';

@ApiTags('Decision')
@Controller({ path: 'client', version: API_VERSION })
export class DecisionController {
  constructor(private readonly decisionService: DecisionService) {}

  @Post('decide')
  @ApiOperation({
    summary: 'Get feature flag decisions for a client',
    description:
      'Evaluates feature flags for the given client ID and returns decisions for each requested flag.',
  })
  @ApiResponse({
    status: 200,
    description: 'Flag decisions',
    schema: {
      example: {
        dark_mode: {
          enabled: true,
          reason: 'boolean_flag',
        },
        new_checkout: {
          enabled: true,
          reason: 'percentage_rollout_included',
        },
        button_color: {
          enabled: true,
          variant: 'variant_blue',
          reason: 'variant_selected',
        },
      },
    },
  })
  async decide(@Body() dto: DecisionRequestDto): Promise<DecisionResponse> {
    return this.decisionService.decide(dto);
  }

  @Get('decide')
  @ApiOperation({
    summary: 'Get all feature flag decisions for a client',
    description: 'Evaluates all feature flags for the given client ID.',
  })
  @ApiQuery({ name: 'clientId', required: true, type: String })
  @ApiQuery({ name: 'environment', required: false, type: String })
  @ApiQuery({
    name: 'context',
    required: false,
    type: String,
    description: 'JSON-encoded context object',
  })
  @ApiResponse({
    status: 200,
    description: 'All flag decisions for the client',
  })
  async decideAll(
    @Query('clientId') clientId: string,
    @Query('environment') environment?: string,
    @Query('context') contextJson?: string,
  ): Promise<DecisionResponse> {
    let context = {};
    if (contextJson) {
      try {
        context = JSON.parse(contextJson);
      } catch {
        // Invalid JSON, use empty context
      }
    }

    return this.decisionService.decideAll(clientId, context, environment);
  }
}


