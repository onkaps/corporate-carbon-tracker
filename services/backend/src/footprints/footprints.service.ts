import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MlService } from '../ml/ml.service';
import { CreateFootprintDto } from './dto';
import { MLPredictionRequestDto } from '../ml/dto';


@Injectable()
export class FootprintsService {
  private readonly logger = new Logger(FootprintsService.name);

  constructor(
    private prisma: PrismaService,
    private mlService: MlService,
  ) {}

  private convertToMLFormat(dto: CreateFootprintDto): MLPredictionRequestDto {
    return {
      // Personal data
      body_type: dto.bodyType || 'average',
      sex: dto.sex || 'male',
      diet: dto.diet || 'omnivore',
      shower_frequency: dto.showerFrequency || 'daily',
      social_activity: dto.socialActivity || 'often',
  
      // Travel data
      transport: (dto as any).transport || 'private',
      vehicle_type: dto.vehicleType || 'petrol',
      vehicle_km: Number(dto.vehicleKm) || 0,
      air_travel: dto.airTravel || 'never',
  
      // Waste data
      waste_bag_size: (dto as any).wasteBagSize || 'medium',
      waste_bag_count: Number(dto.wasteBagCount) || 0,
      recycle_paper: Boolean(dto.recyclePaper),
      recycle_plastic: Boolean(dto.recyclePlastic),
      recycle_glass: Boolean(dto.recycleGlass),
      recycle_metal: Boolean(dto.recycleMetal),
  
      // Energy data
      heating_energy: (dto as any).heatingEnergy || 'natural gas',
      cooking_microwave: Boolean((dto as any).cookingMicrowave),
      cooking_oven: Boolean((dto as any).cookingOven),
      cooking_grill: Boolean((dto as any).cookingGrill),
      cooking_airfryer: Boolean((dto as any).cookingAirfryer),
      cooking_stove: Boolean((dto as any).cookingStove),
      energy_efficiency: (dto as any).energyEfficiency || 'sometimes',
      daily_tv_pc: Number(dto.dailyTvPc) || 0,
      internet_daily: Number(dto.internetDaily) || 0,
  
      // Consumption data
      grocery_bill: Number(dto.groceryBill) || 0,
      clothes_monthly: Number(dto.clothesMonthly) || 0,
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
          this.convertToMLFormat(createFootprintDto) as any as MLPredictionRequestDto,
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

      // Convert to ML format first, then use fallback
      const mlFormattedData = this.convertToMLFormat(createFootprintDto);
      const fallback = this.mlService.calculateSimpleFallback(
        mlFormattedData as any,
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
