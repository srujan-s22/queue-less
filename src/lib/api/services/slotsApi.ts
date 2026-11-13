import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { adaptPickupSlot } from '../adapters';
import { PickupSlot } from '@/types';

export const slotsApi = {
  getSlots: async (date?: string): Promise<PickupSlot[]> => {
    const res = await apiClient<any[]>(ENDPOINTS.SLOTS.BASE, {
      params: date ? { date } : undefined,
    });
    return Array.isArray(res.data) ? res.data.map(adaptPickupSlot) : [];
  },

  seedSlots: async (): Promise<PickupSlot[]> => {
    const res = await apiClient<any[]>(ENDPOINTS.SLOTS.SEED, {
      method: 'POST',
    });
    return Array.isArray(res.data) ? res.data.map(adaptPickupSlot) : [];
  },
};
