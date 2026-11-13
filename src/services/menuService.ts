import { MenuItem, Category, DietaryType } from '@/types';
import { INITIAL_MENU_ITEMS } from '@/data/mockData';
import { storage } from './storage';
import { menuApi, MenuFilterParams } from '@/lib/api/services/menuApi';

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

  async fetchMenuItems(filters: MenuFilterParams = {}): Promise<MenuItem[]> {
    try {
      const items = await menuApi.getMenu(filters);
      if (items && items.length > 0) {
        storage.set(MENU_STORAGE_KEY, items);
        return items;
      }
      return this.getAll();
    } catch (err) {
      console.warn('[menuService] Failed to fetch menu from API, using cached:', err);
      return this.getAll();
    }
  },

  async fetchMenuItemById(id: string): Promise<MenuItem | undefined> {
    try {
      const item = await menuApi.getMenuItem(id);
      if (item) {
        const items = this.getAll();
        const index = items.findIndex((i) => i.id === item.id);
        if (index > -1) {
          items[index] = item;
        } else {
          items.push(item);
        }
        storage.set(MENU_STORAGE_KEY, items);
        return item;
      }
      return this.getById(id);
    } catch {
      return this.getById(id);
    }
  },

  async toggleAvailability(id: string): Promise<MenuItem | null> {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const previousAvailability = items[index].isAvailable;
    const newAvailability = !previousAvailability;

    // Call backend API
    const updated = await menuApi.toggleAvailability(id, newAvailability);
    items[index] = updated;
    storage.set(MENU_STORAGE_KEY, items);
    return updated;
  },

  async saveItem(item: Partial<MenuItem> & { name: string; price: number; category: Category }): Promise<MenuItem> {
    const items = this.getAll();

    if (item.id && !item.id.startsWith('menu_')) {
      // Edit existing backend dish
      try {
        const updated = await menuApi.updateItem(item.id, {
          name: item.name,
          description: item.description,
          category: item.category,
          price: Number(item.price),
          dietary: item.dietary,
          prepTimeMinutes: item.prepTimeMinutes,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          calories: item.calories,
        });

        const index = items.findIndex((i) => i.id === item.id);
        if (index !== -1) {
          items[index] = updated;
        } else {
          items.unshift(updated);
        }
        storage.set(MENU_STORAGE_KEY, items);
        return updated;
      } catch (err) {
        console.warn('[menuService] Update item API failed, saving locally:', err);
      }
    }

    // Create new dish via API
    try {
      const created = await menuApi.createItem({
        name: item.name,
        description: item.description || '',
        category: item.category,
        price: Number(item.price),
        dietary: item.dietary || 'veg',
        prepTimeMinutes: Number(item.prepTimeMinutes) || 8,
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        isAvailable: item.isAvailable ?? true,
        calories: Number(item.calories) || 300,
        allergens: item.allergens || [],
      });

      items.unshift(created);
      storage.set(MENU_STORAGE_KEY, items);
      return created;
    } catch (err) {
      console.warn('[menuService] Create item API failed, saving locally:', err);
      const fallbackItem: MenuItem = {
        id: item.id || `menu_${Date.now()}`,
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
      items.unshift(fallbackItem);
      storage.set(MENU_STORAGE_KEY, items);
      return fallbackItem;
    }
  },

  async deleteItem(id: string): Promise<boolean> {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    storage.set(MENU_STORAGE_KEY, filtered);

    try {
      await menuApi.removeItem(id);
      return true;
    } catch (err) {
      console.warn('[menuService] Delete item API failed, removed locally:', err);
      return true;
    }
  },

  resetDefaults(): void {
    storage.set(MENU_STORAGE_KEY, INITIAL_MENU_ITEMS);
  },
};
