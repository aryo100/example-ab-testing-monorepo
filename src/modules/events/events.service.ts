import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackExposureDto } from './dto/track-exposure.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track a flag exposure event
   * Called when a client is exposed to a feature flag
   */
  async trackExposure(dto: TrackExposureDto) {
    // Get flag by key
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key: dto.flagKey },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with key "${dto.flagKey}" not found`);
    }

    const exposure = await this.prisma.exposure.create({
      data: {
        userId: dto.userId,
        flagId: flag.id,
        variantKey: dto.variantKey,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });

    return {
      id: exposure.id,
      success: true,
      message: 'Exposure tracked successfully',
    };
  }

  /**
   * Track multiple exposure events in batch
   */
  async trackExposureBatch(exposures: TrackExposureDto[]) {
    const results = await Promise.allSettled(
      exposures.map((dto) => this.trackExposure(dto)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      processed: exposures.length,
      successful,
      failed,
    };
  }

  /**
   * Track a conversion event
   * Links to an experiment and optionally to a specific exposure
   */
  async trackConversion(dto: TrackConversionDto) {
    // Verify experiment exists
    const experiment = await this.prisma.experiment.findUnique({
      where: { id: dto.experimentId },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${dto.experimentId}" not found`);
    }

    // Optionally verify exposure exists
    if (dto.exposureId) {
      const exposure = await this.prisma.exposure.findUnique({
        where: { id: dto.exposureId },
      });

      if (!exposure) {
        throw new NotFoundException(`Exposure with ID "${dto.exposureId}" not found`);
      }
    }

    const conversion = await this.prisma.conversion.create({
      data: {
        exposureId: dto.exposureId,
        experimentId: dto.experimentId,
        metricKey: dto.metricKey,
        value: dto.value ?? 1,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      },
    });

    return {
      id: conversion.id,
      success: true,
      message: 'Conversion tracked successfully',
    };
  }

  /**
   * Track multiple conversion events in batch
   */
  async trackConversionBatch(conversions: TrackConversionDto[]) {
    const results = await Promise.allSettled(
      conversions.map((dto) => this.trackConversion(dto)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      processed: conversions.length,
      successful,
      failed,
    };
  }

  /**
   * Get exposures for a specific flag
   */
  async getExposures(
    flagId: string,
    params?: {
      from?: Date;
      to?: Date;
      skip?: number;
      take?: number;
    },
  ) {
    const { from, to, skip = 0, take = 100 } = params || {};

    const where: Prisma.ExposureWhereInput = { flagId };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    const [exposures, total] = await Promise.all([
      this.prisma.exposure.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.exposure.count({ where }),
    ]);

    return {
      data: exposures,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  /**
   * Get conversions for a specific experiment
   */
  async getConversions(
    experimentId: string,
    params?: {
      from?: Date;
      to?: Date;
      metricKey?: string;
      skip?: number;
      take?: number;
    },
  ) {
    const { from, to, metricKey, skip = 0, take = 100 } = params || {};

    const where: Prisma.ConversionWhereInput = { experimentId };

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    if (metricKey) {
      where.metricKey = metricKey;
    }

    const [conversions, total] = await Promise.all([
      this.prisma.conversion.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          exposure: {
            select: {
              userId: true,
              variantKey: true,
            },
          },
        },
      }),
      this.prisma.conversion.count({ where }),
    ]);

    return {
      data: conversions,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }
}


