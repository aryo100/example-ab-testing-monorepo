import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConstraintEvaluator } from './helpers/constraint-evaluator';
import { HashingService } from './helpers/hashing.service';
import { DecisionRequestDto, ClientContext } from './dto/decision-request.dto';
import { FlagType } from '@prisma/client';

export interface FlagDecision {
  enabled: boolean;
  variant?: string;
  reason: string;
}

export interface DecisionResponse {
  [flagKey: string]: FlagDecision;
}

interface CachedFlag {
  id: string;
  key: string;
  name: string;
  type: FlagType;
  enabled: boolean;
  variants: { id: string; key: string; weight: number }[];
  targets: {
    id: string;
    percentage: number;
    constraints: unknown;
    environment: { id: string; name: string };
  }[];
}

@Injectable()
export class DecisionService {
  private readonly logger = new Logger(DecisionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly constraintEvaluator: ConstraintEvaluator,
    private readonly hashingService: HashingService,
  ) {}

  async decide(dto: DecisionRequestDto): Promise<DecisionResponse> {
    const { clientId, flagKeys, context, environment } = dto;
    const response: DecisionResponse = {};

    // Process each flag
    for (const flagKey of flagKeys) {
      try {
        const decision = await this.evaluateFlag(
          flagKey,
          clientId,
          context || {},
          environment,
        );
        response[flagKey] = decision;
      } catch (error) {
        this.logger.error(`Error evaluating flag ${flagKey}:`, error);
        response[flagKey] = {
          enabled: false,
          reason: 'evaluation_error',
        };
      }
    }

    return response;
  }

  private async evaluateFlag(
    flagKey: string,
    clientId: string,
    context: ClientContext,
    environment?: string,
  ): Promise<FlagDecision> {
    // Try to get from cache first
    let flag = (await this.redis.getCachedFlagByKey(flagKey)) as CachedFlag | null;

    // If not in cache, fetch from database
    if (!flag) {
      const dbFlag = await this.prisma.featureFlag.findUnique({
        where: { key: flagKey },
        include: {
          variants: true,
          targets: {
            include: { environment: true },
          },
        },
      });

      if (!dbFlag) {
        return {
          enabled: false,
          reason: 'flag_not_found',
        };
      }

      flag = {
        id: dbFlag.id,
        key: dbFlag.key,
        name: dbFlag.name,
        type: dbFlag.type,
        enabled: dbFlag.enabled,
        variants: dbFlag.variants,
        targets: dbFlag.targets.map((t) => ({
          id: t.id,
          percentage: t.percentage,
          constraints: t.constraints,
          environment: t.environment,
        })),
      };

      // Cache for future requests
      await this.redis.cacheFlag(flag.id, flag as unknown as Record<string, unknown>);
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return {
        enabled: false,
        reason: 'flag_disabled',
      };
    }

    // Find applicable target based on environment
    const target = this.findApplicableTarget(flag.targets, environment);

    // Evaluate constraints if present
    if (target?.constraints) {
      const constraintsPassed = this.constraintEvaluator.evaluate(
        target.constraints as Record<string, unknown>,
        context,
      );

      if (!constraintsPassed) {
        return {
          enabled: false,
          reason: 'constraints_not_met',
        };
      }
    }

    // Evaluate based on flag type
    switch (flag.type) {
      case FlagType.BOOLEAN:
        return this.evaluateBooleanFlag(flag);

      case FlagType.PERCENTAGE:
        return this.evaluatePercentageFlag(flag, clientId, target?.percentage ?? 100);

      case FlagType.VARIANT:
        return this.evaluateVariantFlag(flag, clientId);

      default:
        return {
          enabled: false,
          reason: 'unknown_flag_type',
        };
    }
  }

  private findApplicableTarget(
    targets: CachedFlag['targets'],
    environment?: string,
  ): CachedFlag['targets'][0] | null {
    if (!targets || targets.length === 0) {
      return null;
    }

    if (environment) {
      return targets.find((t) => t.environment.name === environment) || null;
    }

    // Return first target if no environment specified (usually production)
    return targets[0];
  }

  /**
   * Boolean flag: Simply return enabled status
   */
  private evaluateBooleanFlag(flag: CachedFlag): FlagDecision {
    return {
      enabled: flag.enabled,
      reason: 'boolean_flag',
    };
  }

  /**
   * Percentage rollout: Hash client ID to determine if user is in rollout
   * bucket = hash(clientId + flagKey) % 100
   * enabled = bucket < percentage
   */
  private evaluatePercentageFlag(
    flag: CachedFlag,
    clientId: string,
    percentage: number,
  ): FlagDecision {
    const bucket = this.hashingService.getBucket(clientId, flag.key);
    const enabled = bucket < percentage;

    return {
      enabled,
      reason: enabled ? 'percentage_rollout_included' : 'percentage_rollout_excluded',
    };
  }

  /**
   * Variant flag: Select variant based on weighted distribution
   * Uses consistent hashing so same user always gets same variant
   */
  private evaluateVariantFlag(flag: CachedFlag, clientId: string): FlagDecision {
    if (!flag.variants || flag.variants.length === 0) {
      return {
        enabled: false,
        reason: 'no_variants_defined',
      };
    }

    // Calculate cumulative weights
    const totalWeight = flag.variants.reduce((sum, v) => sum + v.weight, 0);
    
    if (totalWeight === 0) {
      return {
        enabled: false,
        reason: 'zero_total_weight',
      };
    }

    // Get consistent bucket for this user
    const bucket = this.hashingService.getBucket(clientId, flag.key);
    
    // Normalize bucket to total weight
    const normalizedBucket = (bucket / 100) * totalWeight;

    // Select variant based on cumulative distribution
    let cumulative = 0;
    for (const variant of flag.variants) {
      cumulative += variant.weight;
      if (normalizedBucket < cumulative) {
        return {
          enabled: true,
          variant: variant.key,
          reason: 'variant_selected',
        };
      }
    }

    // Fallback to last variant (should not reach here normally)
    return {
      enabled: true,
      variant: flag.variants[flag.variants.length - 1].key,
      reason: 'variant_fallback',
    };
  }

  /**
   * Get all flags for a client (bulk decision)
   */
  async decideAll(
    clientId: string,
    context?: ClientContext,
    environment?: string,
  ): Promise<DecisionResponse> {
    const allFlags = await this.redis.getAllCachedFlags();
    const flagKeys = Object.keys(allFlags);

    if (flagKeys.length === 0) {
      // Cache might be cold, fetch from database
      const dbFlags = await this.prisma.featureFlag.findMany({
        select: { key: true },
      });
      flagKeys.push(...dbFlags.map((f) => f.key));
    }

    return this.decide({
      clientId,
      flagKeys,
      context,
      environment,
    });
  }
}


