import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}