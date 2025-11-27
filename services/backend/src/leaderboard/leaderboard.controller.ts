import {
    Controller,
    Get,
    Query,
    Param,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { LeaderboardService } from './leaderboard.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { GetUser } from '../auth/decorators/get-user.decorator';
  import { LeaderboardQueryDto, TrendQueryDto, ComparisonQueryDto } from './dto';
  
  @Controller('leaderboard')
  @UseGuards(JwtAuthGuard)
  export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) {}
  
    /**
     * GET /api/v1/leaderboard/employees
     * Get employee leaderboard
     */
    @Get('employees')
    getEmployeeLeaderboard(
      @GetUser('companyId') companyId: number,
      @Query() query: LeaderboardQueryDto,
    ) {
      return this.leaderboardService.getEmployeeLeaderboard(companyId, query);
    }
  
    /**
     * GET /api/v1/leaderboard/departments
     * Get department rankings
     */
    @Get('departments')
    getDepartmentRankings(
      @GetUser('companyId') companyId: number,
      @Query() query: LeaderboardQueryDto,
    ) {
      return this.leaderboardService.getDepartmentRankings(companyId, query);
    }
  
    /**
     * GET /api/v1/leaderboard/companies
     * Get company rankings (admin only or for public view)
     */
    @Get('companies')
    getCompanyRankings(@Query('limit', ParseIntPipe) limit?: number) {
      return this.leaderboardService.getCompanyRankings(limit || 10);
    }
  
    /**
     * GET /api/v1/leaderboard/achievements/:employeeId
     * Get employee achievements
     */
    @Get('achievements/:employeeId')
    getEmployeeAchievements(
      @Param('employeeId', ParseIntPipe) employeeId: number,
      @GetUser('id') requestUserId: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      // Only allow users to view their own achievements or admin to view any
      if (!isAdmin && employeeId !== requestUserId) {
        employeeId = requestUserId;
      }
      return this.leaderboardService.getEmployeeAchievements(employeeId);
    }
  
    /**
     * GET /api/v1/leaderboard/trends
     * Get monthly trends
     */
    @Get('trends')
    getMonthlyTrends(
      @GetUser('companyId') companyId: number,
      @Query() query: TrendQueryDto,
    ) {
      return this.leaderboardService.getMonthlyTrends(companyId, query);
    }
  
    /**
     * GET /api/v1/leaderboard/compare
     * Compare employee performance with company/department average
     */
    @Get('compare')
    comparePerformance(
      @GetUser('id') employeeId: number,
      @GetUser('companyId') companyId: number,
      @Query() query: ComparisonQueryDto,
    ) {
      return this.leaderboardService.comparePerformance(
        employeeId,
        companyId,
        query,
      );
    }
  
    /**
     * GET /api/v1/leaderboard/my-rank
     * Get current user's rank
     */
    @Get('my-rank')
    async getMyRank(
      @GetUser('id') employeeId: number,
      @GetUser('companyId') companyId: number,
    ) {
      const now = new Date();
      const leaderboard = await this.leaderboardService.getEmployeeLeaderboard(
        companyId,
        {
          limit: 1000, // Get all to find rank
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      );
  
      const employee = await this.leaderboardService['prisma'].employee.findUnique({
        where: { id: employeeId },
        select: { employeeId: true },
      });
  
      const myEntry = leaderboard.find(
        (entry) => entry.employeeId === employee?.employeeId,
      );
  
      if (!myEntry) {
        return {
          message: 'No footprint data for current month',
          rank: null,
        };
      }
  
      return {
        ...myEntry,
        totalParticipants: leaderboard.length,
      };
    }
  }