import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.IS_TEST ? 1000 : 15, // 15 attempts per minute in dev/prod
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 1 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.IS_TEST ? 5000 : 120, // 120 requests per minute
  message: {
    success: false,
    message: 'API rate limit exceeded. Please throttle requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
