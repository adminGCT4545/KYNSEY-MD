import { jest } from '@jest/globals';
import React from 'react';
import { render, act } from '@testing-library/react';
import PerformanceMonitor, { withPerformanceTracking } from '../../src/utils/performance';

describe('Performance Monitor', () => {
  beforeEach(() => {
    PerformanceMonitor.clearMetrics();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Operation Tracking', () => {
    it('should track successful operations', () => {
      const metric = PerformanceMonitor.startOperation('test-operation');
      
      jest.advanceTimersByTime(100);
      PerformanceMonitor.endOperation(metric, true);

      const summary = PerformanceMonitor.getMetricsSummary();
      expect(summary.totalOperations).toBe(1);
      expect(summary.successfulOperations).toBe(1);
      expect(summary.failedOperations).toBe(0);
    });

    it('should track failed operations', () => {
      const metric = PerformanceMonitor.startOperation('test-operation');
      
      jest.advanceTimersByTime(100);
      PerformanceMonitor.endOperation(metric, false);

      const summary = PerformanceMonitor.getMetricsSummary();
      expect(summary.totalOperations).toBe(1);
      expect(summary.successfulOperations).toBe(0);
      expect(summary.failedOperations).toBe(1);
    });

    it('should detect slow operations', () => {
      PerformanceMonitor.setSlowThreshold(50);
      const metric = PerformanceMonitor.startOperation('slow-operation');
      
      jest.advanceTimersByTime(100);
      PerformanceMonitor.endOperation(metric, true);

      const summary = PerformanceMonitor.getMetricsSummary();
      expect(summary.slowOperations).toBe(1);
    });

    it('should maintain metrics limit', () => {
      const METRICS_LIMIT = 1000;
      
      for (let i = 0; i < METRICS_LIMIT + 10; i++) {
        const metric = PerformanceMonitor.startOperation(`operation-${i}`);
        PerformanceMonitor.endOperation(metric);
      }

      const summary = PerformanceMonitor.getMetricsSummary();
      expect(summary.totalOperations).toBe(METRICS_LIMIT);
    });
  });

  describe('Performance Decorator', () => {
    class TestClass {
      @PerformanceMonitor.monitor()
      async testMethod() {
        return new Promise(resolve => setTimeout(resolve, 100));
      }

      @PerformanceMonitor.monitor()
      async errorMethod() {
        throw new Error('Test error');
      }
    }

    it('should track successful method execution', async () => {
      const instance = new TestClass();
      
      await instance.testMethod();
      
      const summary = PerformanceMonitor.getMetricsSummary();
      expect(summary.successfulOperations).toBe(1);
    });

    it('should track failed method execution', async () => {
      const instance = new TestClass();
      
      try {
        await instance.errorMethod();
      } catch (error) {
        expect(error.message).toBe('Test error');
      }
      
      const summary = PerformanceMonitor.getMetricsSummary();
      expect(summary.failedOperations).toBe(1);
    });
  });

  describe('React Component Performance Tracking', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withPerformanceTracking(TestComponent, 'TestComponent');

    it('should track component lifecycle', () => {
      let component;
      
      act(() => {
        component = render(<WrappedComponent />);
      });

      const summary = PerformanceMonitor.getMetricsSummary();
      expect(summary.totalOperations).toBe(1);
      
      act(() => {
        component.unmount();
      });
      
      expect(PerformanceMonitor.getMetricsSummary().successfulOperations).toBe(1);
    });
  });

  describe('Metrics Summary', () => {
    it('should calculate correct statistics', () => {
      // Create operations with different durations
      const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      
      durations.forEach(duration => {
        const metric = PerformanceMonitor.startOperation('test-operation');
        jest.advanceTimersByTime(duration);
        PerformanceMonitor.endOperation(metric);
      });

      const summary = PerformanceMonitor.getMetricsSummary();
      
      expect(summary.totalOperations).toBe(durations.length);
      expect(summary.averageDuration).toBe(55); // Average of durations
      expect(summary.p95Duration).toBe(95); // 95th percentile
      expect(summary.p99Duration).toBe(99); // 99th percentile
    });

    it('should handle empty metrics', () => {
      const summary = PerformanceMonitor.getMetricsSummary();
      
      expect(summary.totalOperations).toBe(0);
      expect(summary.averageDuration).toBe(0);
      expect(summary.p95Duration).toBe(0);
      expect(summary.p99Duration).toBe(0);
    });
  });
});