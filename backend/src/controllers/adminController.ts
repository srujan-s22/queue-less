import { Request, Response, NextFunction } from 'express';
import {
  getAllOrders,
  getCanteenSettings,
  updateCanteenSettings,
  getAnalyticsDashboard,
  exportOrdersCsv,
  getStaffRoster,
  createStaffMember,
  updateStaffStatus,
} from '../services/adminService';
import { sendSuccess } from '../utils/response';

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      status: req.query.status as string,
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const result = await getAllOrders(query);
    return sendSuccess(res, result.orders, undefined, 200, result.pagination);
  } catch (error) {
    return next(error);
  }
};

export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getCanteenSettings();
    return sendSuccess(res, settings);
  } catch (error) {
    return next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await updateCanteenSettings(req.body, req.user!.id);
    return sendSuccess(res, updated, 'Canteen settings updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const getAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await getAnalyticsDashboard();
    return sendSuccess(res, analytics);
  } catch (error) {
    return next(error);
  }
};

export const exportCsv = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const csvContent = await exportOrdersCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="queueless-orders-export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return next(error);
  }
};

export const listStaff = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roster = await getStaffRoster();
    return sendSuccess(res, roster, 'Staff roster retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newStaff = await createStaffMember(req.body);
    return sendSuccess(res, newStaff, 'Staff account created successfully', 201);
  } catch (error) {
    return next(error);
  }
};

export const changeStaffStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await updateStaffStatus(req.params.id as string, req.body.status);
    return sendSuccess(res, updated, 'Staff status updated successfully');
  } catch (error) {
    return next(error);
  }
};
