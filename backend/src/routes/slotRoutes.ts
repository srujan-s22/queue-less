import { Router } from 'express';
import { getSlots, getSlot, seedTodaySlots } from '../controllers/slotController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validateRequest } from '../middleware/validate';
import { slotQuerySchema } from '../validators';

const router = Router();

router.get('/', validateRequest(slotQuerySchema), getSlots);
router.get('/:id', getSlot);
router.post('/seed', authenticate, authorize('admin'), seedTodaySlots);

export default router;
