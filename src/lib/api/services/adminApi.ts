import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { AdminAnalyticsMetrics, PaginatedResult } from '../types';
import { adaptOrder } from '../adapters';
import { Order } from '@/types';

export interface AdminOrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const adminApi = {
  listOrders: async (
    params: AdminOrderQueryParams = {}
  ): Promise<PaginatedResult<Order>> => {
    const res = await apiClient<any[]>(ENDPOINTS.ADMIN.ORDERS, {
      params: {
        page: params.page,
        limit: params.limit,
        status: params.status,
        search: params.search,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });

    const items = Array.isArray(res.data) ? res.data.map(adaptOrder) : [];
    return {
      items,
      pagination: {
        page: res.meta?.page || 1,
        limit: res.meta?.limit || 20,
        total: res.meta?.total || items.length,
        totalPages: res.meta?.totalPages || 1,
      },
    };
  },

  getAnalytics: async (): Promise<AdminAnalyticsMetrics> => {
    const res = await apiClient<AdminAnalyticsMetrics>(ENDPOINTS.ANALYTICS.DASHBOARD);
    return res.data;
  },

  exportCsv: async (): Promise<string> => {
    const res = await apiClient<string>(ENDPOINTS.ANALYTICS.EXPORT_CSV);
    return String(res.data);
  },
};
