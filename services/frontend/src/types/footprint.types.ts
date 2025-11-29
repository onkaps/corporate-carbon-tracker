export interface FootprintData {
    bodyType?: string;
    sex?: string;
    diet?: string;
    showerFrequency?: string;
    socialActivity?: string;
    transport?: string;
    vehicleType?: string;
    vehicleKm?: number;
    airTravel?: string;
    wasteBagSize?: string;
    wasteBagCount?: number;
    recyclePaper?: boolean;
    recyclePlastic?: boolean;
    recycleGlass?: boolean;
    recycleMetal?: boolean;
    heatingEnergy?: string;
    cookingMicrowave?: boolean;
    cookingOven?: boolean;
    cookingGrill?: boolean;
    cookingAirfryer?: boolean;
    cookingStove?: boolean;
    energyEfficiency?: string;
    dailyTvPc?: number;
    internetDaily?: number;
    groceryBill?: number;
    clothesMonthly?: number;
  }
  
  export interface FootprintResult {
    id: number;
    totalFootprint: number;
    travelFootprint: number;
    energyFootprint: number;
    wasteFootprint: number;
    dietFootprint: number;
    treesNeeded: number;
    calculatedAt: string;
    month: number;
    year: number;
  }