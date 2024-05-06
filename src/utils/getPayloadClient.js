import dotenv from 'dotenv';
import path from 'path';
import payload from 'payload';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

let cached = global.payload;

if (!cached) {
  cached = global.payload = { client: null, promise: null };
}

export const getPayloadClient = async () => {
  if (!process.env.DATABASE_URI) {
    throw new Error('DATABASE_URI environment variable is missing');
  }
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET environment variable is missing');
  }
  if (cached.client) {
    return cached.client;
  }
  if (!cached.promise) {
    cached.promise = payload.init({
      mongoURL: process.env.DATABASE_URI,
      secret: process.env.PAYLOAD_SECRET,
      local: true,
    });
  }
  try {
    cached.client = await cached.promise;
    return cached.client;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};