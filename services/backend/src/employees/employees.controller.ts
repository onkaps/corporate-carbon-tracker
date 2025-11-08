import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { EmployeesService } from './employees.service';
  import { UpdateEmployeeDto } from './dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { GetUser } from '../auth/decorators/get-user.decorator';
  
  @Controller('employees')
  @UseGuards(JwtAuthGuard)
  export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) {}
  
    /**
     * GET /api/v1/employees
     * Get all employees in the company
     */
    @Get()
    findAll(
      @GetUser('companyId') companyId: number,
      @GetUser('isAdmin') isAdmin: boolean,
      @GetUser('id') userId: number,
    ) {
      return this.employeesService.findAll(companyId, isAdmin, userId);
    }
  
    /**
     * GET /api/v1/employees/:id
     * Get employee by ID
     */
    @Get(':id')
    findOne(
      @Param('id', ParseIntPipe) id: number,
      @GetUser('id') userId: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.employeesService.findOne(id, userId, isAdmin);
    }
  
    /**
     * GET /api/v1/employees/:id/statistics
     * Get employee carbon footprint statistics
     */
    @Get(':id/statistics')
    getStatistics(
      @Param('id', ParseIntPipe) id: number,
      @GetUser('id') userId: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.employeesService.getStatistics(id);
    }
  
    /**
     * PATCH /api/v1/employees/:id
     * Update employee
     */
    @Patch(':id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateEmployeeDto: UpdateEmployeeDto,
      @GetUser('id') userId: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.employeesService.update(id, updateEmployeeDto, userId, isAdmin);
    }
  
    /**
     * DELETE /api/v1/employees/:id
     * Delete employee (Admin only)
     */
    @Delete(':id')
    remove(
      @Param('id', ParseIntPipe) id: number,
      @GetUser('isAdmin') isAdmin: boolean,
    ) {
      return this.employeesService.remove(id, isAdmin);
    }
  }