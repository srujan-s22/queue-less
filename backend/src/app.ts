import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import { logger } from './config/logger';
import { NotFoundError } from './utils/errors';

export const createApp = (): Application => {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. CORS Configuration
  const configuredOrigins = env.CLIENT_URL
    ? env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/+$/, ''))
    : [];
  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://queueless-frontend-murex.vercel.app',
  ];
  const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        const normalizedOrigin = origin ? origin.replace(/\/+$/, '') : '';
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        if (env.IS_PRODUCTION) {
          return callback(new Error(`Origin '${origin}' not allowed by CORS`));
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    })
  );

  // 3. Body Parsing & Cookies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 4. Request Logging (non-test environments)
  if (!env.IS_TEST) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  // 5. Root Health / Ping Route
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      service: 'QueueLess REST API Backend',
      version: '1.0.0',
      status: 'healthy',
      docs: '/api/v1/health',
    });
  });

  // 6. Mount API v1 Routes
  app.use('/api/v1', apiRoutes);

  // 7. 404 Handler for undefined routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`The requested endpoint '${req.originalUrl}' does not exist.`));
  });

  // 8. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
