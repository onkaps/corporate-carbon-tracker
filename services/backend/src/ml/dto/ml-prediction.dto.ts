export class MLPredictionRequestDto {
    // Personal data
    body_type: string;
    sex: string;
    diet: string;
    shower_frequency: string;
    social_activity: string;
  
    // Travel data
    transport: string;
    vehicle_type: string;
    vehicle_km: number;
    air_travel: string;
  
    // Waste data
    waste_bag_size: string;
    waste_bag_count: number;
    recycle_paper: boolean;
    recycle_plastic: boolean;
    recycle_glass: boolean;
    recycle_metal: boolean;
  
    // Energy data
    heating_energy: string;
    cooking_microwave: boolean;
    cooking_oven: boolean;
    cooking_grill: boolean;
    cooking_airfryer: boolean;
    cooking_stove: boolean;
    energy_efficiency: string;
    daily_tv_pc: number;
    internet_daily: number;
  
    // Consumption data
    grocery_bill: number;
    clothes_monthly: number;
  }
  
  export class MLPredictionResponseDto {
    total_footprint: number;
    travel_footprint: number;
    energy_footprint: number;
    waste_footprint: number;
    diet_footprint: number;
    confidence?: number;
    message?: string;
  }
  
  export class MLHealthDto {
    status: string;
    model_loaded: boolean;
    version: string;
    uptime?: number;
  }