export class CompanyResponseDto {
    id: number;
    name: string;
    industry: string | null;
    createdAt: Date;
    employeeCount?: number;
    totalFootprint?: number;
    averageFootprint?: number;
  }