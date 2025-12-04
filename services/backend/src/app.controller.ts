import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Carbon Footprint Tracker API',
      version: '1.0.0',
    };
  }

  @Get('db-stats')
  async getDatabaseStats() {
    const [companies, employees, footprints] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.employee.count(),
      this.prisma.carbonFootprint.count(),
    ]);

    const recentFootprints = await this.prisma.carbonFootprint.findMany({
      take: 10,
      orderBy: { calculatedAt: 'desc' },
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

    return {
      counts: {
        companies,
        employees,
        footprints,
      },
      recentFootprints: recentFootprints.map((f) => ({
        id: f.id,
        employeeName: f.employee.name,
        employeeEmail: f.employee.email,
        department: f.employee.department,
        totalFootprint: f.totalFootprint,
        calculatedAt: f.calculatedAt,
      })),
      databaseInfo: {
        connection: 'PostgreSQL',
        host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
        database: 'carbon_tracker_dev',
      },
    };
  }
}