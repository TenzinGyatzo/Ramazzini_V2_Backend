/**
 * Test Module Utilities
 *
 * Helpers for creating NestJS testing modules with common configurations.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

/**
 * Create a testing module with MongoDB Memory Server connection
 */
export async function createTestingModule(
  imports: any[],
  providers: any[] = [],
  mongoUri: string,
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      MongooseModule.forRoot(mongoUri),
      ...imports,
    ],
    providers,
  }).compile();
}

/**
 * Create a mock model for unit testing
 * Returns a jest mock with common Mongoose methods
 */
export function createMockModel() {
  return {
    new: jest.fn().mockResolvedValue({}),
    constructor: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
      exec: jest.fn().mockResolvedValue([]),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    exec: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
  };
}

/**
 * Create a mock provider for NOM-024 compliance utility
 */
export function createMockNom024Util(isMX: boolean = true) {
  return {
    requiresNOM024Compliance: jest.fn().mockResolvedValue(isMX),
    getProviderCountry: jest.fn().mockResolvedValue(isMX ? 'MX' : 'US'),
  };
}
