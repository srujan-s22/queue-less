import { CanteenConfig, PickupSlot } from '@/types';
import { INITIAL_CONFIG, INITIAL_PICKUP_SLOTS } from '@/data/mockData';
import { storage } from './storage';

const CONFIG_STORAGE_KEY = 'canteen_config';
const SLOTS_STORAGE_KEY = 'pickup_slots';

export const configService = {
  getConfig(): CanteenConfig {
    return storage.get<CanteenConfig>(CONFIG_STORAGE_KEY, INITIAL_CONFIG);
  },

  updateConfig(updates: Partial<CanteenConfig>): CanteenConfig {
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
    return updated;
  },

  getSlots(): PickupSlot[] {
    return storage.get<PickupSlot[]>(SLOTS_STORAGE_KEY, INITIAL_PICKUP_SLOTS);
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
