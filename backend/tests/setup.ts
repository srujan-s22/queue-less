import mongoose from 'mongoose';
import { env } from '../src/config/env';

export const setupTestDb = () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
};
