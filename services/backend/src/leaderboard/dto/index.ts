import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class LeaderboardQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(1)
  month?: number;

  @IsOptional()
  @IsNumber()
  @Min(2020)
  year?: number;

  @IsOptional()
  @IsString()
  department?: string;
}

export class TrendQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  months?: number = 6;
}

export class ComparisonQueryDto {
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsNumber()
  @Min(2020)
  year?: number;
}