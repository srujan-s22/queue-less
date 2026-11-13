import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validateRequest } from '../middleware/validate';
import { updateSettingsSchema } from '../validators';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, authorize('admin'), validateRequest(updateSettingsSchema), updateSettings);

export default router;
