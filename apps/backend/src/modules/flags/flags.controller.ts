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
import { FlagsService } from './flags.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FlagType, UserRole } from '@prisma/client';

@ApiTags('Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'flags', version: API_VERSION })
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create a new feature flag' })
  @ApiResponse({
    status: 201,
    description: 'Flag created successfully',
    schema: {
      example: {
        id: 'uuid',
        key: 'new_feature',
        name: 'New Feature',
        description: 'Enable the new feature',
        type: 'BOOLEAN',
        enabled: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        variants: [],
        targets: [],
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Flag key already exists' })
  create(@Body() dto: CreateFlagDto, @CurrentUser('id') userId: string) {
    return this.flagsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feature flags with pagination' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: FlagType })
  @ApiQuery({ name: 'enabled', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of feature flags',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            key: 'dark_mode',
            name: 'Dark Mode',
            type: 'BOOLEAN',
            enabled: true,
          },
        ],
        meta: {
          total: 1,
          skip: 0,
          take: 20,
          hasMore: false,
        },
      },
    },
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('type') type?: FlagType,
    @Query('enabled') enabled?: boolean,
  ) {
    return this.flagsService.findAll({ skip, take, search, type, enabled });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a feature flag by ID' })
  @ApiResponse({ status: 200, description: 'Feature flag details' })
  @ApiResponse({ status: 404, description: 'Flag not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.flagsService.findOne(id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get a feature flag by key' })
  @ApiResponse({ status: 200, description: 'Feature flag details' })
  @ApiResponse({ status: 404, description: 'Flag not found' })
  findByKey(@Param('key') key: string) {
    return this.flagsService.findByKey(key);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update a feature flag' })
  @ApiResponse({ status: 200, description: 'Flag updated successfully' })
  @ApiResponse({ status: 404, description: 'Flag not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFlagDto) {
    return this.flagsService.update(id, dto);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Toggle flag enabled status' })
  @ApiResponse({ status: 200, description: 'Flag toggled successfully' })
  @ApiResponse({ status: 404, description: 'Flag not found' })
  toggle(@Param('id', ParseUUIDPipe) id: string) {
    return this.flagsService.toggle(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a feature flag' })
  @ApiResponse({ status: 200, description: 'Flag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flag not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.flagsService.remove(id);
  }
}


