import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../prisma/prisma.service';
  import * as bcrypt from 'bcryptjs';
  import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
  import { JwtPayload } from './strategies/jwt.strategy';
  
  @Injectable()
  export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
    ) {}
  
    /**
     * Register a new employee
     */
    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
      const { email, employeeId, password, name, department, position, isAdmin, companyId } = registerDto;
  
      // Check if email already exists
      const existingEmail = await this.prisma.employee.findUnique({
        where: { email },
      });
  
      if (existingEmail) {
        throw new ConflictException('Email already registered');
      }
  
      // Check if employee ID already exists
      const existingEmployeeId = await this.prisma.employee.findUnique({
        where: { employeeId },
      });
  
      if (existingEmployeeId) {
        throw new ConflictException('Employee ID already exists');
      }
  
      // Check if company exists
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });
  
      if (!company) {
        throw new BadRequestException('Company not found');
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create employee
      const employee = await this.prisma.employee.create({
        data: {
          employeeId,
          name,
          email,
          password: hashedPassword,
          department: department || null,
          position: position || null,
          isAdmin: isAdmin || false,
          companyId,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
      });
  
      // Generate JWT token
      const payload: JwtPayload = {
        sub: employee.id,
        email: employee.email,
        employeeId: employee.employeeId,
      };
  
      const access_token = this.jwtService.sign(payload);
  
      return {
        access_token,
        user: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          isAdmin: employee.isAdmin,
          companyId: employee.companyId,
        },
      };
    }
  
    /**
     * Login an employee
     */
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
      const { email, password } = loginDto;
  
      // Find employee by email
      const employee = await this.prisma.employee.findUnique({
        where: { email },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
      });
  
      if (!employee) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, employee.password);
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Generate JWT token
      const payload: JwtPayload = {
        sub: employee.id,
        email: employee.email,
        employeeId: employee.employeeId,
      };
  
      const access_token = this.jwtService.sign(payload);
  
      return {
        access_token,
        user: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          isAdmin: employee.isAdmin,
          companyId: employee.companyId,
        },
      };
    }
  
    /**
     * Validate user from JWT payload
     */
    async validateUser(userId: number) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: userId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
      });
  
      if (!employee) {
        throw new UnauthorizedException('User not found');
      }
  
      // Remove password from response
      const { password, ...result } = employee;
      return result;
    }
  
    /**
     * Get current user profile
     */
    async getProfile(userId: number) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: userId },
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
            take: 1,
          },
        },
      });
  
      if (!employee) {
        throw new UnauthorizedException('User not found');
      }
  
      return {
        ...employee,
        latestFootprint: employee.footprints[0] || null,
      };
    }
  }