import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ExperimentsService } from './experiments.service';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExperimentStatus, UserRole } from '@prisma/client';

@ApiTags('Experiments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'experiments', version: API_VERSION })
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create a new experiment' })
  @ApiResponse({
    status: 201,
    description: 'Experiment created successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'Button Color Test',
        flagId: 'uuid',
        metrics: { primary: 'click_rate', secondary: ['conversion'] },
        status: 'DRAFT',
        startAt: null,
        endAt: null,
      },
    },
  })
  create(@Body() dto: CreateExperimentDto) {
    return this.experimentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all experiments with pagination' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ExperimentStatus })
  @ApiQuery({ name: 'flagId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of experiments' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: ExperimentStatus,
    @Query('flagId') flagId?: string,
  ) {
    return this.experimentsService.findAll({ skip, take, status, flagId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an experiment by ID' })
  @ApiResponse({ status: 200, description: 'Experiment details' })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.experimentsService.findOne(id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get experiment results and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Experiment results',
    schema: {
      example: {
        experiment: {
          id: 'uuid',
          name: 'Button Color Test',
          status: 'RUNNING',
        },
        variants: [
          { variant: 'control', weight: 50, exposures: 1000 },
          { variant: 'variant_blue', weight: 50, exposures: 980 },
        ],
        conversions: [
          { metric: 'click_rate', count: 150, totalValue: 150 },
        ],
        totalExposures: 1980,
      },
    },
  })
  getResults(@Param('id', ParseUUIDPipe) id: string) {
    return this.experimentsService.getResults(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update an experiment' })
  @ApiResponse({ status: 200, description: 'Experiment updated successfully' })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExperimentDto,
  ) {
    return this.experimentsService.update(id, dto);
  }

  @Post(':id/start')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Start an experiment' })
  @ApiResponse({ status: 200, description: 'Experiment started' })
  @ApiResponse({ status: 400, description: 'Invalid experiment state' })
  start(@Param('id', ParseUUIDPipe) id: string) {
    return this.experimentsService.start(id);
  }

  @Post(':id/pause')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Pause an experiment' })
  @ApiResponse({ status: 200, description: 'Experiment paused' })
  @ApiResponse({ status: 400, description: 'Invalid experiment state' })
  pause(@Param('id', ParseUUIDPipe) id: string) {
    return this.experimentsService.pause(id);
  }

  @Post(':id/stop')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Stop/complete an experiment' })
  @ApiResponse({ status: 200, description: 'Experiment stopped' })
  @ApiResponse({ status: 400, description: 'Invalid experiment state' })
  stop(@Param('id', ParseUUIDPipe) id: string) {
    return this.experimentsService.stop(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an experiment' })
  @ApiResponse({ status: 200, description: 'Experiment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Experiment not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.experimentsService.remove(id);
  }
}


