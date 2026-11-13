import { Request, Response, NextFunction } from 'express';
import {
  createOrder,
  getStudentOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrderByStudent,
} from '../services/orderService';
import { sendSuccess } from '../utils/response';

export const submitOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    const order = await createOrder(req.user!.id, {
      ...req.body,
      idempotencyKey,
    });
    return sendSuccess(res, order, 'Order placed successfully', 201);
  } catch (error) {
    return next(error);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getStudentOrders(req.user!.id);
    return sendSuccess(res, orders);
  } catch (error) {
    return next(error);
  }
};

export const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await getOrderById(req.params.id as string, req.user!);
    return sendSuccess(res, order);
  } catch (error) {
    return next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await updateOrderStatus(
      req.params.id as string,
      req.body.status,
      { id: req.user!.id, role: req.user!.role as any },
      req.body.rejectionReason
    );
    return sendSuccess(res, updated, `Order status updated to ${req.body.status}`);
  } catch (error) {
    return next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cancelled = await cancelOrderByStudent(
      req.params.id as string,
      req.user!.id,
      req.body?.reason
    );
    return sendSuccess(res, cancelled, 'Order cancelled successfully');
  } catch (error) {
    return next(error);
  }
};
