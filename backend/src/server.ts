import http from 'http';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import { initSocket } from './socket';
import { ensureDefaultMenuItems } from './services/menuService';

const startServer = async () => {
  try {
    // 1. Connect to Database & Ensure Menu
    await connectDatabase();
    await ensureDefaultMenuItems();

    // 2. Initialize Express Application
    const app = createApp();
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO Gateway
    initSocket(httpServer);

    // 4. Start HTTP Listener
    const server = httpServer.listen(env.PORT, () => {
      logger.info(`QueueLess Backend API server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Health check available at http://localhost:${env.PORT}/api/v1/health`);
    });

    // 5. Graceful Shutdown Handlers
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown after 10 seconds timeout
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal error during backend server startup', error);
    process.exit(1);
  }
};

startServer();
