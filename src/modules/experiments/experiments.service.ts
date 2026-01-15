import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { ExperimentStatus, Prisma } from '@prisma/client';

@Injectable()
export class ExperimentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExperimentDto) {
    // Verify flag exists
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: dto.flagId },
    });

    if (!flag) {
      throw new NotFoundException(`Flag with ID "${dto.flagId}" not found`);
    }

    // Ensure flag is of variant type for experiments
    if (flag.type !== 'VARIANT') {
      throw new BadRequestException('Experiments can only be created for VARIANT type flags');
    }

    return this.prisma.experiment.create({
      data: {
        name: dto.name,
        flagId: dto.flagId,
        metrics: dto.metrics as Prisma.InputJsonValue,
        status: ExperimentStatus.DRAFT,
        startAt: dto.startAt,
        endAt: dto.endAt,
      },
      include: {
        flag: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: ExperimentStatus;
    flagId?: string;
  }) {
    const { skip = 0, take = 20, status, flagId } = params || {};

    const where: Prisma.ExperimentWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (flagId) {
      where.flagId = flagId;
    }

    const [experiments, total] = await Promise.all([
      this.prisma.experiment.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          flag: {
            select: {
              id: true,
              key: true,
              name: true,
              variants: true,
            },
          },
          _count: {
            select: { conversions: true },
          },
        },
      }),
      this.prisma.experiment.count({ where }),
    ]);

    return {
      data: experiments,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  async findOne(id: string) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
      include: {
        flag: {
          include: {
            variants: true,
          },
        },
        _count: {
          select: { conversions: true },
        },
      },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${id}" not found`);
    }

    return experiment;
  }

  async update(id: string, dto: UpdateExperimentDto) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${id}" not found`);
    }

    // Prevent updating completed experiments
    if (experiment.status === ExperimentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed experiment');
    }

    return this.prisma.experiment.update({
      where: { id },
      data: {
        name: dto.name,
        metrics: dto.metrics as Prisma.InputJsonValue,
        status: dto.status,
        startAt: dto.startAt,
        endAt: dto.endAt,
      },
      include: {
        flag: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  async start(id: string) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
      include: {
        flag: {
          include: { variants: true },
        },
      },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${id}" not found`);
    }

    if (experiment.status !== ExperimentStatus.DRAFT && experiment.status !== ExperimentStatus.PAUSED) {
      throw new BadRequestException('Can only start experiments in DRAFT or PAUSED status');
    }

    // Ensure flag has variants
    if (experiment.flag.variants.length < 2) {
      throw new BadRequestException('Experiment flag must have at least 2 variants');
    }

    // Enable the flag
    await this.prisma.featureFlag.update({
      where: { id: experiment.flagId },
      data: { enabled: true },
    });

    return this.prisma.experiment.update({
      where: { id },
      data: {
        status: ExperimentStatus.RUNNING,
        startAt: experiment.startAt || new Date(),
      },
      include: {
        flag: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  async pause(id: string) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${id}" not found`);
    }

    if (experiment.status !== ExperimentStatus.RUNNING) {
      throw new BadRequestException('Can only pause running experiments');
    }

    return this.prisma.experiment.update({
      where: { id },
      data: { status: ExperimentStatus.PAUSED },
      include: {
        flag: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  async stop(id: string) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${id}" not found`);
    }

    if (experiment.status === ExperimentStatus.COMPLETED) {
      throw new BadRequestException('Experiment is already completed');
    }

    return this.prisma.experiment.update({
      where: { id },
      data: {
        status: ExperimentStatus.COMPLETED,
        endAt: experiment.endAt || new Date(),
      },
      include: {
        flag: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${id}" not found`);
    }

    if (experiment.status === ExperimentStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running experiment. Stop it first.');
    }

    await this.prisma.experiment.delete({
      where: { id },
    });

    return { message: 'Experiment deleted successfully' };
  }

  async getResults(id: string) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
      include: {
        flag: {
          include: { variants: true },
        },
      },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with ID "${id}" not found`);
    }

    // Get exposure counts per variant
    const exposures = await this.prisma.exposure.groupBy({
      by: ['variantKey'],
      where: {
        flagId: experiment.flagId,
        timestamp: {
          gte: experiment.startAt || experiment.createdAt,
          ...(experiment.endAt && { lte: experiment.endAt }),
        },
      },
      _count: true,
    });

    // Get conversion counts per variant
    const conversions = await this.prisma.conversion.groupBy({
      by: ['metricKey'],
      where: {
        experimentId: id,
      },
      _count: true,
      _sum: {
        value: true,
      },
    });

    // Calculate conversion rates
    const variantResults = experiment.flag.variants.map((variant) => {
      const exposureData = exposures.find((e) => e.variantKey === variant.key);
      const exposureCount = exposureData?._count || 0;

      return {
        variant: variant.key,
        weight: variant.weight,
        exposures: exposureCount,
      };
    });

    return {
      experiment: {
        id: experiment.id,
        name: experiment.name,
        status: experiment.status,
        startAt: experiment.startAt,
        endAt: experiment.endAt,
      },
      variants: variantResults,
      conversions: conversions.map((c) => ({
        metric: c.metricKey,
        count: c._count,
        totalValue: c._sum.value,
      })),
      totalExposures: exposures.reduce((sum, e) => sum + e._count, 0),
    };
  }
}


