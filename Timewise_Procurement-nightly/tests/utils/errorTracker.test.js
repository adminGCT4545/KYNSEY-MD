import { jest } from '@jest/globals';
import React from 'react';
import { render, act } from '@testing-library/react';
import ErrorTracker from '../../src/utils/errorTracker';

describe('Error Tracker', () => {
  beforeEach(() => {
    ErrorTracker.clearErrors();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Error Tracking', () => {
    it('should track basic errors', () => {
      const error = new Error('Test error');
      ErrorTracker.trackError(error);

      const summary = ErrorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(1);
      expect(summary.uniqueErrors).toBe(1);
      expect(summary.recentErrors[0].message).toBe('Test error');
    });

    it('should track errors with metadata', () => {
      const error = new Error('Test error');
      const metadata = { context: 'test', userId: 123 };
      
      ErrorTracker.trackError(error, metadata);

      const recent = ErrorTracker.getRecentErrors(1);
      expect(recent[0].metadata).toEqual(metadata);
    });

    it('should maintain error limit', () => {
      const ERROR_LIMIT = 1000;
      
      for (let i = 0; i < ERROR_LIMIT + 10; i++) {
        ErrorTracker.trackError(new Error(`Error ${i}`));
      }

      const summary = ErrorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(ERROR_LIMIT);
    });
  });

  describe('React Error Boundary', () => {
    const TestComponent = () => {
      throw new Error('Test component error');
    };

    const FallbackComponent = ({ error }) => (
      <div>Error occurred: {error.message}</div>
    );

    const WrappedComponent = ErrorTracker.withErrorBoundary(
      TestComponent,
      FallbackComponent
    );

    it('should catch and track React errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      act(() => {
        render(<WrappedComponent />);
      });

      const summary = ErrorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(1);
      expect(summary.recentErrors[0].message).toBe('Test component error');
      
      consoleSpy.mockRestore();
    });
  });

  describe('API Error Tracking', () => {
    it('should track API errors with endpoint info', () => {
      const error = new Error('API error');
      const endpoint = '/api/test';
      const metadata = { status: 500 };

      ErrorTracker.trackApiError(endpoint, error, metadata);

      const recent = ErrorTracker.getRecentErrors(1);
      expect(recent[0].metadata).toEqual({
        ...metadata,
        endpoint
      });
    });
  });

  describe('Error Summary', () => {
    it('should calculate error statistics correctly', () => {
      ErrorTracker.trackError(new Error('Error:Type1'));
      ErrorTracker.trackError(new Error('Error:Type1'));
      ErrorTracker.trackError(new Error('Error:Type2'));

      const summary = ErrorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(3);
      expect(summary.uniqueErrors).toBe(2);
      expect(summary.errorsByType).toEqual({
        'Error': 3
      });
    });

    it('should track recent errors', () => {
      for (let i = 0; i < 15; i++) {
        ErrorTracker.trackError(new Error(`Error ${i}`));
      }

      const recent = ErrorTracker.getRecentErrors(10);
      expect(recent).toHaveLength(10);
      expect(recent[9].message).toBe('Error 14');
    });
  });

  describe('Async Error Wrapper', () => {
    it('should track errors in async operations', async () => {
      const failingOperation = async () => {
        throw new Error('Async error');
      };

      try {
        await ErrorTracker.wrapAsync(failingOperation, 'test-context');
      } catch (error) {
        expect(error.message).toBe('Async error');
      }

      const summary = ErrorTracker.getErrorSummary();
      expect(summary.totalErrors).toBe(1);
      expect(summary.recentErrors[0].metadata).toEqual({
        context: 'test-context'
      });
    });

    it('should pass through successful async results', async () => {
      const successOperation = async () => 'success';
      
      const result = await ErrorTracker.wrapAsync(successOperation, 'test-context');
      
      expect(result).toBe('success');
      expect(ErrorTracker.getErrorSummary().totalErrors).toBe(0);
    });
  });

  describe('Recent Error Detection', () => {
    it('should detect recent errors within time window', () => {
      ErrorTracker.trackError(new Error('Recent error'));
      
      expect(ErrorTracker.hasRecentError(1000)).toBe(true);
      
      jest.advanceTimersByTime(2000);
      expect(ErrorTracker.hasRecentError(1000)).toBe(false);
    });
  });
});