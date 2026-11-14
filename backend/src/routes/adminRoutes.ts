import { Router } from 'express';
import {
  listOrders,
  listStaff,
  createStaff,
  changeStaffStatus,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/orders', listOrders);
router.get('/staff', listStaff);
router.post('/staff', createStaff);
router.patch('/staff/:id/status', changeStaffStatus);

export default router;
