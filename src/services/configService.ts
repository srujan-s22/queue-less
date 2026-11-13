import { CanteenConfig, PickupSlot } from '@/types';
import { INITIAL_CONFIG, INITIAL_PICKUP_SLOTS } from '@/data/mockData';
import { storage } from './storage';
import { settingsApi } from '@/lib/api/services/settingsApi';
import { slotsApi } from '@/lib/api/services/slotsApi';

const CONFIG_STORAGE_KEY = 'canteen_config';
const SLOTS_STORAGE_KEY = 'pickup_slots';

export const configService = {
  getConfig(): CanteenConfig {
    return storage.get<CanteenConfig>(CONFIG_STORAGE_KEY, INITIAL_CONFIG);
  },

  async fetchConfig(): Promise<CanteenConfig> {
    try {
      const config = await settingsApi.getSettings();
      if (config) {
        storage.set(CONFIG_STORAGE_KEY, config);
        return config;
      }
      return this.getConfig();
    } catch (err) {
      console.warn('[configService] Failed to fetch settings from API, using cached:', err);
      return this.getConfig();
    }
  },

  async updateConfig(updates: Partial<CanteenConfig>): Promise<CanteenConfig> {
    const current = this.getConfig();
    const updated = {
      ...current,
      ...updates,
      lateFeeConfig: {
        ...current.lateFeeConfig,
        ...(updates.lateFeeConfig || {}),
      },
    };
    storage.set(CONFIG_STORAGE_KEY, updated);

    try {
      const backendConfig = await settingsApi.updateSettings(updates);
      storage.set(CONFIG_STORAGE_KEY, backendConfig);
      return backendConfig;
    } catch (err) {
      console.warn('[configService] Failed to persist config to backend:', err);
      return updated;
    }
  },

  getSlots(): PickupSlot[] {
    return storage.get<PickupSlot[]>(SLOTS_STORAGE_KEY, INITIAL_PICKUP_SLOTS);
  },

  async fetchSlots(date?: string): Promise<PickupSlot[]> {
    try {
      const slots = await slotsApi.getSlots(date);
      if (slots && slots.length > 0) {
        storage.set(SLOTS_STORAGE_KEY, slots);
        return slots;
      }
      return this.getSlots();
    } catch (err) {
      console.warn('[configService] Failed to fetch slots from API, using cached:', err);
      return this.getSlots();
    }
  },

  updateSlot(id: string, updates: Partial<PickupSlot>): PickupSlot | null {
    const slots = this.getSlots();
    const index = slots.findIndex((s) => s.id === id);
    if (index === -1) return null;

    slots[index] = { ...slots[index], ...updates };
    storage.set(SLOTS_STORAGE_KEY, slots);
    return slots[index];
  },

  bookSlot(id: string): boolean {
    const slots = this.getSlots();
    const slot = slots.find((s) => s.id === id);
    if (!slot || slot.bookedCount >= slot.capacity) return false;

    slot.bookedCount += 1;
    if (slot.bookedCount >= slot.capacity) {
      slot.status = 'full';
    } else if (slot.bookedCount >= slot.capacity * 0.75) {
      slot.status = 'filling-fast';
    }
    storage.set(SLOTS_STORAGE_KEY, slots);
    return true;
  },

  resetDefaults(): void {
    storage.set(CONFIG_STORAGE_KEY, INITIAL_CONFIG);
    storage.set(SLOTS_STORAGE_KEY, INITIAL_PICKUP_SLOTS);
  },
};
