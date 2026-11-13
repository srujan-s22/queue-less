import { connectWorkerDatabase, disconnectWorkerDatabase } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';
import { runLateFeeScan } from './jobs/lateFeeScanner';

const startWorker = async () => {
  try {
    logger.info('Starting QueueLess Background Worker Engine...');
    await connectWorkerDatabase();

    logger.info(`Late fee deadline scanner scheduled every ${env.POLL_INTERVAL_MS}ms.`);

    // Run initial scan immediately on startup
    await runLateFeeScan();

    // Schedule recurring scan interval
    const intervalHandle = setInterval(runLateFeeScan, env.POLL_INTERVAL_MS);

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Stopping worker gracefully...`);
      clearInterval(intervalHandle);
      await disconnectWorkerDatabase();
      logger.info('QueueLess Background Worker terminated cleanly.');
      process.exit(0);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal error during background worker startup', error);
    process.exit(1);
  }
};

startWorker();
