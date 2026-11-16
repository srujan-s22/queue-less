import { Router } from 'express';
import {
  getMenu,
  getMenuItem,
  createItem,
  updateItem,
  toggleAvailability,
  removeItem,
  seedMenu,
} from '../controllers/menuController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validateRequest } from '../middleware/validate';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  toggleAvailabilitySchema,
} from '../validators';

const router = Router();

router.get('/', getMenu);
router.post('/seed', authenticate, authorize('admin'), seedMenu);
router.get('/:id', getMenuItem);
router.post('/', authenticate, authorize('admin'), validateRequest(createMenuItemSchema), createItem);
router.put('/:id', authenticate, authorize('admin'), validateRequest(updateMenuItemSchema), updateItem);
router.patch(
  '/:id/availability',
  authenticate,
  authorize('staff', 'admin'),
  validateRequest(toggleAvailabilitySchema),
  toggleAvailability
);
router.delete('/:id', authenticate, authorize('admin'), removeItem);

export default router;
