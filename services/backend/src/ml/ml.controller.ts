import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MlService } from './ml.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MLPredictionRequestDto } from './dto';

@Controller('ml')
@UseGuards(JwtAuthGuard)
export class MlController {
  constructor(private readonly mlService: MlService) {}

  /**
   * GET /api/v1/ml/health
   * Check ML service health
   */
  @Get('health')
  async getHealth() {
    return this.mlService.getHealth();
  }

  /**
   * GET /api/v1/ml/status
   * Check if ML service is available
   */
  @Get('status')
  async getStatus() {
    const isAvailable = await this.mlService.isMLServiceAvailable();
    return {
      available: isAvailable,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * POST /api/v1/ml/predict
   * Test prediction endpoint
   */
  @Post('predict')
  async predict(@Body() data: MLPredictionRequestDto) {
    return this.mlService.predictFootprint(data);
  }
}