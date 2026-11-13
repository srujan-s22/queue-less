import { Request, Response, NextFunction } from 'express';
import {
  listMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  archiveMenuItem,
} from '../services/menuService';
import { sendSuccess } from '../utils/response';

export const getMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string,
      dietary: req.query.dietary as string,
      search: req.query.search as string,
      availableOnly: req.query.availableOnly === 'true',
    };
    const items = await listMenuItems(filters);
    return sendSuccess(res, items);
  } catch (error) {
    return next(error);
  }
};

export const getMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await getMenuItemById(req.params.id as string);
    return sendSuccess(res, item);
  } catch (error) {
    return next(error);
  }
};

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newItem = await createMenuItem(req.body);
    return sendSuccess(res, newItem, 'Menu dish created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await updateMenuItem(req.params.id as string, req.body);
    return sendSuccess(res, updated, 'Menu dish updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const toggleAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await toggleItemAvailability(req.params.id as string, req.body.isAvailable);
    return sendSuccess(res, updated, `Dish availability set to ${req.body.isAvailable}`);
  } catch (error) {
    return next(error);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await archiveMenuItem(req.params.id as string);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
};
