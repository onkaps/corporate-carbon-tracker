import {
    Injectable,
    NotFoundException,
    ForbiddenException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { UpdateCompanyDto } from './dto';
  
  @Injectable()
  export class CompaniesService {
    constructor(private prisma: PrismaService) {}
  
    /**
     * Get company by ID
     */
    async findOne(id: number) {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: {
          employees: {
            select: {
              id: true,
              employeeId: true,
              name: true,
              email: true,
              department: true,
              position: true,
              isAdmin: true,
            },
          },
        },
      });
  
      if (!company) {
        throw new NotFoundException('Company not found');
      }
  
      return company;
    }
  
    /**
     * Update company (Admin only)
     */
    async update(
      id: number,
      updateCompanyDto: UpdateCompanyDto,
      isAdmin: boolean,
    ) {
      if (!isAdmin) {
        throw new ForbiddenException('Only admins can update company details');
      }
  
      const company = await this.prisma.company.findUnique({
        where: { id },
      });
  
      if (!company) {
        throw new NotFoundException('Company not found');
      }
  
      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
      });
  
      return updatedCompany;
    }
  
    /**
     * Get company statistics
     */
    async getStatistics(companyId: number) {
      // Get employee count
      const employeeCount = await this.prisma.employee.count({
        where: { companyId },
      });
  
      // Get carbon footprint statistics
      const footprints = await this.prisma.carbonFootprint.findMany({
        where: {
          employee: {
            companyId,
          },
        },
        select: {
          totalFootprint: true,
          month: true,
          year: true,
        },
      });
  
      const totalFootprint = footprints.reduce(
        (sum, f) => sum + f.totalFootprint,
        0,
      );
      const averageFootprint =
        footprints.length > 0 ? totalFootprint / footprints.length : 0;
  
      // Get current month statistics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
  
      const currentMonthFootprints = footprints.filter(
        (f) => f.month === currentMonth && f.year === currentYear,
      );
  
      const currentMonthTotal = currentMonthFootprints.reduce(
        (sum, f) => sum + f.totalFootprint,
        0,
      );
  
      return {
        employeeCount,
        totalFootprintCalculations: footprints.length,
        totalFootprint: Math.round(totalFootprint),
        averageFootprint: Math.round(averageFootprint),
        currentMonth: {
          month: currentMonth,
          year: currentYear,
          calculations: currentMonthFootprints.length,
          totalFootprint: Math.round(currentMonthTotal),
        },
      };
    }
  
    /**
     * Get department breakdown
     */
    async getDepartmentBreakdown(companyId: number) {
      const employees = await this.prisma.employee.findMany({
        where: { companyId },
        select: {
          department: true,
          footprints: {
            select: {
              totalFootprint: true,
            },
          },
        },
      });
  
      // Group by department
      const departmentMap = new Map<string, { count: number; total: number }>();
  
      employees.forEach((emp) => {
        const dept = emp.department || 'Unassigned';
        const existing = departmentMap.get(dept) || { count: 0, total: 0 };
        
        const employeeFootprint = emp.footprints.length > 0
          ? emp.footprints[emp.footprints.length - 1].totalFootprint
          : 0;
  
        departmentMap.set(dept, {
          count: existing.count + 1,
          total: existing.total + employeeFootprint,
        });
      });
  
      // Convert to array
      const breakdown = Array.from(departmentMap.entries()).map(
        ([department, data]) => ({
          department,
          employeeCount: data.count,
          totalFootprint: Math.round(data.total),
          averageFootprint: Math.round(data.total / data.count),
        }),
      );
  
      return breakdown.sort((a, b) => b.totalFootprint - a.totalFootprint);
    }
  }