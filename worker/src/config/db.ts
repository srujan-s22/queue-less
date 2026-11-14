import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export const connectWorkerDatabase = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);

    mongoose.connection.on('disconnected', () => {
      logger.warn('Worker MongoDB connection lost. Mongoose will attempt reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Worker MongoDB connection re-established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Worker MongoDB connection error', err);
    });

    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`Worker connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error('Worker failed to connect to MongoDB', error);
    process.exit(1);
  }
};

export const disconnectWorkerDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Worker disconnected from MongoDB');
  } catch (error) {
    logger.error('Error during worker database disconnection', error);
  }
};
