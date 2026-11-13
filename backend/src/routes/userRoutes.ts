import { Router } from 'express';
import { updateProfile, topupWallet } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateProfileSchema, walletTopupSchema } from '../validators';

const router = Router();

router.patch('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);
router.post('/wallet/topup', authenticate, validateRequest(walletTopupSchema), topupWallet);

export default router;
