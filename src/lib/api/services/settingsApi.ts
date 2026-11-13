import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { adaptCanteenConfig } from '../adapters';
import { CanteenConfig } from '@/types';

export const settingsApi = {
  getSettings: async (): Promise<CanteenConfig> => {
    const res = await apiClient<any>(ENDPOINTS.SETTINGS.BASE);
    return adaptCanteenConfig(res.data);
  },

  updateSettings: async (updates: Partial<CanteenConfig>): Promise<CanteenConfig> => {
    // Map frontend structure to backend schema
    const payload: any = {};
    if (updates.isOpen !== undefined) payload.isOpen = updates.isOpen;
    if (updates.announcement !== undefined) payload.announcement = updates.announcement;
    if (updates.packagingCharge !== undefined) payload.packagingCharge = updates.packagingCharge;
    if (updates.taxRatePercent !== undefined) payload.taxRatePercent = updates.taxRatePercent;
    if (updates.slotIntervalMinutes !== undefined) payload.slotIntervalMinutes = updates.slotIntervalMinutes;
    if (updates.maxCapacityPerSlot !== undefined) payload.defaultSlotCapacity = updates.maxCapacityPerSlot;

    if (updates.operatingHours) {
      payload.operatingHours = {
        openTime: updates.operatingHours.open,
        closeTime: updates.operatingHours.close,
      };
    }

    if (updates.lateFeeConfig) {
      if (updates.lateFeeConfig.gracePeriodMinutes !== undefined) {
        payload.gracePeriodMinutes = updates.lateFeeConfig.gracePeriodMinutes;
      }
      if (updates.lateFeeConfig.lateFeeAmount !== undefined) {
        payload.lateFeeAmount = updates.lateFeeConfig.lateFeeAmount;
      }
      if (updates.lateFeeConfig.isLateFeeEnabled !== undefined) {
        payload.isLateFeeEnabled = updates.lateFeeConfig.isLateFeeEnabled;
      }
    }

    const res = await apiClient<any>(ENDPOINTS.SETTINGS.BASE, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return adaptCanteenConfig(res.data);
  },
};
