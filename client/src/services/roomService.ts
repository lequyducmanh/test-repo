import apiClient from './api';
import { Room, PaginatedResponse, PaginationParams } from '../types';

interface RoomFilters extends PaginationParams {
  status?: string;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export const roomService = {
  getAll: async (filters?: RoomFilters): Promise<PaginatedResponse<Room>> => {
    const response = await apiClient.get('/rooms', { params: filters });
    return response.data;
  },

  getById: async (id: number): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },

  create: async (data: Partial<Room>): Promise<Room> => {
    const response = await apiClient.post('/rooms', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Room>): Promise<Room> => {
    const response = await apiClient.put(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`);
  },

  checkAvailability: async (id: number) => {
    const response = await apiClient.get(`/rooms/${id}/availability`);
    return response.data;
  },

  getServices: async (id: number) => {
    const response = await apiClient.get(`/rooms/${id}/services`);
    return response.data;
  },

  addService: async (id: number, data: any) => {
    const response = await apiClient.post(`/rooms/${id}/services`, data);
    return response.data;
  },

  removeService: async (id: number, serviceId: number) => {
    await apiClient.delete(`/rooms/${id}/services/${serviceId}`);
  },

  getStatistics: async () => {
    const response = await apiClient.get('/rooms/statistics/summary');
    return response.data;
  },
};
