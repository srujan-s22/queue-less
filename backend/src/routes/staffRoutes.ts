import { Router } from 'express';
import {
  getDashboard,
  getIncoming,
  getPreparation,
  getReady,
  confirmHandover,
} from '../controllers/staffController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate, authorize('staff', 'admin'));

router.get('/dashboard', getDashboard);
router.get('/incoming', getIncoming);
router.get('/preparation', getPreparation);
router.get('/ready', getReady);
router.post('/orders/:id/handover', confirmHandover);

export default router;
