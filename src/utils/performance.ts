import React from 'react';
import type { ComponentType } from 'react';
import winston from 'winston';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
  success: boolean;
  metadata?: Record<string, any>;
}

// Create a custom logger instance for performance monitoring
const perfLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'performance.log' })
  ]
});

class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly METRICS_LIMIT = 1000;
  private static slowThreshold = 1000; // 1 second

  /**
   * Start timing an operation
   */
  static startOperation(operation: string, metadata?: Record<string, any>): PerformanceMetrics {
    const metric: PerformanceMetrics = {
      startTime: Date.now(),
      operation,
      success: false,
      metadata
    };
    
    this.metrics.push(metric);
    
    // Maintain metrics limit
    if (this.metrics.length > this.METRICS_LIMIT) {
      this.metrics = this.metrics.slice(-this.METRICS_LIMIT);
    }
    
    return metric;
  }

  /**
   * End timing an operation
   */
  static endOperation(metric: PerformanceMetrics, success: boolean = true) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;

    // Log slow operations
    if (metric.duration > this.slowThreshold) {
      perfLogger.warn('Slow operation detected', {
        operation: metric.operation,
        duration: metric.duration,
        metadata: metric.metadata
      });
    }

    // Log failed operations
    if (!success) {
      perfLogger.error('Failed operation', {
        operation: metric.operation,
        duration: metric.duration,
        metadata: metric.metadata
      });
    }
  }

  /**
   * Get performance metrics summary
   */
  static getMetricsSummary() {
    const summary = {
      totalOperations: this.metrics.length,
      successfulOperations: 0,
      failedOperations: 0,
      slowOperations: 0,
      averageDuration: 0,
      p95Duration: 0,
      p99Duration: 0
    };

    const durations: number[] = [];
    
    this.metrics.forEach(metric => {
      if (metric.success) summary.successfulOperations++;
      else summary.failedOperations++;
      
      if (metric.duration) {
        durations.push(metric.duration);
        if (metric.duration > this.slowThreshold) {
          summary.slowOperations++;
        }
      }
    });

    if (durations.length > 0) {
      summary.averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      durations.sort((a, b) => a - b);
      const p95Index = Math.floor(durations.length * 0.95);
      const p99Index = Math.floor(durations.length * 0.99);
      summary.p95Duration = durations[p95Index];
      summary.p99Duration = durations[p99Index];
    }

    return summary;
  }

  /**
   * Set slow operation threshold
   */
  static setSlowThreshold(threshold: number) {
    this.slowThreshold = threshold;
  }

  /**
   * Clear metrics
   */
  static clearMetrics() {
    this.metrics = [];
  }

  /**
   * Performance monitoring decorator
   */
  static monitor() {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const metric = PerformanceMonitor.startOperation(
          `${target.constructor.name}.${propertyKey}`,
          { args }
        );

        try {
          const result = await originalMethod.apply(this, args);
          PerformanceMonitor.endOperation(metric, true);
          return result;
        } catch (error) {
          PerformanceMonitor.endOperation(metric, false);
          throw error;
        }
      };

      return descriptor;
    };
  }
}

/**
 * Higher-order component for performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  operationName?: string
) {
  const displayName = operationName || WrappedComponent.displayName || WrappedComponent.name;
  
  return class PerformanceWrapper extends React.Component<P> {
    static displayName = `WithPerformance(${displayName})`;
    private metric: PerformanceMetrics | null = null;

    componentDidMount() {
      this.metric = PerformanceMonitor.startOperation(displayName);
    }

    componentWillUnmount() {
      if (this.metric) {
        PerformanceMonitor.endOperation(this.metric);
      }
    }

    render() {
      return React.createElement(WrappedComponent, this.props);
    }
  };
}

export default PerformanceMonitor;