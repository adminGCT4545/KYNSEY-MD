// This file is for testing fs module usage
import * as fs from 'fs';

// Export a function that uses fs.existsSync
export function testFsExistsSync(path: string): boolean {
  console.log('Testing fs.existsSync with path:', path);
  try {
    return fs.existsSync(path);
  } catch (error) {
    console.error('Error in fs.existsSync:', error);
    // Return a default value
    return false;
  }
}

// Export a mock implementation that can be used as a replacement
export function mockExistsSync(path: string): boolean {
  console.log('Mock fs.existsSync called with:', path);
  // Always return true for the mock implementation
  return true;
}

// Export an object that can be used to replace the fs module
export const mockFs = {
  existsSync: mockExistsSync,
  // Add other fs functions as needed
  readFileSync: (path: string, options?: { encoding?: string; flag?: string } | string) => {
    console.log('Mock fs.readFileSync called with:', path);
    return '';
  },
  writeFileSync: (path: string, data: any, options?: { encoding?: string; mode?: number; flag?: string } | string) => {
    console.log('Mock fs.writeFileSync called with:', path);
  }
};
