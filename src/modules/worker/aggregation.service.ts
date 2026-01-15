import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run daily aggregation job
   * 1. Group exposures by flag/variant for the target date
   * 2. Group conversions by experiment for the target date
   * 3. Insert/update aggregates table
   * 4. Optionally cleanup old event logs
   */
  async runDailyAggregation(targetDate?: Date): Promise<{
    processedFlags: number;
    processedExposures: number;
    processedConversions: number;
    cleanedUpEvents: number;
  }> {
    const date = targetDate || this.getYesterdayDate();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    this.logger.log(`Starting daily aggregation for ${date.toISOString().split('T')[0]}`);

    let processedFlags = 0;
    let processedExposures = 0;
    let processedConversions = 0;
    let cleanedUpEvents = 0;

    try {
      // Step 1: Aggregate exposures by flag and variant
      const exposureAggregates = await this.aggregateExposures(startOfDay, endOfDay);
      processedFlags = exposureAggregates.flagCount;
      processedExposures = exposureAggregates.exposureCount;

      // Step 2: Aggregate conversions by experiment
      const conversionAggregates = await this.aggregateConversions(startOfDay, endOfDay);
      processedConversions = conversionAggregates.conversionCount;

      // Step 3: Store aggregates in database
      await this.storeAggregates(date, exposureAggregates.data, conversionAggregates.data);

      // Step 4: Cleanup old events (optional, keep last 90 days)
      cleanedUpEvents = await this.cleanupOldEvents(90);

      this.logger.log(
        `Daily aggregation completed: ${processedFlags} flags, ${processedExposures} exposures, ${processedConversions} conversions`,
      );
    } catch (error) {
      this.logger.error('Daily aggregation failed', error);
      throw error;
    }

    return {
      processedFlags,
      processedExposures,
      processedConversions,
      cleanedUpEvents,
    };
  }

  /**
   * Aggregate exposures grouped by flag and variant
   */
  private async aggregateExposures(startOfDay: Date, endOfDay: Date) {
    const exposures = await this.prisma.exposure.groupBy({
      by: ['flagId', 'variantKey'],
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: true,
    });

    const flagIds = new Set(exposures.map((e) => e.flagId));

    return {
      flagCount: flagIds.size,
      exposureCount: exposures.reduce((sum, e) => sum + e._count, 0),
      data: exposures.map((e) => ({
        flagId: e.flagId,
        variantKey: e.variantKey,
        impressions: e._count,
      })),
    };
  }

  /**
   * Aggregate conversions grouped by experiment
   */
  private async aggregateConversions(startOfDay: Date, endOfDay: Date) {
    // Get all conversions for the day with their exposure variant info
    const conversions = await this.prisma.conversion.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        experiment: true,
        exposure: {
          select: {
            flagId: true,
            variantKey: true,
          },
        },
      },
    });

    // Group by flag and variant
    const grouped = conversions.reduce(
      (acc, conv) => {
        const flagId = conv.exposure?.flagId || conv.experiment.flagId;
        const variantKey = conv.exposure?.variantKey || null;
        const key = `${flagId}:${variantKey}`;

        if (!acc[key]) {
          acc[key] = {
            flagId,
            variantKey,
            count: 0,
          };
        }
        acc[key].count += 1;

        return acc;
      },
      {} as Record<string, { flagId: string; variantKey: string | null; count: number }>,
    );

    return {
      conversionCount: conversions.length,
      data: Object.values(grouped),
    };
  }

  /**
   * Store aggregated data in the aggregates table
   */
  private async storeAggregates(
    date: Date,
    exposureData: { flagId: string; variantKey: string | null; impressions: number }[],
    conversionData: { flagId: string; variantKey: string | null; count: number }[],
  ) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // Create a map of conversions by flag+variant
    const conversionMap = new Map(
      conversionData.map((c) => [`${c.flagId}:${c.variantKey}`, c.count]),
    );

    // Upsert aggregates for each flag/variant combination
    const operations = exposureData.map((exp) => {
      const conversionCount = conversionMap.get(`${exp.flagId}:${exp.variantKey}`) || 0;

      return this.prisma.aggregate.upsert({
        where: {
          date_flagId_variantKey: {
            date: dateOnly,
            flagId: exp.flagId,
            variantKey: exp.variantKey ?? '',
          },
        },
        create: {
          date: dateOnly,
          flagId: exp.flagId,
          variantKey: exp.variantKey ?? '',
          impressions: exp.impressions,
          conversions: conversionCount,
        },
        update: {
          impressions: exp.impressions,
          conversions: conversionCount,
        },
      });
    });

    await this.prisma.$transaction(operations);
  }

  /**
   * Cleanup old exposure and conversion events
   * Keep only the last N days of raw events
   */
  private async cleanupOldEvents(keepDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    const [deletedExposures, deletedConversions] = await Promise.all([
      this.prisma.exposure.deleteMany({
        where: {
          timestamp: { lt: cutoffDate },
        },
      }),
      this.prisma.conversion.deleteMany({
        where: {
          timestamp: { lt: cutoffDate },
        },
      }),
    ]);

    const total = deletedExposures.count + deletedConversions.count;
    if (total > 0) {
      this.logger.log(`Cleaned up ${total} old events (${deletedExposures.count} exposures, ${deletedConversions.count} conversions)`);
    }

    return total;
  }

  /**
   * Get yesterday's date at midnight
   */
  private getYesterdayDate(): Date {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  }

  /**
   * Backfill aggregates for a date range
   */
  async backfillAggregates(startDate: Date, endDate: Date): Promise<void> {
    const current = new Date(startDate);
    
    while (current <= endDate) {
      await this.runDailyAggregation(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
}


