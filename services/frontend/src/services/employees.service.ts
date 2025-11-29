import { api } from './api';

export interface EmployeeStatistics {
    totalFootprint: number;
    footprintHistory: {
        month: number;
        year: number;
        totalFootprint: number;
    }[];
    breakdown: {
        travel: number;
        energy: number;
        waste: number;
        diet: number;
    };
}

export const employeesService = {
    async getStatistics(id: number): Promise<EmployeeStatistics> {
        const response = await api.get(`/employees/${id}/statistics`);
        return response.data;
    },
};
