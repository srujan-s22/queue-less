import { Request, Response, NextFunction } from 'express';
import { listPickupSlots, getSlotById, seedSlotsForDate } from '../services/slotService';
import { sendSuccess } from '../utils/response';
import { getISTMidnightUTC } from '../utils/timezone';

export const getSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateParam = req.query.date as string | undefined;
    const slots = await listPickupSlots(dateParam);
    return sendSuccess(res, slots);
  } catch (error) {
    return next(error);
  }
};

export const getSlot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slot = await getSlotById(req.params.id as string);
    return sendSuccess(res, slot);
  } catch (error) {
    return next(error);
  }
};

export const seedTodaySlots = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const todayMidnight = getISTMidnightUTC();
    const slots = await seedSlotsForDate(todayMidnight);
    return sendSuccess(res, slots, 'Pickup slots refreshed for today', 201);
  } catch (error) {
    return next(error);
  }
};
