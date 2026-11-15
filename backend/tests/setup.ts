import mongoose from 'mongoose';
import { env } from '../src/config/env';

export const setupTestDb = () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const testMongoUri =
      process.env.TEST_MONGODB_URI ||
      (env.MONGODB_URI.endsWith('/queueless') ? `${env.MONGODB_URI}_test` : env.MONGODB_URI);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
};
