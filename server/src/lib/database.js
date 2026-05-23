import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI is not set. Transcription history will not be saved.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB connection failed. The API will continue without history storage.');
    console.warn(error.message);
  }
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
