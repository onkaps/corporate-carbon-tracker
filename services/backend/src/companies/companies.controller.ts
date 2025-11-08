import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { CompaniesService } from './companies.service';
  import { UpdateCompanyDto } from './dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { GetUser } from '../auth/decorators/get-user.decorator';
  
  @Controller('companies')
  @UseGuards(JwtAuthGuard)
  export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {}
  
    /**
     * GET /api/v1/companies/:id
     * Get company details
     */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.companiesService.findOne(id);
    }
  
    /**
     * GET /api/v1/companies/:id/statistics
     * Get company statistics
     */
    @Get(':id/statistics')
    getStatistics(@Param('id', ParseIntPipe) id: number) {
      return this.companiesService.getStatistics(id);
    }
  
    /**
     * GET /api/v1/companies/:id/departments
     * Get department breakdown
     */
    @Get(':id/departments')
    getDepartmentBreakdown(@Param('id', ParseIntPipe) id: number) {
      return this.companiesService.getDepartmentBreakdown(id);
    }
  
    /**
     * PATCH /api/v1/companies/:id
     * Update company (Admin only)
     */
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCompanyDto: UpdateCompanyDto,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.companiesService.update(id, updateCompanyDto, isAdmin);
    }
  }