import { MenuItem, Category } from '@/types';
import { INITIAL_MENU_ITEMS } from '@/data/mockData';
import { storage } from './storage';

const MENU_STORAGE_KEY = 'menu_items';

export const menuService = {
  getAll(): MenuItem[] {
    return storage.get<MenuItem[]>(MENU_STORAGE_KEY, INITIAL_MENU_ITEMS);
  },

  getById(id: string): MenuItem | undefined {
    const items = this.getAll();
    return items.find((item) => item.id === id);
  },

  getByCategory(category: Category | 'all'): MenuItem[] {
    const items = this.getAll();
    if (category === 'all') return items;
    return items.filter((item) => item.category === category);
  },

  toggleAvailability(id: string): MenuItem | null {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      isAvailable: !items[index].isAvailable,
    };
    storage.set(MENU_STORAGE_KEY, items);
    return items[index];
  },

  saveItem(item: Partial<MenuItem> & { name: string; price: number; category: Category }): MenuItem {
    const items = this.getAll();
    if (item.id) {
      // Edit existing
      const index = items.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...item } as MenuItem;
        storage.set(MENU_STORAGE_KEY, items);
        return items[index];
      }
    }

    // Create new
    const newItem: MenuItem = {
      id: `menu_${Date.now()}`,
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      category: item.category,
      dietary: item.dietary || 'veg',
      isAvailable: item.isAvailable ?? true,
      prepTimeMinutes: Number(item.prepTimeMinutes) || 8,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviewCount: 1,
      calories: Number(item.calories) || 300,
    };

    items.unshift(newItem);
    storage.set(MENU_STORAGE_KEY, items);
    return newItem;
  },

  deleteItem(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length !== items.length) {
      storage.set(MENU_STORAGE_KEY, filtered);
      return true;
    }
    return false;
  },

  resetDefaults(): void {
    storage.set(MENU_STORAGE_KEY, INITIAL_MENU_ITEMS);
  },
};
