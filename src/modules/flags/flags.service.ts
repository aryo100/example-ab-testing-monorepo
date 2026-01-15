import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { FlagType, Prisma } from '@prisma/client';

@Injectable()
export class FlagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateFlagDto, userId: string) {
    // Check if flag key already exists
    const existing = await this.prisma.featureFlag.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new ConflictException(`Flag with key "${dto.key}" already exists`);
    }

    const flag = await this.prisma.featureFlag.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        type: dto.type || FlagType.BOOLEAN,
        enabled: dto.enabled ?? false,
        createdById: userId,
      },
      include: {
        variants: true,
        targets: {
          include: { environment: true },
        },
        createdBy: {
          select: { id: true, email: true },
        },
      },
    });

    // Cache the flag
    await this.cacheFlag(flag);

    return flag;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    type?: FlagType;
    enabled?: boolean;
  }) {
    const { skip = 0, take = 20, search, type, enabled } = params || {};

    const where: Prisma.FeatureFlagWhereInput = {};

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (enabled !== undefined) {
      where.enabled = enabled;
    }

    const [flags, total] = await Promise.all([
      this.prisma.featureFlag.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: true,
          targets: {
            include: { environment: true },
          },
          createdBy: {
            select: { id: true, email: true },
          },
          _count: {
            select: { experiments: true },
          },
        },
      }),
      this.prisma.featureFlag.count({ where }),
    ]);

    return {
      data: flags,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  async findOne(id: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
      include: {
        variants: true,
        targets: {
          include: { environment: true },
        },
        createdBy: {
          select: { id: true, email: true },
        },
        experiments: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${id}" not found`);
    }

    return flag;
  }

  async findByKey(key: string) {
    // Try cache first
    const cached = await this.redis.getCachedFlagByKey(key);
    if (cached) {
      return cached;
    }

    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
      include: {
        variants: true,
        targets: {
          include: { environment: true },
        },
      },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with key "${key}" not found`);
    }

    // Cache for next time
    await this.cacheFlag(flag);

    return flag;
  }

  async update(id: string, dto: UpdateFlagDto) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${id}" not found`);
    }

    // If updating key, check for conflicts
    if (dto.key && dto.key !== flag.key) {
      const existing = await this.prisma.featureFlag.findUnique({
        where: { key: dto.key },
      });

      if (existing) {
        throw new ConflictException(`Flag with key "${dto.key}" already exists`);
      }
    }

    const updatedFlag = await this.prisma.featureFlag.update({
      where: { id },
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        enabled: dto.enabled,
      },
      include: {
        variants: true,
        targets: {
          include: { environment: true },
        },
        createdBy: {
          select: { id: true, email: true },
        },
      },
    });

    // Invalidate old cache and set new one
    await this.redis.invalidateFlag(id, flag.key);
    await this.cacheFlag(updatedFlag);

    return updatedFlag;
  }

  async remove(id: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${id}" not found`);
    }

    await this.prisma.featureFlag.delete({
      where: { id },
    });

    // Invalidate cache
    await this.redis.invalidateFlag(id, flag.key);

    return { message: 'Flag deleted successfully' };
  }

  async toggle(id: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${id}" not found`);
    }

    const updatedFlag = await this.prisma.featureFlag.update({
      where: { id },
      data: { enabled: !flag.enabled },
      include: {
        variants: true,
        targets: {
          include: { environment: true },
        },
      },
    });

    // Update cache
    await this.cacheFlag(updatedFlag);

    return updatedFlag;
  }

  private async cacheFlag(flag: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    type: FlagType;
    enabled: boolean;
    variants: unknown[];
    targets: unknown[];
  }) {
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

    await this.redis.cacheFlag(flag.id, flagData);
  }
}


