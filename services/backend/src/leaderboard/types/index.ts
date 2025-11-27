export interface LeaderboardEntry {
    rank: number;
    employeeId: string;
    name: string;
    department: string | null;
    totalFootprint: number;
    treesNeeded: number;
    calculationCount: number;
    trend: 'improving' | 'worsening' | 'stable';
    badge?: string;
  }
  
  export interface DepartmentRanking {
    rank: number;
    department: string;
    employeeCount: number;
    averageFootprint: number;
    totalFootprint: number;
    treesNeeded: number;
    topPerformer: {
      name: string;
      footprint: number;
    };
  }
  
  export interface CompanyRanking {
    rank: number;
    companyId: number;
    companyName: string;
    industry: string | null;
    employeeCount: number;
    averageFootprint: number;
    totalFootprint: number;
  }
  
  export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
    progress?: number;
    target?: number;
  }
  
  export interface MonthlyTrend {
    month: number;
    year: number;
    averageFootprint: number;
    totalCalculations: number;
    change: number; // percentage change from previous month
    changeDirection: 'up' | 'down' | 'stable';
  }