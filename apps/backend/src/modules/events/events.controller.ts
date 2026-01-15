import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { API_VERSION } from '../../common/constants/api.constants';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { TrackExposureDto, TrackExposureBatchDto } from './dto/track-exposure.dto';
import { TrackConversionDto, TrackConversionBatchDto } from './dto/track-conversion.dto';

@ApiTags('Events')
@Controller({ path: 'events', version: API_VERSION })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('exposure')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track a flag exposure event',
    description: 'Record when a user is exposed to a feature flag variant',
  })
  @ApiBody({ type: TrackExposureDto })
  @ApiResponse({
    status: 200,
    description: 'Exposure tracked successfully',
    schema: {
      example: {
        id: 'uuid',
        success: true,
        message: 'Exposure tracked successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Flag not found' })
  trackExposure(@Body() dto: TrackExposureDto) {
    return this.eventsService.trackExposure(dto);
  }

  @Post('exposure/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track multiple exposure events',
    description: 'Record multiple flag exposures in a single request',
  })
  @ApiBody({ type: TrackExposureBatchDto })
  @ApiResponse({
    status: 200,
    description: 'Exposures processed',
    schema: {
      example: {
        success: true,
        processed: 10,
        successful: 10,
        failed: 0,
      },
    },
  })
  trackExposureBatch(@Body() dto: TrackExposureBatchDto) {
    return this.eventsService.trackExposureBatch(dto.exposures);
  }

  @Post('conversion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track a conversion event',
    description: 'Record when a user converts in an experiment',
  })
  @ApiBody({ type: TrackConversionDto })
  @ApiResponse({
    status: 200,
    description: 'Conversion tracked successfully',
    schema: {
      example: {
        id: 'uuid',
        success: true,
        message: 'Conversion tracked successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Experiment or exposure not found' })
  trackConversion(@Body() dto: TrackConversionDto) {
    return this.eventsService.trackConversion(dto);
  }

  @Post('conversion/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track multiple conversion events',
    description: 'Record multiple conversions in a single request',
  })
  @ApiBody({ type: TrackConversionBatchDto })
  @ApiResponse({
    status: 200,
    description: 'Conversions processed',
    schema: {
      example: {
        success: true,
        processed: 5,
        successful: 5,
        failed: 0,
      },
    },
  })
  trackConversionBatch(@Body() dto: TrackConversionBatchDto) {
    return this.eventsService.trackConversionBatch(dto.conversions);
  }
}


