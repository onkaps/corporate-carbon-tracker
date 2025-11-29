import { api } from './api';

export interface DepartmentBreakdown {
    department: string;
    totalFootprint: number;
    employeeCount: number;
    averageFootprint: number;
}

export interface CompanyStatistics {
    totalFootprint: number;
    averageFootprint: number;
    totalEmployees: number;
    topDepartment: string;
}

export const companiesService = {
    async getStatistics(id: number): Promise<CompanyStatistics> {
        const response = await api.get(`/companies/${id}/statistics`);
        return response.data;
    },

    async getDepartmentBreakdown(id: number): Promise<DepartmentBreakdown[]> {
        const response = await api.get(`/companies/${id}/departments`);
        return response.data;
    },
};
