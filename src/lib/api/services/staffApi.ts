import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { StaffDashboardMetrics } from '../types';
import { adaptOrder } from '../adapters';
import { Order } from '@/types';

export const staffApi = {
  getDashboard: async (): Promise<StaffDashboardMetrics> => {
    const res = await apiClient<StaffDashboardMetrics>(ENDPOINTS.STAFF.DASHBOARD);
    return res.data;
  },

  getIncoming: async (): Promise<Order[]> => {
    const res = await apiClient<any[]>(ENDPOINTS.STAFF.INCOMING);
    return Array.isArray(res.data) ? res.data.map(adaptOrder) : [];
  },

  getPreparation: async (): Promise<Order[]> => {
    const res = await apiClient<any[]>(ENDPOINTS.STAFF.PREPARATION);
    return Array.isArray(res.data) ? res.data.map(adaptOrder) : [];
  },

  getReady: async (): Promise<Order[]> => {
    const res = await apiClient<any[]>(ENDPOINTS.STAFF.READY);
    return Array.isArray(res.data) ? res.data.map(adaptOrder) : [];
  },

  handoverOrder: async (id: string): Promise<Order> => {
    const res = await apiClient<any>(ENDPOINTS.STAFF.HANDOVER(id), {
      method: 'POST',
    });
    return adaptOrder(res.data);
  },
};
