import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard APIs
export const dashboardApi = {
  getOverview: () => apiClient.get('/dashboard/overview'),
  getOccupancyRate: (months = 12) =>
    apiClient.get(`/dashboard/occupancy-rate?months=${months}`),
  getRevenue: (months = 12) =>
    apiClient.get(`/dashboard/revenue?months=${months}`),
  getRoomStatus: () => apiClient.get('/dashboard/room-status'),
  getExpiringContracts: (days = 30) =>
    apiClient.get(`/dashboard/expiring-contracts?days=${days}`),
  getMaintenanceSummary: () => apiClient.get('/dashboard/maintenance-summary'),
  getPendingReadings: () => apiClient.get('/dashboard/pending-readings'),
  getRecentActivities: (limit = 10) =>
    apiClient.get(`/dashboard/recent-activities?limit=${limit}`),
};

// Room APIs
export const roomApi = {
  getAll: (params?: any) => apiClient.get('/rooms', { params }),
  getById: (id: number) => apiClient.get(`/rooms/${id}`),
  create: (data: any) => apiClient.post('/rooms', data),
  update: (id: number, data: any) => apiClient.put(`/rooms/${id}`, data),
  delete: (id: number) => apiClient.delete(`/rooms/${id}`),
  checkAvailability: (id: number) => apiClient.get(`/rooms/${id}/availability`),
  getServices: (id: number) => apiClient.get(`/rooms/${id}/services`),
  addService: (id: number, data: any) =>
    apiClient.post(`/rooms/${id}/services`, data),
  removeService: (id: number, serviceId: number) =>
    apiClient.delete(`/rooms/${id}/services/${serviceId}`),
  getStatistics: () => apiClient.get('/rooms/statistics/summary'),
};

// Tenant APIs
export const tenantApi = {
  getAll: (params?: any) => apiClient.get('/tenants', { params }),
  getById: (id: number) => apiClient.get(`/tenants/${id}`),
  create: (data: any) => apiClient.post('/tenants', data),
  update: (id: number, data: any) => apiClient.put(`/tenants/${id}`, data),
  delete: (id: number) => apiClient.delete(`/tenants/${id}`),
  getContracts: (id: number) => apiClient.get(`/tenants/${id}/contracts`),
  getStatistics: () => apiClient.get('/tenants/statistics/summary'),
};

// Contract APIs
export const contractApi = {
  getAll: (params?: any) => apiClient.get('/contracts', { params }),
  getById: (id: number) => apiClient.get(`/contracts/${id}`),
  create: (data: any) => apiClient.post('/contracts', data),
  update: (id: number, data: any) => apiClient.put(`/contracts/${id}`, data),
  delete: (id: number) => apiClient.delete(`/contracts/${id}`),
  activate: (id: number) => apiClient.post(`/contracts/${id}/activate`),
  terminate: (id: number, data: any) =>
    apiClient.post(`/contracts/${id}/terminate`, data),
  renew: (id: number, data: any) =>
    apiClient.post(`/contracts/${id}/renew`, data),
  getStatistics: () => apiClient.get('/contracts/statistics/summary'),
  getExpiring: (days: number) => apiClient.get(`/contracts/expiring/${days}`),
};

// Service APIs
export const serviceApi = {
  getAll: (params?: any) => apiClient.get('/services', { params }),
  getById: (id: number) => apiClient.get(`/services/${id}`),
  create: (data: any) => apiClient.post('/services', data),
  update: (id: number, data: any) => apiClient.put(`/services/${id}`, data),
  delete: (id: number) => apiClient.delete(`/services/${id}`),
  getByType: (type: string) => apiClient.get(`/services/type/${type}`),
  getRequired: () => apiClient.get('/services/required/list'),
  getStatistics: () => apiClient.get('/services/statistics/summary'),
};

// Maintenance APIs
export const maintenanceApi = {
  getAll: (params?: any) => apiClient.get('/maintenance', { params }),
  getById: (id: number) => apiClient.get(`/maintenance/${id}`),
  create: (data: any) => apiClient.post('/maintenance', data),
  update: (id: number, data: any) => apiClient.put(`/maintenance/${id}`, data),
  updateStatus: (id: number, status: string) =>
    apiClient.put(`/maintenance/${id}/status`, { status }),
  assign: (id: number, assignedTo: number) =>
    apiClient.post(`/maintenance/${id}/assign`, { assignedTo }),
  delete: (id: number) => apiClient.delete(`/maintenance/${id}`),
  getByRoom: (roomId: number, params?: any) =>
    apiClient.get(`/maintenance/room/${roomId}`, { params }),
  getStatistics: () => apiClient.get('/maintenance/statistics/summary'),
  getOverdue: () => apiClient.get('/maintenance/overdue/list'),
};

export default apiClient;
