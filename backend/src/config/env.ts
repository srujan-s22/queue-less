import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const jwtSecret = process.env.JWT_SECRET || (isProduction ? '' : 'queueless_super_secret_jwt_key_2026_dev_env');
const staffAccessKey =
  process.env.STAFF_ACCESS_KEY || (isTest ? 'test_staff_access_key_2026' : 'queueless_staff_access_key_2026_dev');
const adminAccessKey =
  process.env.ADMIN_ACCESS_KEY || (isTest ? 'test_admin_access_key_2026' : 'queueless_admin_access_key_2026_dev');

if (isProduction) {
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('dev_env')) {
    console.error('FATAL ERROR: A secure JWT_SECRET of at least 32 characters must be configured in production.');
    process.exit(1);
  }
  if (!process.env.STAFF_ACCESS_KEY || process.env.STAFF_ACCESS_KEY.length < 8) {
    console.error('FATAL ERROR: STAFF_ACCESS_KEY must be configured in production (minimum 8 characters).');
    process.exit(1);
  }
  if (!process.env.ADMIN_ACCESS_KEY || process.env.ADMIN_ACCESS_KEY.length < 8) {
    console.error('FATAL ERROR: ADMIN_ACCESS_KEY must be configured in production (minimum 8 characters).');
    process.exit(1);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/queueless',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  STAFF_ACCESS_KEY: staffAccessKey,
  ADMIN_ACCESS_KEY: adminAccessKey,
  IS_PRODUCTION: isProduction,
  IS_TEST: isTest,
};
