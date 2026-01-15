import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface FlagSummary {
  flag: {
    id: string;
    key: string;
    name: string;
    type: string;
    enabled: boolean;
  };
  summary: {
    totalExposures: number;
    uniqueUsers: number;
    variantBreakdown: {
      variant: string;
      exposures: number;
      percentage: number;
    }[];
  };
  timeline: {
    date: string;
    exposures: number;
  }[];
}

export interface ExperimentAnalytics {
  experiment: {
    id: string;
    name: string;
    status: string;
    startAt: Date | null;
    endAt: Date | null;
  };
  variants: {
    key: string;
    weight: number;
    exposures: number;
    conversions: number;
    conversionRate: number;
  }[];
  metrics: {
    key: string;
    totalConversions: number;
    totalValue: number;
    averageValue: number;
  }[];
  significance?: {
    isSignificant: boolean;
    confidenceLevel: number;
    winner?: string;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get summary analytics for a specific flag
   */
  async getFlagSummary(flagId: string, days: number = 30): Promise<FlagSummary> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: flagId },
      include: { variants: true },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${flagId}" not found`);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get exposure counts
    const exposures = await this.prisma.exposure.findMany({
      where: {
        flagId,
        timestamp: { gte: startDate },
      },
      select: {
        userId: true,
        variantKey: true,
        timestamp: true,
      },
    });

    // Calculate unique users
    const uniqueUsers = new Set(exposures.map((e) => e.userId).filter(Boolean)).size;

    // Calculate variant breakdown
    const variantCounts = exposures.reduce(
      (acc, e) => {
        const key = e.variantKey || 'default';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalExposures = exposures.length;
    const variantBreakdown = Object.entries(variantCounts).map(([variant, count]) => ({
      variant,
      exposures: count,
      percentage: totalExposures > 0 ? (count / totalExposures) * 100 : 0,
    }));

    // Calculate daily timeline
    const dailyCounts = exposures.reduce(
      (acc, e) => {
        const date = e.timestamp.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const timeline = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, exposures: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      flag: {
        id: flag.id,
        key: flag.key,
        name: flag.name,
        type: flag.type,
        enabled: flag.enabled,
      },
      summary: {
        totalExposures,
        uniqueUsers,
        variantBreakdown,
      },
      timeline,
    };
  }

  /**
   * Get detailed analytics for an experiment
   */
  async getExperimentAnalytics(experimentId: string): Promise<ExperimentAnalytics> {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        flag: {
          include: { variants: true },
        },
      },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${experimentId}" not found`);
    }

    const dateFilter = {
      ...(experiment.startAt && { gte: experiment.startAt }),
      ...(experiment.endAt && { lte: experiment.endAt }),
    };

    // Get exposures grouped by variant
    const exposures = await this.prisma.exposure.groupBy({
      by: ['variantKey'],
      where: {
        flagId: experiment.flagId,
        timestamp: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      _count: true,
    });

    // Get conversions grouped by variant (through exposure)
    const conversions = await this.prisma.conversion.findMany({
      where: {
        experimentId,
      },
      include: {
        exposure: {
          select: { variantKey: true },
        },
      },
    });

    // Group conversions by variant
    const conversionsByVariant = conversions.reduce(
      (acc, c) => {
        const variant = c.exposure?.variantKey || 'unknown';
        if (!acc[variant]) {
          acc[variant] = { count: 0, value: 0 };
        }
        acc[variant].count += 1;
        acc[variant].value += c.value;
        return acc;
      },
      {} as Record<string, { count: number; value: number }>,
    );

    // Group conversions by metric
    const conversionsByMetric = conversions.reduce(
      (acc, c) => {
        if (!acc[c.metricKey]) {
          acc[c.metricKey] = { count: 0, value: 0 };
        }
        acc[c.metricKey].count += 1;
        acc[c.metricKey].value += c.value;
        return acc;
      },
      {} as Record<string, { count: number; value: number }>,
    );

    // Build variant analytics
    const variantAnalytics = experiment.flag.variants.map((variant) => {
      const exposureData = exposures.find((e) => e.variantKey === variant.key);
      const exposureCount = exposureData?._count || 0;
      const conversionData = conversionsByVariant[variant.key] || { count: 0 };
      const conversionRate =
        exposureCount > 0 ? (conversionData.count / exposureCount) * 100 : 0;

      return {
        key: variant.key,
        weight: variant.weight,
        exposures: exposureCount,
        conversions: conversionData.count,
        conversionRate,
      };
    });

    // Build metrics analytics
    const metricsAnalytics = Object.entries(conversionsByMetric).map(([key, data]) => ({
      key,
      totalConversions: data.count,
      totalValue: data.value,
      averageValue: data.count > 0 ? data.value / data.count : 0,
    }));

    // Calculate statistical significance (simplified)
    const significance = this.calculateSignificance(variantAnalytics);

    return {
      experiment: {
        id: experiment.id,
        name: experiment.name,
        status: experiment.status,
        startAt: experiment.startAt,
        endAt: experiment.endAt,
      },
      variants: variantAnalytics,
      metrics: metricsAnalytics,
      significance,
    };
  }

  /**
   * Get aggregated data from the aggregates table
   */
  async getAggregates(
    flagId: string,
    params?: { from?: Date; to?: Date },
  ) {
    const { from, to } = params || {};

    const where: Prisma.AggregateWhereInput = { flagId };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    const aggregates = await this.prisma.aggregate.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    // Group by date
    const byDate = aggregates.reduce(
      (acc, agg) => {
        const dateStr = agg.date.toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = { impressions: 0, conversions: 0, variants: {} };
        }
        acc[dateStr].impressions += agg.impressions;
        acc[dateStr].conversions += agg.conversions;
        
        if (agg.variantKey) {
          acc[dateStr].variants[agg.variantKey] = {
            impressions: agg.impressions,
            conversions: agg.conversions,
          };
        }
        
        return acc;
      },
      {} as Record<string, {
        impressions: number;
        conversions: number;
        variants: Record<string, { impressions: number; conversions: number }>;
      }>,
    );

    return {
      flagId,
      data: Object.entries(byDate).map(([date, data]) => ({
        date,
        ...data,
      })),
    };
  }

  /**
   * Get dashboard overview stats
   */
  async getDashboardOverview() {
    const [
      totalFlags,
      enabledFlags,
      totalExperiments,
      runningExperiments,
      recentExposures,
      recentConversions,
    ] = await Promise.all([
      this.prisma.featureFlag.count(),
      this.prisma.featureFlag.count({ where: { enabled: true } }),
      this.prisma.experiment.count(),
      this.prisma.experiment.count({ where: { status: 'RUNNING' } }),
      this.prisma.exposure.count({
        where: {
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.conversion.count({
        where: {
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      flags: {
        total: totalFlags,
        enabled: enabledFlags,
        disabled: totalFlags - enabledFlags,
      },
      experiments: {
        total: totalExperiments,
        running: runningExperiments,
      },
      events: {
        exposuresLast24h: recentExposures,
        conversionsLast24h: recentConversions,
      },
    };
  }

  /**
   * Simplified statistical significance calculation
   * Uses a basic z-test for comparing two proportions
   */
  private calculateSignificance(
    variants: { key: string; exposures: number; conversions: number; conversionRate: number }[],
  ): { isSignificant: boolean; confidenceLevel: number; winner?: string } | undefined {
    if (variants.length < 2) {
      return undefined;
    }

    // Find control (first variant) and best performing variant
    const control = variants[0];
    const others = variants.slice(1);

    if (control.exposures < 100) {
      return {
        isSignificant: false,
        confidenceLevel: 0,
        winner: undefined,
      };
    }

    // Find the best performing variant
    const best = others.reduce(
      (best, current) =>
        current.conversionRate > best.conversionRate ? current : best,
      others[0],
    );

    // Calculate z-score
    const p1 = control.conversions / control.exposures;
    const p2 = best.conversions / best.exposures;
    const n1 = control.exposures;
    const n2 = best.exposures;

    const pooledP = (control.conversions + best.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

    if (se === 0) {
      return {
        isSignificant: false,
        confidenceLevel: 0,
        winner: undefined,
      };
    }

    const z = Math.abs(p2 - p1) / se;

    // Convert z-score to confidence level
    // z = 1.96 -> 95% confidence
    // z = 2.58 -> 99% confidence
    let confidenceLevel = 0;
    if (z >= 2.58) confidenceLevel = 99;
    else if (z >= 1.96) confidenceLevel = 95;
    else if (z >= 1.645) confidenceLevel = 90;
    else if (z >= 1.28) confidenceLevel = 80;

    const isSignificant = z >= 1.96; // 95% confidence threshold
    const winner = isSignificant && p2 > p1 ? best.key : control.key;

    return {
      isSignificant,
      confidenceLevel,
      winner: isSignificant ? winner : undefined,
    };
  }
}


