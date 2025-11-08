export class FootprintResponseDto {
    id: number;
    employeeId: number;
    totalFootprint: number;
    travelFootprint: number | null;
    energyFootprint: number | null;
    wasteFootprint: number | null;
    dietFootprint: number | null;
    month: number;
    year: number;
    calculatedAt: Date;
    treesNeeded: number;
  }