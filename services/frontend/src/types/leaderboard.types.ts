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
  
  export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }