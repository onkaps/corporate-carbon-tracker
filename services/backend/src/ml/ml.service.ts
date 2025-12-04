import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import {
  MLPredictionRequestDto,
  MLPredictionResponseDto,
  MLHealthDto,
} from './dto';

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  private readonly mlServiceUrl: string;
  private readonly timeout: number = 30000; // 30 seconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Get ML service URL from environment variables
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:5000';
    this.logger.log(`ML Service URL: ${this.mlServiceUrl}`);
  }

  /**
   * Check if ML service is available
   */
  async isMLServiceAvailable(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<MLHealthDto>(`${this.mlServiceUrl}/health`, {
            timeout: 5000, // 5 second timeout for health check
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.warn(
                `ML service health check failed: ${error.message}`,
              );
              throw new HttpException(
                'ML service unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            }),
          ),
      );

      const isAvailable =
        response.data.status === 'healthy' && response.data.model_loaded;
      this.logger.log(
        `ML Service health check: ${isAvailable ? 'Available' : 'Unavailable'}`,
      );
      return isAvailable;
    } catch (error) {
      this.logger.warn(`ML service is not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get ML service health status
   */
  async getHealth(): Promise<MLHealthDto> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<MLHealthDto>(`${this.mlServiceUrl}/health`, {
            timeout: 5000,
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`Failed to get ML health: ${error.message}`);
              throw new HttpException(
                'ML service unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
              );
            }),
          ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'ML service health check failed',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Predict carbon footprint using ML model
   */
  async predictFootprint(
    data: MLPredictionRequestDto,
  ): Promise<MLPredictionResponseDto> {
    try {
      this.logger.log('Sending prediction request to ML service...');

      // Transform data to match ML API expectations
      const mlRequest = this.transformToMLFormat(data);

      const response = await firstValueFrom(
        this.httpService
          .post<MLPredictionResponseDto>(
            `${this.mlServiceUrl}/predict`,
            mlRequest,
            {
              timeout: this.timeout,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `ML prediction failed: ${error.message}`,
                error.response?.data,
              );

              // If ML service fails, throw exception to trigger fallback
              throw new HttpException(
                {
                  message: 'ML prediction failed',
                  error: error.response?.data || error.message,
                },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      this.logger.log(
        `ML prediction successful: ${response.data.total_footprint} kg CO2`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error in predictFootprint: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transform frontend/backend format to ML API format
   * Converts camelCase to snake_case and handles data types
   */
  private transformToMLFormat(data: any): MLPredictionRequestDto {
    return {
      // Personal data
      body_type: data.bodyType || 'average',
      sex: data.sex || 'male',
      diet: data.diet || 'omnivore',
      shower_frequency: data.showerFrequency || 'daily',
      social_activity: data.socialActivity || 'often',

      // Travel data
      transport: data.transport || 'private',
      vehicle_type: data.vehicleType || 'petrol',
      vehicle_km: Number(data.vehicleKm) || 0,
      air_travel: data.airTravel || 'never',

      // Waste data
      waste_bag_size: data.wasteBagSize || 'medium',
      waste_bag_count: Number(data.wasteBagCount) || 0,
      recycle_paper: Boolean(data.recyclePaper),
      recycle_plastic: Boolean(data.recyclePlastic),
      recycle_glass: Boolean(data.recycleGlass),
      recycle_metal: Boolean(data.recycleMetal),

      // Energy data
      heating_energy: data.heatingEnergy || 'natural gas',
      cooking_microwave: Boolean(data.cookingMicrowave),
      cooking_oven: Boolean(data.cookingOven),
      cooking_grill: Boolean(data.cookingGrill),
      cooking_airfryer: Boolean(data.cookingAirfryer),
      cooking_stove: Boolean(data.cookingStove),
      energy_efficiency: data.energyEfficiency || 'sometimes',
      daily_tv_pc: Number(data.dailyTvPc) || 0,
      internet_daily: Number(data.internetDaily) || 0,

      // Consumption data
      grocery_bill: Number(data.groceryBill) || 0,
      clothes_monthly: Number(data.clothesMonthly) || 0,
    };
  }

  /**
   * Simple fallback calculation when ML service is unavailable
   * Handles both camelCase and snake_case field names
   */
  calculateSimpleFallback(data: any): MLPredictionResponseDto {
    this.logger.warn('Using simple fallback calculation (ML service unavailable)');

    let total = 0;

    // Helper to get value from either camelCase or snake_case
    const getValue = (camelKey: string, snakeKey: string): any => {
      return data[camelKey] !== undefined ? data[camelKey] : data[snakeKey];
    };

    // Diet impact
    const dietImpact = {
      vegan: 50,
      vegetarian: 100,
      pescatarian: 150,
      omnivore: 250,
    };
    const dietValue = getValue('diet', 'diet') || 'omnivore';
    const diet = dietImpact[dietValue?.toLowerCase()] || 150;
    total += diet;

    // Transport impact
    const vehicleKm = Number(getValue('vehicleKm', 'vehicle_km')) || 0;
    const airTravel = getValue('airTravel', 'air_travel') || 'never';
    const travel = vehicleKm * 0.2 + this.getAirTravelImpact(airTravel);
    total += travel;

    // Waste impact
    const wasteBagCount = Number(getValue('wasteBagCount', 'waste_bag_count')) || 0;
    const waste = Math.max(0, wasteBagCount * 10 - this.getRecyclingDiscount(data));
    total += waste;

    // Energy impact
    const dailyTvPc = Number(getValue('dailyTvPc', 'daily_tv_pc')) || 0;
    const internetDaily = Number(getValue('internetDaily', 'internet_daily')) || 0;
    const energy = dailyTvPc * 5 + internetDaily * 3;
    total += energy;

    // Consumption impact
    const groceryBill = Number(getValue('groceryBill', 'grocery_bill')) || 0;
    const clothesMonthly = Number(getValue('clothesMonthly', 'clothes_monthly')) || 0;
    total += groceryBill * 0.1 + clothesMonthly * 15;

    return {
      total_footprint: Math.max(Math.round(total), 0),
      travel_footprint: Math.round(travel),
      energy_footprint: Math.round(energy),
      waste_footprint: Math.round(waste),
      diet_footprint: Math.round(diet),
      message: 'Calculated using fallback algorithm (ML service unavailable)',
    };
  }

  private getAirTravelImpact(airTravel: string): number {
    const impacts = {
      never: 0,
      rarely: 100,
      frequently: 300,
      'very frequently': 500,
    };
    return impacts[airTravel?.toLowerCase()] || 0;
  }

  private getRecyclingDiscount(data: any): number {
    // Handle both camelCase and snake_case
    const recyclePaper = data.recyclePaper !== undefined ? data.recyclePaper : data.recycle_paper;
    const recyclePlastic = data.recyclePlastic !== undefined ? data.recyclePlastic : data.recycle_plastic;
    const recycleGlass = data.recycleGlass !== undefined ? data.recycleGlass : data.recycle_glass;
    const recycleMetal = data.recycleMetal !== undefined ? data.recycleMetal : data.recycle_metal;
    
    const count = [
      recyclePaper,
      recyclePlastic,
      recycleGlass,
      recycleMetal,
    ].filter(Boolean).length;
    return count * 5;
  }
}