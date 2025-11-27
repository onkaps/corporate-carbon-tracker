import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LeaderboardEntry,
  DepartmentRanking,
  CompanyRanking,
  Achievement,
  MonthlyTrend,
} from './types';
import { LeaderboardQueryDto, TrendQueryDto, ComparisonQueryDto } from './dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get employee leaderboard (lowest carbon footprint = rank 1)
   */
  async getEmployeeLeaderboard(
    companyId: number,
    query: LeaderboardQueryDto,
  ): Promise<LeaderboardEntry[]> {
    const { limit = 10, month, year, department } = query;

    // Get current month/year if not specified
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Build where clause
    const whereClause: any = {
      employee: {
        companyId,
      },
      month: targetMonth,
      year: targetYear,
    };

    if (department) {
      whereClause.employee.department = department;
    }

    // Get latest footprints for the period
    const footprints = await this.prisma.carbonFootprint.findMany({
      where: whereClause,
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
        totalFootprint: 'asc', // Lower is better
      },
      take: limit,
    });

    if (!footprints || footprints.length === 0) {
      return [];
    }

    // Get historical data for trend calculation
    const employeeIds = footprints.map((f) => f.employeeId);
    const previousFootprints = await this.prisma.carbonFootprint.findMany({
      where: {
        employeeId: { in: employeeIds },
        OR: [
          { month: targetMonth - 1, year: targetYear },
          { month: 12, year: targetYear - 1 }, // Handle January
        ],
      },
      select: {
        employeeId: true,
        totalFootprint: true,
      },
    });

    const previousMap = new Map<number, number>(
      previousFootprints.map((f) => [f.employeeId, f.totalFootprint]),
    );

    // Calculate leaderboard
    const leaderboard: LeaderboardEntry[] = footprints.map((f, index) => {
      const previous = previousMap.get(f.employeeId);
      let trend: 'improving' | 'worsening' | 'stable' = 'stable';

      if (previous !== undefined) {
        if (f.totalFootprint < previous * 0.9) trend = 'improving';
        else if (f.totalFootprint > previous * 1.1) trend = 'worsening';
        else trend = 'stable';
      }

      return {
        rank: index + 1,
        employeeId: f.employee.employeeId,
        name: f.employee.name,
        department: f.employee.department,
        totalFootprint: Math.round(f.totalFootprint),
        treesNeeded: Math.round(f.totalFootprint / 411.4),
        calculationCount: 1, // Leave as-is; consider counting footprints in DB if needed
        trend,
        badge: this.getBadge(index + 1, f.totalFootprint),
      };
    });

    return leaderboard;
  }

  /**
   * Get department rankings
   */
  async getDepartmentRankings(
    companyId: number,
    query: LeaderboardQueryDto,
  ): Promise<DepartmentRanking[]> {
    const { month, year } = query;

    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Get all footprints for the period
    const footprints = await this.prisma.carbonFootprint.findMany({
      where: {
        employee: {
          companyId,
        },
        month: targetMonth,
        year: targetYear,
      },
      include: {
        employee: {
          select: {
            department: true,
            name: true,
          },
        },
      },
    });

    if (!footprints || footprints.length === 0) {
      return [];
    }

    // Group by department
    const deptMap = new Map<
      string,
      {
        footprints: number[];
        employees: Set<string>;
        topPerformer: { name: string; footprint: number };
      }
    >();

    footprints.forEach((f) => {
      const dept = f.employee.department || 'Unassigned';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          footprints: [],
          employees: new Set(),
          topPerformer: { name: f.employee.name, footprint: f.totalFootprint },
        });
      }

      const deptData = deptMap.get(dept)!;
      deptData.footprints.push(f.totalFootprint);
      deptData.employees.add(f.employee.name);

      // Update top performer (lowest footprint)
      if (f.totalFootprint < deptData.topPerformer.footprint) {
        deptData.topPerformer = {
          name: f.employee.name,
          footprint: f.totalFootprint,
        };
      }
    });

    // Calculate rankings
    const rankings: DepartmentRanking[] = Array.from(deptMap.entries()).map(
      ([dept, data]) => {
        const total = data.footprints.reduce((sum, v) => sum + v, 0);
        const avg = data.footprints.length > 0 ? total / data.footprints.length : 0;

        return {
          rank: 0, // Will be set after sorting
          department: dept,
          employeeCount: data.employees.size,
          averageFootprint: Math.round(avg),
          totalFootprint: Math.round(total),
          treesNeeded: Math.round(total / 411.4),
          topPerformer: {
            name: data.topPerformer.name,
            footprint: Math.round(data.topPerformer.footprint),
          },
        };
      },
    );

    // Sort by average footprint (lower is better) and assign ranks
    rankings.sort((a, b) => a.averageFootprint - b.averageFootprint);
    rankings.forEach((r, index) => {
      r.rank = index + 1;
    });

    return rankings;
  }

  /**
   * Get company rankings (for multi-company scenarios)
   */
  async getCompanyRankings(limit: number = 10): Promise<CompanyRanking[]> {
    const companies = await this.prisma.company.findMany({
      include: {
        employees: {
          include: {
            footprints: {
              where: {
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
              },
            },
          },
        },
      },
      take: limit,
    });

    const rankings: CompanyRanking[] = companies
      .map((company) => {
        const allFootprints = company.employees.flatMap((e) =>
          e.footprints.map((f) => f.totalFootprint),
        );

        if (allFootprints.length === 0) {
          return null;
        }

        const total = allFootprints.reduce((sum, v) => sum + v, 0);
        const avg = total / allFootprints.length;

        return {
          rank: 0,
          companyId: company.id,
          companyName: company.name,
          industry: company.industry,
          employeeCount: company.employees.length,
          averageFootprint: Math.round(avg),
          totalFootprint: Math.round(total),
        };
      })
      .filter((r): r is CompanyRanking => r !== null);

    // Sort and assign ranks
    rankings.sort((a, b) => a.averageFootprint - b.averageFootprint);
    rankings.forEach((r, index) => {
      r.rank = index + 1;
    });

    return rankings;
  }

  /**
   * Get employee achievements
   */
  async getEmployeeAchievements(employeeId: number): Promise<Achievement[]> {
    const footprints = await this.prisma.carbonFootprint.findMany({
      where: { employeeId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!footprints || footprints.length === 0) {
      return [];
    }

    const achievements: Achievement[] = [];
    const latest = footprints[0];
    const totalCalculations = footprints.length;

    // Achievement: First Calculation
    if (totalCalculations >= 1) {
      achievements.push({
        id: 'first_calculation',
        name: 'Getting Started',
        description: 'Completed your first carbon footprint calculation',
        icon: '🌱',
        // oldest calculation = first one done
        earnedAt: footprints[footprints.length - 1].calculatedAt,
      });
    }

    // Achievement: Consistent Tracker (5+ calculations)
    if (totalCalculations >= 5) {
      achievements.push({
        id: 'consistent_tracker',
        name: 'Consistent Tracker',
        description: 'Tracked your footprint 5 times',
        icon: '📊',
        earnedAt: footprints[footprints.length - 5].calculatedAt,
      });
    }

    // Achievement: Low Footprint (under 1000)
    if (latest.totalFootprint < 1000) {
      achievements.push({
        id: 'low_footprint',
        name: 'Eco Warrior',
        description: 'Maintained footprint under 1000 kg CO2',
        icon: '🌍',
        earnedAt: latest.calculatedAt,
      });
    }

    // Achievement: Improvement Trend (3 consecutive months decreasing)
    if (footprints.length >= 3) {
      const recent3 = footprints.slice(0, 3); // newest first
      const isImproving = recent3.every((f, i) => {
        if (i === 0) return true;
        // improvement = each month is lower than previous (newer < older)
        return f.totalFootprint < recent3[i - 1].totalFootprint;
      });

      if (isImproving) {
        achievements.push({
          id: 'improvement_trend',
          name: 'Trending Down',
          description: 'Reduced footprint for 3 consecutive months',
          icon: '📉',
          earnedAt: latest.calculatedAt,
        });
      }
    }

    // Achievement: Active Recycler
    if (
      latest.recyclePaper &&
      latest.recyclePlastic &&
      latest.recycleGlass &&
      latest.recycleMetal
    ) {
      achievements.push({
        id: 'active_recycler',
        name: 'Recycling Champion',
        description: 'Recycling all materials',
        icon: '♻️',
        earnedAt: latest.calculatedAt,
      });
    }

    // Achievement: Green Commuter
    if (latest.transport === 'public' || latest.transport === 'walk/bicycle') {
      achievements.push({
        id: 'green_commuter',
        name: 'Green Commuter',
        description: 'Using eco-friendly transportation',
        icon: '🚴',
        earnedAt: latest.calculatedAt,
      });
    }

    return achievements;
  }

  /**
   * Get monthly trends
   */
  async getMonthlyTrends(
    companyId: number,
    query: TrendQueryDto,
  ): Promise<MonthlyTrend[]> {
    const { months = 6 } = query;

    const now = new Date();
    const trends: MonthlyTrend[] = [];

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const footprints = await this.prisma.carbonFootprint.findMany({
        where: {
          employee: { companyId },
          month,
          year,
        },
        select: {
          totalFootprint: true,
        },
      });

      if (footprints.length > 0) {
        const total = footprints.reduce((sum, f) => sum + f.totalFootprint, 0);
        const avg = total / footprints.length;

        // Get previous month for comparison
        const prevDate = new Date(year, month - 2, 1);
        const prevMonth = prevDate.getMonth() + 1;
        const prevYear = prevDate.getFullYear();

        const prevFootprints = await this.prisma.carbonFootprint.findMany({
          where: {
            employee: { companyId },
            month: prevMonth,
            year: prevYear,
          },
          select: {
            totalFootprint: true,
          },
        });

        let change = 0;
        let changeDirection: 'up' | 'down' | 'stable' = 'stable';

        if (prevFootprints.length > 0) {
          const prevAvg =
            prevFootprints.reduce((sum, f) => sum + f.totalFootprint, 0) /
            prevFootprints.length;
          if (prevAvg !== 0) {
            change = ((avg - prevAvg) / prevAvg) * 100;

            if (change < -5) changeDirection = 'down';
            else if (change > 5) changeDirection = 'up';
          } else {
            change = 0;
            changeDirection = 'stable';
          }
        }

        trends.push({
          month,
          year,
          averageFootprint: Math.round(avg),
          totalCalculations: footprints.length,
          change: Math.round(change),
          changeDirection,
        });
      }
    }

    return trends.reverse(); // Oldest to newest
  }

  /**
   * Compare employee performance
   */
  async comparePerformance(
    employeeId: number,
    companyId: number,
    query: ComparisonQueryDto,
  ) {
    const { department, month, year } = query;

    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Get employee's footprint
    const employeeFootprint = await this.prisma.carbonFootprint.findFirst({
      where: {
        employeeId,
        month: targetMonth,
        year: targetYear,
      },
    });

    if (!employeeFootprint) {
      throw new NotFoundException('No footprint data for this period');
    }

    // Get company average
    const companyFootprints = await this.prisma.carbonFootprint.findMany({
      where: {
        employee: { companyId },
        month: targetMonth,
        year: targetYear,
      },
      select: {
        totalFootprint: true,
      },
    });

    if (!companyFootprints || companyFootprints.length === 0) {
      throw new NotFoundException('No company footprint data for this period');
    }

    const companyAvg =
      companyFootprints.reduce((sum, f) => sum + f.totalFootprint, 0) /
      companyFootprints.length;

    // Get department average if applicable
    let departmentAvg: number | null = null;
    if (department) {
      const deptFootprints = await this.prisma.carbonFootprint.findMany({
        where: {
          employee: {
            companyId,
            department,
          },
          month: targetMonth,
          year: targetYear,
        },
        select: {
          totalFootprint: true,
        },
      });

      if (deptFootprints.length > 0) {
        departmentAvg =
          deptFootprints.reduce((sum, f) => sum + f.totalFootprint, 0) /
          deptFootprints.length;
      }
    }

    // Calculate percentile (lower footprint => better)
    const allFootprints = companyFootprints
      .map((f) => f.totalFootprint)
      .sort((a, b) => a - b);

    let position = allFootprints.findIndex((f) => f >= employeeFootprint.totalFootprint);
    if (position === -1) position = allFootprints.length; // worst position

    const percentile =
      allFootprints.length > 0
        ? Math.round((position / allFootprints.length) * 100)
        : 0;

    return {
      employee: {
        footprint: Math.round(employeeFootprint.totalFootprint),
        treesNeeded: Math.round(employeeFootprint.totalFootprint / 411.4),
      },
      companyAverage: Math.round(companyAvg),
      departmentAverage: departmentAvg ? Math.round(departmentAvg) : null,
      percentile, // Lower percentile = better performance
      comparisonToAverage: companyAvg !== 0 ? Math.round(
        ((employeeFootprint.totalFootprint - companyAvg) / companyAvg) * 100,
      ) : 0,
      status:
        employeeFootprint.totalFootprint < companyAvg * 0.9
          ? 'excellent'
          : employeeFootprint.totalFootprint < companyAvg
          ? 'good'
          : employeeFootprint.totalFootprint < companyAvg * 1.1
          ? 'average'
          : 'needs_improvement',
    };
  }

  /**
   * Get badge based on rank and footprint
   */
  private getBadge(rank: number, footprint: number): string {
    if (rank === 1) return '🥇 Champion';
    if (rank === 2) return '🥈 Runner-up';
    if (rank === 3) return '🥉 Third Place';
    if (footprint < 500) return '🌟 Elite';
    if (footprint < 1000) return '⭐ Outstanding';
    if (rank <= 10) return '🏆 Top 10';
    return '';
  }
}
