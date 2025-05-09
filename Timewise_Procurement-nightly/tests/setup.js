import { jest } from '@jest/globals';
import { pool } from '../backend/models/memberModel.js';
import NodeCache from 'node-cache';

// Mock NodeCache
jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flushAll: jest.fn(),
    clear: jest.fn()
  }));
});

// Mock PostgreSQL pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn().mockImplementation(() => ({
      query: jest.fn(),
      release: jest.fn(),
    })),
    on: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

// Global test utilities
global.createMockPool = () => ({
  query: jest.fn(),
  connect: jest.fn(),
  on: jest.fn(),
  end: jest.fn(),
});

// Mock logger to prevent console noise during tests
jest.mock('../src/utils/logger.ts', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  await pool.end();
});