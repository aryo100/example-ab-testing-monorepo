import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(flagId: string, dto: CreateVariantDto) {
    // Check if flag exists
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${flagId}" not found`);
    }

    // Check if variant key already exists for this flag
    const existing = await this.prisma.flagVariant.findUnique({
      where: {
        flagId_key: { flagId, key: dto.key },
      },
    });

    if (existing) {
      throw new ConflictException(`Variant with key "${dto.key}" already exists for this flag`);
    }

    const variant = await this.prisma.flagVariant.create({
      data: {
        flagId,
        key: dto.key,
        weight: dto.weight ?? 100,
      },
    });

    // Invalidate flag cache
    await this.redis.invalidateFlag(flagId, flag.key);

    return variant;
  }

  async findAll(flagId: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${flagId}" not found`);
    }

    return this.prisma.flagVariant.findMany({
      where: { flagId },
      orderBy: { weight: 'desc' },
    });
  }

  async findOne(flagId: string, variantId: string) {
    const variant = await this.prisma.flagVariant.findFirst({
      where: {
        id: variantId,
        flagId,
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant not found`);
    }

    return variant;
  }

  async update(flagId: string, variantId: string, dto: UpdateVariantDto) {
    const variant = await this.prisma.flagVariant.findFirst({
      where: {
        id: variantId,
        flagId,
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant not found`);
    }

    // If updating key, check for conflicts
    if (dto.key && dto.key !== variant.key) {
      const existing = await this.prisma.flagVariant.findUnique({
        where: {
          flagId_key: { flagId, key: dto.key },
        },
      });

      if (existing) {
        throw new ConflictException(`Variant with key "${dto.key}" already exists for this flag`);
      }
    }

    const updatedVariant = await this.prisma.flagVariant.update({
      where: { id: variantId },
      data: {
        key: dto.key,
        weight: dto.weight,
      },
    });

    // Invalidate flag cache
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: flagId },
    });
    if (flag) {
      await this.redis.invalidateFlag(flagId, flag.key);
    }

    return updatedVariant;
  }

  async remove(flagId: string, variantId: string) {
    const variant = await this.prisma.flagVariant.findFirst({
      where: {
        id: variantId,
        flagId,
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant not found`);
    }

    await this.prisma.flagVariant.delete({
      where: { id: variantId },
    });

    // Invalidate flag cache
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: flagId },
    });
    if (flag) {
      await this.redis.invalidateFlag(flagId, flag.key);
    }

    return { message: 'Variant deleted successfully' };
  }

  async updateWeights(flagId: string, weights: { variantId: string; weight: number }[]) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${flagId}" not found`);
    }

    // Validate total weight
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight !== 100) {
      throw new BadRequestException('Total weight must equal 100');
    }

    // Update all weights in a transaction
    await this.prisma.$transaction(
      weights.map((w) =>
        this.prisma.flagVariant.update({
          where: { id: w.variantId },
          data: { weight: w.weight },
        }),
      ),
    );

    // Invalidate cache
    await this.redis.invalidateFlag(flagId, flag.key);

    return this.findAll(flagId);
  }
}


