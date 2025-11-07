import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { RegisterDto, LoginDto } from './dto';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';
  import { Public } from './decorators/public.decorator';
  import { GetUser } from './decorators/get-user.decorator';
  
  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}
  
    /**
     * POST /api/v1/auth/register
     * Register a new employee
     */
    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
    }
  
    /**
     * POST /api/v1/auth/login
     * Login an employee
     */
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto);
    }
  
    /**
     * GET /api/v1/auth/me
     * Get current user profile (protected route)
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@GetUser('id') userId: number) {
      return this.authService.getProfile(userId);
    }
  
    /**
     * GET /api/v1/auth/test
     * Test protected route
     */
    @UseGuards(JwtAuthGuard)
    @Get('test')
    testProtected(@GetUser() user: any) {
      return {
        message: 'This is a protected route',
        user,
      };
    }
  }