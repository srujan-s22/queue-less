import { Request, Response, NextFunction } from 'express';
import {
  getStaffDashboardMetrics,
  getIncomingOrders,
  getPreparationOrders,
  getReadyOrders,
  handoverOrder,
} from '../services/staffService';
import { sendSuccess } from '../utils/response';

export const getDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await getStaffDashboardMetrics();
    return sendSuccess(res, metrics);
  } catch (error) {
    return next(error);
  }
};

export const getIncoming = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getIncomingOrders();
    return sendSuccess(res, orders);
  } catch (error) {
    return next(error);
  }
};

export const getPreparation = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getPreparationOrders();
    return sendSuccess(res, orders);
  } catch (error) {
    return next(error);
  }
};

export const getReady = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getReadyOrders();
    return sendSuccess(res, orders);
  } catch (error) {
    return next(error);
  }
};

export const confirmHandover = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await handoverOrder(req.params.id as string, req.user!.id);
    return sendSuccess(res, order, 'Order handover confirmed successfully');
  } catch (error) {
    return next(error);
  }
};
