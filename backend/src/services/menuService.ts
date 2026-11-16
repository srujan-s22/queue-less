import { MenuItem, IMenuItem } from '../models';
import { NotFoundError } from '../utils/errors';
import { socketEmitter } from '../socket/emitter';
import { CANONICAL_MENU_ITEMS } from '../config/menuDefaults';

export interface MenuFilterOptions {
  category?: string;
  dietary?: string;
  search?: string;
  availableOnly?: boolean;
}

export const ensureDefaultMenuItems = async (): Promise<IMenuItem[]> => {
  const count = await MenuItem.countDocuments({ isArchived: false });
  if (count === 0) {
    for (const item of CANONICAL_MENU_ITEMS) {
      await MenuItem.findOneAndUpdate(
        { name: item.name },
        { ...item, isArchived: false },
        { upsert: true, new: true }
      );
    }
  }
  return MenuItem.find({ isArchived: false }).sort({ isAvailable: -1, rating: -1, name: 1 });
};

export const seedDefaultMenuItems = async (): Promise<IMenuItem[]> => {
  for (const item of CANONICAL_MENU_ITEMS) {
    await MenuItem.findOneAndUpdate(
      { name: item.name },
      { ...item, isArchived: false },
      { upsert: true, new: true }
    );
  }
  return MenuItem.find({ isArchived: false }).sort({ isAvailable: -1, rating: -1, name: 1 });
};

export const listMenuItems = async (filters: MenuFilterOptions = {}) => {
  const activeCount = await MenuItem.countDocuments({ isArchived: false });
  if (activeCount === 0) {
    await ensureDefaultMenuItems();
  }

  const query: any = { isArchived: false };

  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }

  if (filters.dietary && filters.dietary !== 'all') {
    query.dietary = filters.dietary;
  }

  if (filters.availableOnly) {
    query.isAvailable = true;
  }

  if (filters.search && filters.search.trim() !== '') {
    const term = filters.search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ];
  }

  const items = await MenuItem.find(query).sort({ isAvailable: -1, rating: -1, name: 1 });
  return items;
};

export const getMenuItemById = async (id: string) => {
  const item = await MenuItem.findOne({ _id: id, isArchived: false });
  if (!item) {
    throw new NotFoundError('Menu item not found or has been archived.');
  }
  return item;
};

export const createMenuItem = async (data: Partial<IMenuItem>) => {
  const newItem = await MenuItem.create({
    ...data,
    isArchived: false,
  });
  socketEmitter.emitMenuUpdated(newItem);
  return newItem;
};

export const updateMenuItem = async (id: string, updates: Partial<IMenuItem>) => {
  const updatedItem = await MenuItem.findOneAndUpdate(
    { _id: id, isArchived: false },
    { $set: updates },
    { new: true }
  );
  if (!updatedItem) {
    throw new NotFoundError('Menu item not found.');
  }
  socketEmitter.emitMenuUpdated(updatedItem);
  return updatedItem;
};

export const toggleItemAvailability = async (id: string, isAvailable: boolean) => {
  const updatedItem = await MenuItem.findOneAndUpdate(
    { _id: id, isArchived: false },
    { $set: { isAvailable } },
    { new: true }
  );
  if (!updatedItem) {
    throw new NotFoundError('Menu item not found.');
  }
  socketEmitter.emitInventoryUpdated(updatedItem);
  return updatedItem;
};

export const archiveMenuItem = async (id: string) => {
  const archived = await MenuItem.findOneAndUpdate(
    { _id: id, isArchived: false },
    { $set: { isArchived: true, isAvailable: false } },
    { new: true }
  );
  if (!archived) {
    throw new NotFoundError('Menu item not found.');
  }
  socketEmitter.emitMenuUpdated({ _id: id, isArchived: true });
  return { message: 'Menu item archived successfully' };
};
