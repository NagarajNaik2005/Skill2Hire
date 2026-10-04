import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[MongoDB Atlas] Successfully connected to database: ${conn.connection.name} at host: ${conn.connection.host}`);
  } catch (error) {
    console.error('[MongoDB Atlas] Connection Error:', error);
    console.error('Please ensure your MONGODB_URI in .env is configured with correct Atlas credentials and network whitelist (0.0.0.0/0).');
    // Note: Do not exit process immediately in development so developers can see descriptive errors
  }
};
