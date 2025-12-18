/**
 * MongoDB Memory Server Utility
 *
 * Provides in-memory MongoDB instance for integration tests.
 * Ensures tests run in isolation without affecting real databases.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

/**
 * Start MongoDB Memory Server and connect mongoose
 */
export async function startMongoMemoryServer(): Promise<string> {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  return uri;
}

/**
 * Stop MongoDB Memory Server and disconnect mongoose
 */
export async function stopMongoMemoryServer(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Clear all collections in the test database
 */
export async function clearDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Get the MongoDB URI for the memory server
 */
export function getMongoUri(): string {
  return mongoServer?.getUri() || '';
}
