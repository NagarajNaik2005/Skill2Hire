import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (): Promise<void> => {
  const uri = (ENV.MONGODB_URI || '').trim();

  // If no Atlas URI is provided in .env, notify cleanly without throwing connection error dumps
  if (!uri || uri === 'mongodb://localhost:27017/skill2hire') {
    console.log(`\nℹ️  [MongoDB Status]: Running in offline/demo mode (No remote Atlas URI provided in .env).`);
    console.log(`👉 To connect to MongoDB Atlas Cloud:`);
    console.log(`   1. Open the '.env' file in your project.`);
    console.log(`   2. Set your Atlas connection string:`);
    console.log(`      MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/skill2hire?retryWrites=true&w=majority`);
    console.log(`   3. Ensure '0.0.0.0/0' is whitelisted in MongoDB Atlas Network Access.`);
    console.log(`   (Note: Resume Builder, Resume Tailor, Tech News, and Career Radar are fully functional!)\n`);
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`🍃 [MongoDB Atlas] Successfully connected to database: "${conn.connection.name}" at ${conn.connection.host}`);
  } catch (error: any) {
    console.error('\n❌ [MongoDB Atlas] Connection Error:', error.message || error);
    console.error('👉 Please verify your username, password, database name, and IP Whitelist (0.0.0.0/0) in MongoDB Atlas.\n');
  }
};
