import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { CreateMenuItemRequest, UpdateMenuItemRequest } from '../types';
import { adaptMenuItem } from '../adapters';
import { MenuItem, Category, DietaryType } from '@/types';

export interface MenuFilterParams {
  category?: Category | 'all';
  dietary?: DietaryType | 'all';
  search?: string;
  availableOnly?: boolean;
}

export const menuApi = {
  getMenu: async (filters: MenuFilterParams = {}): Promise<MenuItem[]> => {
    const params: Record<string, string | boolean | undefined> = {};
    if (filters.category && filters.category !== 'all') params.category = filters.category;
    if (filters.dietary && filters.dietary !== 'all') params.dietary = filters.dietary;
    if (filters.search) params.search = filters.search;
    if (filters.availableOnly) params.availableOnly = true;

    const res = await apiClient<any[]>(ENDPOINTS.MENU.BASE, { params });
    return Array.isArray(res.data) ? res.data.map(adaptMenuItem) : [];
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    const res = await apiClient<any>(ENDPOINTS.MENU.DETAIL(id));
    return adaptMenuItem(res.data);
  },

  createItem: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const res = await apiClient<any>(ENDPOINTS.MENU.BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return adaptMenuItem(res.data);
  },

  updateItem: async (id: string, updates: UpdateMenuItemRequest): Promise<MenuItem> => {
    const res = await apiClient<any>(ENDPOINTS.MENU.DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return adaptMenuItem(res.data);
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<MenuItem> => {
    const res = await apiClient<any>(ENDPOINTS.MENU.AVAILABILITY(id), {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
    return adaptMenuItem(res.data);
  },

  removeItem: async (id: string): Promise<void> => {
    await apiClient(ENDPOINTS.MENU.DETAIL(id), {
      method: 'DELETE',
    });
  },
};
