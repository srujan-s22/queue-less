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

export interface StaffMemberDto {
  id: string;
  name: string;
  email: string;
  role: string;
  counter: string;
  shift: string;
  status: 'Active' | 'On Break' | 'Off Duty';
  phone: string;
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

  getStaff: async (): Promise<StaffMemberDto[]> => {
    const res = await apiClient<StaffMemberDto[]>(ENDPOINTS.ADMIN.STAFF);
    return Array.isArray(res.data) ? res.data : [];
  },

  createStaff: async (payload: {
    name: string;
    email: string;
    password: string;
    department?: string;
    phone?: string;
  }): Promise<StaffMemberDto> => {
    const res = await apiClient<StaffMemberDto>(ENDPOINTS.ADMIN.STAFF, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updateStaffStatus: async (id: string, status?: string): Promise<StaffMemberDto> => {
    const res = await apiClient<StaffMemberDto>(ENDPOINTS.ADMIN.STAFF_STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },
};
