import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import menuRoutes from './menuRoutes';
import slotRoutes from './slotRoutes';
import orderRoutes from './orderRoutes';
import staffRoutes from './staffRoutes';
import adminRoutes from './adminRoutes';
import settingsRoutes from './settingsRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'queueless-backend',
    timestamp: new Date().toISOString(),
  });
});

// Version 1 API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/menu', menuRoutes);
router.use('/slots', slotRoutes);
router.use('/orders', orderRoutes);
router.use('/staff', staffRoutes);
router.use('/admin', adminRoutes);
router.use('/settings', settingsRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
