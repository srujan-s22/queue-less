import { Router } from 'express';
import { listOrders } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/orders', listOrders);

export default router;
