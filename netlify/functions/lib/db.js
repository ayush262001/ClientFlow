// netlify/config/db.js

import mongoose from 'mongoose';

let isConnected = false;

export const connect = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected:', conn.connection.host);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
};

export const disconnect = async () => {
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🛑 MongoDB disconnected');
  } catch (err) {
    console.error('❌ MongoDB disconnection failed:', err.message);
  }
};
