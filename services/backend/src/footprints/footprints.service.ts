import {
    Injectable,
    NotFoundException,
    ForbiddenException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateFootprintDto } from './dto';
  
  @Injectable()
  export class FootprintsService {
    constructor(private prisma: PrismaService) {}
  
    /**
     * Create a new carbon footprint calculation
     * TODO: Integrate with ML service in Day 4
     */
    async create(createFootprintDto: CreateFootprintDto, employeeId: number) {
      // For now, we'll use a simple calculation
      // In Day 4, we'll integrate with the ML service
      const totalFootprint = this.calculateSimpleFootprint(createFootprintDto);
  
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
  
      // Calculate category breakdowns (simplified)
      const breakdowns = this.calculateBreakdowns(
        createFootprintDto,
        totalFootprint,
      );
  
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
      // Check authorization
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
  
      // Check authorization
      if (!isAdmin && footprint.employeeId !== requestUserId) {
        throw new ForbiddenException('Access denied');
      }
  
      return {
        ...footprint,
        treesNeeded: Math.round(footprint.totalFootprint / 411.4),
      };
    }
  
    /**
     * Get footprints by month/year
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
     * Delete a footprint calculation
     */
    async remove(id: number, requestUserId: number, isAdmin: boolean) {
      const footprint = await this.prisma.carbonFootprint.findUnique({
        where: { id },
      });
  
      if (!footprint) {
        throw new NotFoundException('Footprint calculation not found');
      }
  
      // Check authorization
      if (!isAdmin && footprint.employeeId !== requestUserId) {
        throw new ForbiddenException('Access denied');
      }
  
      await this.prisma.carbonFootprint.delete({
        where: { id },
      });
  
      return { message: 'Footprint calculation deleted successfully' };
    }
  
    /**
     * Simple footprint calculation (to be replaced with ML model in Day 4)
     */
    private calculateSimpleFootprint(data: CreateFootprintDto): number {
      let total = 0;
  
      // Diet impact
      const dietImpact = {
        vegan: 50,
        vegetarian: 100,
        pescatarian: 150,
        omnivore: 250,
      };
      total += dietImpact[data.diet?.toLowerCase()] || 150;
  
      // Transport impact
      if (data.vehicleKm) {
        total += data.vehicleKm * 0.2;
      }
  
      // Air travel impact
      const airTravelImpact = {
        never: 0,
        rarely: 100,
        frequently: 300,
        'very frequently': 500,
      };
      total += airTravelImpact[data.airTravel?.toLowerCase()] || 0;
  
      // Waste impact
      if (data.wasteBagCount) {
        total += data.wasteBagCount * 10;
      }
  
      // Recycling reduces footprint
      const recyclingCount = [
        data.recyclePaper,
        data.recyclePlastic,
        data.recycleGlass,
        data.recycleMetal,
      ].filter(Boolean).length;
      total -= recyclingCount * 5;
  
      // Energy usage
      if (data.dailyTvPc) {
        total += data.dailyTvPc * 5;
      }
      if (data.internetDaily) {
        total += data.internetDaily * 3;
      }
  
      // Consumption
      if (data.groceryBill) {
        total += data.groceryBill * 0.1;
      }
      if (data.clothesMonthly) {
        total += data.clothesMonthly * 15;
      }
  
      return Math.max(total, 0);
    }
  
    /**
     * Calculate category breakdowns
     */
    private calculateBreakdowns(
      data: CreateFootprintDto,
      total: number,
    ): {
      travel: number;
      energy: number;
      waste: number;
      diet: number;
    } {
      // Simple percentage-based breakdown
      return {
        travel: Math.round(total * 0.3),
        energy: Math.round(total * 0.25),
        waste: Math.round(total * 0.2),
        diet: Math.round(total * 0.25),
      };
    }
  }