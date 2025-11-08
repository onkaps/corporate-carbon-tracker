import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Query,
  } from '@nestjs/common';
  import { FootprintsService } from './footprints.service';
  import { CreateFootprintDto } from './dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { GetUser } from '../auth/decorators/get-user.decorator';
  
  @Controller('footprints')
  @UseGuards(JwtAuthGuard)
  export class FootprintsController {
    constructor(private readonly footprintsService: FootprintsService) {}
  
    /**
     * POST /api/v1/footprints
     * Create new carbon footprint calculation
     */
    @Post()
    create(
      @Body() createFootprintDto: CreateFootprintDto,
      @GetUser('id') userId: number,
    ) {
      return this.footprintsService.create(createFootprintDto, userId);
    }
  
    /**
     * GET /api/v1/footprints/employee/:employeeId
     * Get all footprints for an employee
     */
    @Get('employee/:employeeId')
    findByEmployee(
      @Param('employeeId', ParseIntPipe) employeeId: number,
      @GetUser('id') userId: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.footprintsService.findByEmployee(employeeId, userId, isAdmin);
    }
  
    /**
     * GET /api/v1/footprints/company/:companyId/month/:month/year/:year
     * Get footprints for a company by month/year
     */
    @Get('company/:companyId/month/:month/year/:year')
    findByMonthYear(
      @Param('companyId', ParseIntPipe) companyId: number,
      @Param('month', ParseIntPipe) month: number,
      @Param('year', ParseIntPipe) year: number,
    ) {
      return this.footprintsService.findByMonthYear(companyId, month, year);
    }
  
    /**
     * GET /api/v1/footprints/:id
     * Get single footprint by ID
     */
    @Get(':id')
    findOne(
      @Param('id', ParseIntPipe) id: number,
      @GetUser('id') userId: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.footprintsService.findOne(id, userId, isAdmin);
    }
  
    /**
     * DELETE /api/v1/footprints/:id
     * Delete a footprint calculation
     */
    @Delete(':id')
    remove(
      @Param('id', ParseIntPipe) id: number,
      @GetUser('id') userId: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.footprintsService.remove(id, userId, isAdmin);
    }
  }