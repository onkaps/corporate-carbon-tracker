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
          totalCalculations: 0,
          averageFootprint: 0,
          latestFootprint: null,
          trend: 'no data',
        };
      }
  
      const totalCalculations = footprints.length;
      const averageFootprint =
        footprints.reduce((sum, f) => sum + f.totalFootprint, 0) /
        totalCalculations;
      const latestFootprint = footprints[0].totalFootprint;
  
      // Calculate trend (comparing latest with average of previous)
      let trend = 'stable';
      if (footprints.length > 1) {
        const previousAvg =
          footprints
            .slice(1)
            .reduce((sum, f) => sum + f.totalFootprint, 0) /
          (footprints.length - 1);
        if (latestFootprint < previousAvg * 0.9) trend = 'improving';
        else if (latestFootprint > previousAvg * 1.1) trend = 'worsening';
      }
  
      return {
        totalCalculations,
        averageFootprint: Math.round(averageFootprint),
        latestFootprint: Math.round(latestFootprint),
        trend,
        history: footprints.map((f) => ({
          footprint: Math.round(f.totalFootprint),
          month: f.month,
          year: f.year,
          date: f.calculatedAt,
        })),
      };
    }
  }