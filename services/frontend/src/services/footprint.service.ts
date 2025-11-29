import { api } from './api';
import { FootprintData, FootprintResult } from '@/types/footprint.types';

export const footprintService = {
  async calculate(data: FootprintData): Promise {
    const response = await api.post('/footprints', data);
    return response.data;
  },

  async getMyFootprints(employeeId: number): Promise {
    const response = await api.get(`/footprints/employee/${employeeId}`);
    return response.data;
  },

  async getFootprintById(id: number): Promise {
    const response = await api.get(`/footprints/${id}`);
    return response.data;
  },

  async deleteFootprint(id: number): Promise {
    await api.delete(`/footprints/${id}`);
  },
};