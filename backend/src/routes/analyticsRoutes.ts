import { Router } from 'express';
import { getAnalytics, exportCsv } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getAnalytics);
router.get('/export-csv', exportCsv);

export default router;
