import { describe, expect, it } from '@jest/globals';
import { getStatusColor, MedicationStatus } from '../medicationUtils';

describe('medicationUtils', () => {
  describe('getStatusColor', () => {
    it('returns correct classes for active status', () => {
      expect(getStatusColor('active')).toBe('bg-green-100 text-green-800');
    });

    it('returns correct classes for discontinued status', () => {
      expect(getStatusColor('discontinued')).toBe('bg-red-100 text-red-800');
    });

    it('returns correct classes for completed status', () => {
      expect(getStatusColor('completed')).toBe('bg-gray-100 text-gray-800');
    });

    it('returns default classes for invalid status', () => {
      // @ts-expect-error Testing invalid status
      expect(getStatusColor('invalid')).toBe('bg-gray-100 text-gray-600');
    });
  });
});