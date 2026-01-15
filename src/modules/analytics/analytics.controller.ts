import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { API_VERSION } from '../../common/constants/api.constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'analytics', version: API_VERSION })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview stats',
    schema: {
      example: {
        flags: { total: 10, enabled: 7, disabled: 3 },
        experiments: { total: 5, running: 2 },
        events: { exposuresLast24h: 15000, conversionsLast24h: 450 },
      },
    },
  })
  getDashboardOverview() {
    return this.analyticsService.getDashboardOverview();
  }

  @Get('flags/:id/summary')
  @ApiOperation({ summary: 'Get analytics summary for a specific flag' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({
    status: 200,
    description: 'Flag analytics summary',
    schema: {
      example: {
        flag: {
          id: 'uuid',
          key: 'button_color',
          name: 'Button Color Test',
          type: 'VARIANT',
          enabled: true,
        },
        summary: {
          totalExposures: 10000,
          uniqueUsers: 8500,
          variantBreakdown: [
            { variant: 'control', exposures: 5000, percentage: 50 },
            { variant: 'variant_blue', exposures: 5000, percentage: 50 },
          ],
        },
        timeline: [
          { date: '2024-01-01', exposures: 500 },
          { date: '2024-01-02', exposures: 520 },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Flag not found' })
  getFlagSummary(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getFlagSummary(id, days || 30);
  }

  @Get('experiments/:id')
  @ApiOperation({ summary: 'Get detailed analytics for an experiment' })
  @ApiResponse({
    status: 200,
    description: 'Experiment analytics',
    schema: {
      example: {
        experiment: {
          id: 'uuid',
          name: 'Button Color Experiment',
          status: 'RUNNING',
          startAt: '2024-01-01T00:00:00.000Z',
          endAt: null,
        },
        variants: [
          {
            key: 'control',
            weight: 50,
            exposures: 5000,
            conversions: 150,
            conversionRate: 3.0,
          },
          {
            key: 'variant_blue',
            weight: 50,
            exposures: 5000,
            conversions: 200,
            conversionRate: 4.0,
          },
        ],
        metrics: [
          {
            key: 'click_rate',
            totalConversions: 350,
            totalValue: 350,
            averageValue: 1,
          },
        ],
        significance: {
          isSignificant: true,
          confidenceLevel: 95,
          winner: 'variant_blue',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  getExperimentAnalytics(@Param('id', ParseUUIDPipe) id: string) {
    return this.analyticsService.getExperimentAnalytics(id);
  }

  @Get('flags/:id/aggregates')
  @ApiOperation({ summary: 'Get aggregated data for a flag' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (ISO format)' })
  @ApiResponse({
    status: 200,
    description: 'Aggregated flag data',
    schema: {
      example: {
        flagId: 'uuid',
        data: [
          {
            date: '2024-01-01',
            impressions: 1000,
            conversions: 30,
            variants: {
              control: { impressions: 500, conversions: 15 },
              variant_a: { impressions: 500, conversions: 15 },
            },
          },
        ],
      },
    },
  })
  getAggregates(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getAggregates(id, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}


