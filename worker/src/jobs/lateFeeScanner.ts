import { processOverdueOrders } from '../services/lateFeeService';
import { logger } from '../config/logger';

let isRunning = false;

export const runLateFeeScan = async (): Promise<void> => {
  if (isRunning) {
    logger.warn('Previous scan cycle still active. Skipping this tick to prevent overlap.');
    return;
  }

  isRunning = true;
  try {
    const processed = await processOverdueOrders();
    if (processed > 0) {
      logger.info(`Scan cycle completed: Successfully processed ${processed} late order(s).`);
    }
  } catch (error) {
    logger.error('Error encountered during late fee scan cycle', error);
  } finally {
    isRunning = false;
  }
};
