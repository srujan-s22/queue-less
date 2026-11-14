import fs from 'fs';
import mongoose from 'mongoose';
import { processOverdueOrders } from '../services/lateFeeService';
import { logger } from '../config/logger';

let isRunning = false;
const HEARTBEAT_FILE = '/tmp/worker-heartbeat';

export const runLateFeeScan = async (): Promise<void> => {
  if (isRunning) {
    logger.warn('Previous scan cycle still active. Skipping this tick to prevent overlap.');
    return;
  }

  // Ensure MongoDB is actively connected before scanning
  if (mongoose.connection.readyState !== 1) {
    logger.warn('MongoDB is not in connected state. Skipping scan cycle and withholding heartbeat.');
    return;
  }

  isRunning = true;
  try {
    const processed = await processOverdueOrders();
    if (processed > 0) {
      logger.info(`Scan cycle completed: Successfully processed ${processed} late order(s).`);
    }

    // Touch heartbeat file strictly on successful cycle with active DB connection
    try {
      fs.writeFileSync(
        HEARTBEAT_FILE,
        JSON.stringify({
          timestamp: Date.now(),
          status: 'healthy',
          db: 'connected',
          lastProcessed: processed,
        })
      );
    } catch (fsErr) {
      logger.warn('Could not update heartbeat file', fsErr);
    }
  } catch (error) {
    logger.error('Error encountered during late fee scan cycle', error);
  } finally {
    isRunning = false;
  }
};
