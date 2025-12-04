import {
    Injectable,
    NotFoundException,
    ForbiddenException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { UpdateEmployeeDto } from './dto';
  
  @Injectable()
  export class EmployeesService {
    constructor(private prisma: PrismaService) {}
  
    /**
     * Get all employees in a company
     */
    async findAll(companyId: number, isAdmin: boolean, requestUserId: number) {
      // Regular users can only see employees from their company
      const employees = await this.prisma.employee.findMany({
        where: {
          companyId,
        },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          department: true,
          position: true,
          isAdmin: true,
          companyId: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      return employees;
    }
  
    /**
     * Get employee by ID
     */
    async findOne(id: number, requestUserId: number, isAdmin: boolean) {
      const employee = await this.prisma.employee.findUnique({
        where: { id },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          department: true,
          position: true,
          isAdmin: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
          footprints: {
            select: {
              id: true,
              totalFootprint: true,
              month: true,
              year: true,
              calculatedAt: true,
            },
            orderBy: {
              calculatedAt: 'desc',
            },
            take: 5,
          },
        },
      });
  
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
  
      // Check authorization - users can only view their own profile or admin can view all
      if (!isAdmin && employee.id !== requestUserId) {
        throw new ForbiddenException('Access denied');
      }
  
      return employee;
    }
  
    /**
     * Update employee
     */
    async update(
      id: number,
      updateEmployeeDto: UpdateEmployeeDto,
      requestUserId: number,
      isAdmin: boolean,
    ) {
      // Check if employee exists
      const employee = await this.prisma.employee.findUnique({
        where: { id },
      });
  
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
  
      // Check authorization
      // Only admin or the user themselves can update
      if (!isAdmin && employee.id !== requestUserId) {
        throw new ForbiddenException('Access denied');
      }
  
      // Regular users cannot change isAdmin status
      if (!isAdmin && updateEmployeeDto.isAdmin !== undefined) {
        throw new ForbiddenException('Cannot modify admin status');
      }
  
      // Update employee
      const updatedEmployee = await this.prisma.employee.update({
        where: { id },
        data: updateEmployeeDto,
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          department: true,
          position: true,
          isAdmin: true,
          companyId: true,
          updatedAt: true,
        },
      });
  
      return updatedEmployee;
    }
  
    /**
     * Delete employee (Admin only)
     */
    async remove(id: number, isAdmin: boolean) {
      if (!isAdmin) {
        throw new ForbiddenException('Only admins can delete employees');
      }
  
      const employee = await this.prisma.employee.findUnique({
        where: { id },
      });
  
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
  
      // Don't allow deleting yourself
      await this.prisma.employee.delete({
        where: { id },
      });
  
      return { message: 'Employee deleted successfully' };
    }
  
    /**
     * Get employee statistics
     */
    async getStatistics(employeeId: number) {
      const footprints = await this.prisma.carbonFootprint.findMany({
        where: { employeeId },
        select: {
          totalFootprint: true,
          travelFootprint: true,
          energyFootprint: true,
          wasteFootprint: true,
          dietFootprint: true,
          month: true,
          year: true,
          calculatedAt: true,
        },
        orderBy: {
          calculatedAt: 'desc',
        },
      });

      if (footprints.length === 0) {
        return {
          totalFootprint: 0,
          footprintHistory: [],
          breakdown: {
            travel: 0,
            energy: 0,
            waste: 0,
            diet: 0,
          },
        };
      }

      // Get the latest footprint for breakdown
      const latestFootprint = footprints[0];
      
      // Calculate total footprint (sum of all footprints or use latest)
      const totalFootprint = footprints.reduce((sum, f) => sum + f.totalFootprint, 0);

      // Group by month/year for history
      const historyMap = new Map<string, { month: number; year: number; totalFootprint: number }>();
      
      footprints.forEach((f) => {
        const key = `${f.year}-${f.month}`;
        if (!historyMap.has(key)) {
          historyMap.set(key, {
            month: f.month,
            year: f.year,
            totalFootprint: 0,
          });
        }
        const entry = historyMap.get(key)!;
        entry.totalFootprint += f.totalFootprint;
      });

      const footprintHistory = Array.from(historyMap.values())
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });

      return {
        totalFootprint: Math.round(totalFootprint),
        footprintHistory,
        breakdown: {
          travel: Math.round(latestFootprint.travelFootprint || 0),
          energy: Math.round(latestFootprint.energyFootprint || 0),
          waste: Math.round(latestFootprint.wasteFootprint || 0),
          diet: Math.round(latestFootprint.dietFootprint || 0),
        },
      };
    }
  }