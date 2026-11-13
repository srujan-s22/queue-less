import { Router } from 'express';
import {
  submitOrder,
  getMyOrders,
  getOrderDetails,
  updateStatus,
  cancelOrder,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validateRequest } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema, cancelOrderSchema } from '../validators';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('student'),
  validateRequest(createOrderSchema),
  submitOrder
);
router.get('/my-orders', authenticate, authorize('student'), getMyOrders);
router.get('/:id', authenticate, getOrderDetails);
router.patch(
  '/:id/status',
  authenticate,
  authorize('staff', 'admin'),
  validateRequest(updateOrderStatusSchema),
  updateStatus
);
router.post(
  '/:id/cancel',
  authenticate,
  authorize('student', 'admin'),
  validateRequest(cancelOrderSchema),
  cancelOrder
);

export default router;
