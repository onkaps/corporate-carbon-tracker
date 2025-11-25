import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MlService } from '../ml/ml.service';
import { CreateFootprintDto } from './dto';

@Injectable()
export class FootprintsService {
  private readonly logger = new Logger(FootprintsService.name);

  constructor(
    private prisma: PrismaService,
    private mlService: MlService,
  ) {}

  private convertToMLFormat(dto: CreateFootprintDto) {
    return {
      vehicle_km: dto.vehicleKm,
      air_travel: dto.airTravel,
      recycle_paper: dto.recyclePaper,
      recycle_plastic: dto.recyclePlastic,
      recycle_glass: dto.recycleGlass,
      recycle_metal: dto.recycleMetal,
      internet_daily: dto.internetDaily,
      daily_tv_pc: dto.dailyTvPc,
      waste_bag_count: dto.wasteBagCount,
      grocery_bill: dto.groceryBill,
      clothes_monthly: dto.clothesMonthly,
      diet: dto.diet,
    };
  }
  /**
   * Create a new carbon footprint calculation
   * Uses ML service if available, otherwise fallback calculator
   */
  async create(createFootprintDto: CreateFootprintDto, employeeId: number) {
    this.logger.log(`Creating footprint calculation for employee ${employeeId}`);

    let totalFootprint: number;
    let breakdowns: {
      travel: number;
      energy: number;
      waste: number;
      diet: number;
    };
    let usedML = false;

    try {
      // Check if ML service is available
      const isMLAvailable = await this.mlService.isMLServiceAvailable();

      if (isMLAvailable) {
        this.logger.log('Using ML service for footprint prediction...');

        const mlPrediction = await this.mlService.predictFootprint(
          this.convertToMLFormat(createFootprintDto),
        );

        totalFootprint = Math.round(mlPrediction.total_footprint);

        breakdowns = {
          travel: Math.round(mlPrediction.travel_footprint),
          energy: Math.round(mlPrediction.energy_footprint),
          waste: Math.round(mlPrediction.waste_footprint),
          diet: Math.round(mlPrediction.diet_footprint),
        };

        usedML = true;
        this.logger.log(`ML prediction successful: ${totalFootprint} kg CO2`);
      } else {
        throw new Error('ML service not available');
      }
    } catch (error) {
      // Fallback algorithm
      this.logger.warn(
        `ML prediction failed, using fallback algorithm: ${error.message}`,
      );

      const fallback = this.mlService.calculateSimpleFallback(
        createFootprintDto,
      );

      totalFootprint = fallback.total_footprint;

      breakdowns = {
        travel: fallback.travel_footprint,
        energy: fallback.energy_footprint,
        waste: fallback.waste_footprint,
        diet: fallback.diet_footprint,
      };

      usedML = false;
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Save in database
    const footprint = await this.prisma.carbonFootprint.create({
      data: {
        employeeId,
        ...createFootprintDto,
        totalFootprint,
        travelFootprint: breakdowns.travel,
        energyFootprint: breakdowns.energy,
        wasteFootprint: breakdowns.waste,
        dietFootprint: breakdowns.diet,
        month,
        year,
      },
    });

    return {
      ...footprint,
      treesNeeded: Math.round(totalFootprint / 411.4),
      calculationMethod: usedML ? 'ML Model' : 'Fallback Algorithm',
    };
  }

  /**
   * Get all footprints for an employee
   */
  async findByEmployee(
    employeeId: number,
    requestUserId: number,
    isAdmin: boolean,
  ) {
    if (!isAdmin && employeeId !== requestUserId) {
      throw new ForbiddenException('Access denied');
    }

    const footprints = await this.prisma.carbonFootprint.findMany({
      where: { employeeId },
      orderBy: {
        calculatedAt: 'desc',
      },
    });

    return footprints.map((f) => ({
      ...f,
      treesNeeded: Math.round(f.totalFootprint / 411.4),
    }));
  }

  /**
   * Get footprint by ID
   */
  async findOne(id: number, requestUserId: number, isAdmin: boolean) {
    const footprint = await this.prisma.carbonFootprint.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    if (!footprint) {
      throw new NotFoundException('Footprint calculation not found');
    }

    if (!isAdmin && footprint.employeeId !== requestUserId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      ...footprint,
      treesNeeded: Math.round(footprint.totalFootprint / 411.4),
    };
  }

  /**
   * Get footprints by month and year for company
   */
  async findByMonthYear(companyId: number, month: number, year: number) {
    const footprints = await this.prisma.carbonFootprint.findMany({
      where: {
        month,
        year,
        employee: {
          companyId,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true,
          },
        },
      },
      orderBy: {
        totalFootprint: 'asc',
      },
    });

    return footprints.map((f) => ({
      ...f,
      treesNeeded: Math.round(f.totalFootprint / 411.4),
    }));
  }

  /**
   * Delete a footprint entry
   */
  async remove(id: number, requestUserId: number, isAdmin: boolean) {
    const footprint = await this.prisma.carbonFootprint.findUnique({
      where: { id },
    });

    if (!footprint) {
      throw new NotFoundException('Footprint calculation not found');
    }

    if (!isAdmin && footprint.employeeId !== requestUserId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.carbonFootprint.delete({
      where: { id },
    });

    return { message: 'Footprint calculation deleted successfully' };
  }
}
