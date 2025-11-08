import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    Min,
    Max,
  } from 'class-validator';
  
  export class CreateFootprintDto {
    // Personal data
    @IsOptional()
    @IsString()
    bodyType?: string;
  
    @IsOptional()
    @IsString()
    sex?: string;
  
    @IsOptional()
    @IsString()
    diet?: string;
  
    @IsOptional()
    @IsString()
    showerFrequency?: string;
  
    @IsOptional()
    @IsString()
    socialActivity?: string;
  
    // Travel data
    @IsOptional()
    @IsString()
    transport?: string;
  
    @IsOptional()
    @IsString()
    vehicleType?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    vehicleKm?: number;
  
    @IsOptional()
    @IsString()
    airTravel?: string;
  
    // Waste data
    @IsOptional()
    @IsString()
    wasteBagSize?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    wasteBagCount?: number;
  
    @IsOptional()
    @IsBoolean()
    recyclePaper?: boolean;
  
    @IsOptional()
    @IsBoolean()
    recyclePlastic?: boolean;
  
    @IsOptional()
    @IsBoolean()
    recycleGlass?: boolean;
  
    @IsOptional()
    @IsBoolean()
    recycleMetal?: boolean;
  
    // Energy data
    @IsOptional()
    @IsString()
    heatingEnergy?: string;
  
    @IsOptional()
    @IsBoolean()
    cookingMicrowave?: boolean;
  
    @IsOptional()
    @IsBoolean()
    cookingOven?: boolean;
  
    @IsOptional()
    @IsBoolean()
    cookingGrill?: boolean;
  
    @IsOptional()
    @IsBoolean()
    cookingAirfryer?: boolean;
  
    @IsOptional()
    @IsBoolean()
    cookingStove?: boolean;
  
    @IsOptional()
    @IsString()
    energyEfficiency?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(24)
    dailyTvPc?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(24)
    internetDaily?: number;
  
    // Consumption data
    @IsOptional()
    @IsNumber()
    @Min(0)
    groceryBill?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    clothesMonthly?: number;
  }