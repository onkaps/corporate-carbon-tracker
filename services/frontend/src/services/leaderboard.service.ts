import { api } from './api';
import { LeaderboardEntry, Achievement } from '@/types/leaderboard.types';

export const leaderboardService = {
  async getEmployeeLeaderboard(params?: {
    limit?: number;
    month?: number;
    year?: number;
    department?: string;
  }): Promise {
    const response = await api.get('/leaderboard/employees', { params });
    return response.data;
  },

  async getMyRank() {
    const response = await api.get('/leaderboard/my-rank');
    return response.data;
  },

  async getAchievements(employeeId: number): Promise {
    const response = await api.get(`/leaderboard/achievements/${employeeId}`);
    return response.data;
  },

  async getDepartmentRankings() {
    const response = await api.get('/leaderboard/departments');
    return response.data;
  },
};