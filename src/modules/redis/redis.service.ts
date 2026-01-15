import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  // Cache key prefixes
  private readonly FLAG_PREFIX = 'flag:';
  private readonly FLAG_HASH_KEY = 'flags:all';
  private readonly DECISION_CACHE_PREFIX = 'decision:';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // ============================================
  // FLAG CACHING
  // ============================================

  /**
   * Cache a single flag with its variants and targets
   */
  async cacheFlag(flagId: string, flagData: Record<string, unknown>): Promise<void> {
    const key = `${this.FLAG_PREFIX}${flagId}`;
    await this.client.set(key, JSON.stringify(flagData), 'EX', this.CACHE_TTL);
    
    // Also update the hash for quick lookup by key
    if (flagData.key) {
      await this.client.hset(this.FLAG_HASH_KEY, flagData.key as string, JSON.stringify(flagData));
    }
  }

  /**
   * Get a cached flag by ID
   */
  async getCachedFlagById(flagId: string): Promise<Record<string, unknown> | null> {
    const key = `${this.FLAG_PREFIX}${flagId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Get a cached flag by key
   */
  async getCachedFlagByKey(flagKey: string): Promise<Record<string, unknown> | null> {
    const cached = await this.client.hget(this.FLAG_HASH_KEY, flagKey);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Get all cached flags
   */
  async getAllCachedFlags(): Promise<Record<string, Record<string, unknown>>> {
    const flags = await this.client.hgetall(this.FLAG_HASH_KEY);
    const result: Record<string, Record<string, unknown>> = {};
    
    for (const [key, value] of Object.entries(flags)) {
      result[key] = JSON.parse(value);
    }
    
    return result;
  }

  /**
   * Invalidate flag cache
   */
  async invalidateFlag(flagId: string, flagKey?: string): Promise<void> {
    const key = `${this.FLAG_PREFIX}${flagId}`;
    await this.client.del(key);
    
    if (flagKey) {
      await this.client.hdel(this.FLAG_HASH_KEY, flagKey);
    }

    // Also invalidate any related decision caches
    const decisionKeys = await this.client.keys(`${this.DECISION_CACHE_PREFIX}*:${flagKey || flagId}`);
    if (decisionKeys.length > 0) {
      await this.client.del(...decisionKeys);
    }
  }

  /**
   * Invalidate all flag caches
   */
  async invalidateAllFlags(): Promise<void> {
    const keys = await this.client.keys(`${this.FLAG_PREFIX}*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
    await this.client.del(this.FLAG_HASH_KEY);
  }

  /**
   * Warm up cache with all flags from database
   */
  async warmUpCache(): Promise<void> {
    this.logger.log('Warming up Redis cache...');
    
    try {
      const flags = await this.prisma.featureFlag.findMany({
        include: {
          variants: true,
          targets: {
            include: {
              environment: true,
            },
          },
        },
      });

      const pipeline = this.client.pipeline();
      
      for (const flag of flags) {
        const flagData = {
          id: flag.id,
          key: flag.key,
          name: flag.name,
          description: flag.description,
          type: flag.type,
          enabled: flag.enabled,
          variants: flag.variants,
          targets: flag.targets,
        };

        pipeline.set(
          `${this.FLAG_PREFIX}${flag.id}`,
          JSON.stringify(flagData),
          'EX',
          this.CACHE_TTL,
        );
        pipeline.hset(this.FLAG_HASH_KEY, flag.key, JSON.stringify(flagData));
      }

      await pipeline.exec();
      this.logger.log(`Cached ${flags.length} flags`);
    } catch (error) {
      this.logger.error('Failed to warm up cache', error);
    }
  }

  // ============================================
  // DECISION CACHING
  // ============================================

  /**
   * Cache a decision result
   */
  async cacheDecision(
    clientId: string,
    flagKey: string,
    decision: Record<string, unknown>,
    ttl: number = 60,
  ): Promise<void> {
    const key = `${this.DECISION_CACHE_PREFIX}${clientId}:${flagKey}`;
    await this.client.set(key, JSON.stringify(decision), 'EX', ttl);
  }

  /**
   * Get cached decision
   */
  async getCachedDecision(
    clientId: string,
    flagKey: string,
  ): Promise<Record<string, unknown> | null> {
    const key = `${this.DECISION_CACHE_PREFIX}${clientId}:${flagKey}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // ============================================
  // GENERIC METHODS
  // ============================================

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }
}


