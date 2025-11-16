import apiClient from './api';
import { DashboardOverview } from '../types';

export const dashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get('/dashboard/overview');
    return response.data;
  },

  getOccupancyRate: async (months: number = 12) => {
    const response = await apiClient.get('/dashboard/occupancy-rate', {
      params: { months },
    });
    return response.data;
  },

  getRevenue: async (months: number = 12) => {
    const response = await apiClient.get('/dashboard/revenue', {
      params: { months },
    });
    return response.data;
  },

  getRoomStatus: async () => {
    const response = await apiClient.get('/dashboard/room-status');
    return response.data;
  },

  getExpiringContracts: async (days: number = 30) => {
    const response = await apiClient.get('/dashboard/expiring-contracts', {
      params: { days },
    });
    return response.data;
  },

  getMaintenanceSummary: async () => {
    const response = await apiClient.get('/dashboard/maintenance-summary');
    return response.data;
  },

  getPendingReadings: async () => {
    const response = await apiClient.get('/dashboard/pending-readings');
    return response.data;
  },

  getRecentActivities: async (limit: number = 10) => {
    const response = await apiClient.get('/dashboard/recent-activities', {
      params: { limit },
    });
    return response.data;
  },
};
