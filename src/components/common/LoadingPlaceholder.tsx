import React from 'react';

interface LoadingPlaceholderProps {
  height?: string;
  width?: string;
  message?: string;
  isLoading: boolean;
  children?: React.ReactNode;
}

/**
 * A loading placeholder component that shows a shimmer effect
 * when data is loading, then displays children when finished
 */
const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  height = '20px',
  width = '100%',
  message = 'Loading data...',
  isLoading,
  children
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="animate-pulse">
      <div 
        className="bg-gray-200 rounded"
        style={{ height, width }}
      ></div>
      <div className="text-sm text-gray-500 mt-2">{message}</div>
    </div>
  );
};

export default LoadingPlaceholder;