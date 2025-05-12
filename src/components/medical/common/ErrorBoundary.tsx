import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

type ErrorType = 'network' | 'runtime' | 'unknown';

const getErrorType = (error: Error): ErrorType => {
  if (error instanceof TypeError && error.message.includes('network')) {
    return 'network';
  }
  return 'runtime';
};

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0
  };

  private readonly maxRetries = 3;

  public override componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && this.props.resetKeys) {
      if (!prevProps.resetKeys || 
          this.props.resetKeys.some((key, i) => key !== prevProps.resetKeys?.[i])) {
        this.resetErrorBoundary();
      }
    }
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Report error to error tracking service
    this.reportError(error, errorInfo);
    
    this.props.onError?.(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Here you would typically send the error to your error tracking service
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        type: getErrorType(error)
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('Error report:', errorReport);
    // TODO: Send to error tracking service
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private getErrorMessage(error: Error): string {
    const errorType = getErrorType(error);
    
    switch (errorType) {
      case 'network':
        return 'Network error occurred. Please check your connection and try again.';
      case 'runtime':
        return error.message || 'An unexpected error occurred in the application.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.getErrorMessage(this.state.error!);
      const canRetry = this.state.errorCount < this.maxRetries;

      return (
        <div className="p-6 rounded-lg bg-red-50 border border-red-200 max-w-lg mx-auto my-8">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h2>
          </div>
          
          <div className="bg-white rounded-md p-4 mb-4">
            <p className="text-sm text-red-600 mb-2">
              {errorMessage}
            </p>
            {this.state.errorInfo && (
              <details className="mt-2">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry && (
              <button
                onClick={this.resetErrorBoundary}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
