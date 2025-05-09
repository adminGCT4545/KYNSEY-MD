import React from 'react';
import type { ComponentType, ErrorInfo } from 'react';
import winston from 'winston';

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorSummary {
  totalErrors: number;
  uniqueErrors: number;
  errorsByType: Record<string, number>;
  recentErrors: ErrorDetails[];
}

class ErrorTracker {
  private static errors: ErrorDetails[] = [];
  private static readonly ERROR_LIMIT = 1000;
  
  private static logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log' })
    ]
  });

  /**
   * Track a new error
   */
  static trackError(error: Error, metadata?: Record<string, any>) {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      metadata
    };

    this.errors.push(errorDetails);
    
    // Keep error list under limit
    if (this.errors.length > this.ERROR_LIMIT) {
      this.errors = this.errors.slice(-this.ERROR_LIMIT);
    }

    // Log error
    this.logger.error('Error tracked', {
      error: errorDetails,
      metadata
    });
  }

  /**
   * Track React error boundary errors
   */
  static trackReactError(error: Error, errorInfo: ErrorInfo) {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: Date.now()
    };

    this.errors.push(errorDetails);
    this.logger.error('React error tracked', errorDetails);
  }

  /**
   * Track API errors
   */
  static trackApiError(endpoint: string, error: Error, metadata?: Record<string, any>) {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        endpoint
      }
    };

    this.errors.push(errorDetails);
    this.logger.error('API error tracked', errorDetails);
  }

  /**
   * Get error summary statistics
   */
  static getErrorSummary(): ErrorSummary {
    const errorsByType: Record<string, number> = {};
    const uniqueMessages = new Set<string>();

    this.errors.forEach(error => {
      const errorType = error.message.split(':')[0];
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      uniqueMessages.add(error.message);
    });

    return {
      totalErrors: this.errors.length,
      uniqueErrors: uniqueMessages.size,
      errorsByType,
      recentErrors: this.errors.slice(-10) // Get last 10 errors
    };
  }

  /**
   * Create error boundary HOC
   */
  static withErrorBoundary<P extends object>(
    WrappedComponent: ComponentType<P>,
    FallbackComponent: ComponentType<{ error: Error }>
  ) {
    return class ErrorBoundary extends React.Component<P, { hasError: boolean; error: Error | null }> {
      constructor(props: P) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        ErrorTracker.trackReactError(error, errorInfo);
      }

      render() {
        if (this.state.hasError && this.state.error) {
          return React.createElement(FallbackComponent, { error: this.state.error });
        }

        return React.createElement(WrappedComponent, this.props);
      }
    };
  }

  /**
   * Clear error history
   */
  static clearErrors() {
    this.errors = [];
  }

  /**
   * Get recent errors
   */
  static getRecentErrors(count: number = 10): ErrorDetails[] {
    return this.errors.slice(-count);
  }

  /**
   * Check if an error has occurred recently
   */
  static hasRecentError(timeWindow: number = 5000): boolean {
    const now = Date.now();
    return this.errors.some(error => now - error.timestamp < timeWindow);
  }

  /**
   * Create async error wrapper
   */
  static async wrapAsync<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.trackError(error instanceof Error ? error : new Error(String(error)), { context });
      throw error;
    }
  }
}

export default ErrorTracker;