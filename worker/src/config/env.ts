import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/queueless',
  POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS || '15000', 10),
  IS_TEST: process.env.NODE_ENV === 'test',
};
