import { logger } from './logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  source?: string;
  timestamp?: string;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error implements CustomError {
  statusCode: number;
  code: string;
  source: string;
  timestamp: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', source = 'server') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.source = source;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database error handler
 */
export const handleDBError = (error: any): CustomError => {
  logger.error('Database error:', error);

  const customError: CustomError = new AppError(
    'Database operation failed',
    500,
    'DB_ERROR',
    'database'
  );

  if (error.code === '23505') { // Unique violation
    customError.message = 'Duplicate entry found';
    customError.statusCode = 409;
    customError.code = 'DUPLICATE_ENTRY';
  } else if (error.code === '23503') { // Foreign key violation
    customError.message = 'Referenced record not found';
    customError.statusCode = 404;
    customError.code = 'FOREIGN_KEY_VIOLATION';
  } else if (error.code === '42P01') { // Undefined table
    customError.message = 'Table not found';
    customError.statusCode = 500;
    customError.code = 'TABLE_NOT_FOUND';
  }

  return customError;
};

/**
 * Validation error handler
 */
export const handleValidationError = (error: any): CustomError => {
  logger.error('Validation error:', error);
  
  return new AppError(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    'validation'
  );
};

/**
 * Authentication error handler
 */
export const handleAuthError = (error: any): CustomError => {
  logger.error('Authentication error:', error);
  
  return new AppError(
    'Authentication failed',
    401,
    'AUTH_ERROR',
    'auth'
  );
};

/**
 * Generic error handler
 */
export const handleError = (error: any): CustomError => {
  logger.error('Unhandled error:', error);

  if (error instanceof AppError) {
    return error;
  }

  if (error.name === 'ValidationError') {
    return handleValidationError(error);
  }

  if (error.name === 'UnauthorizedError') {
    return handleAuthError(error);
  }

  if (error.code && error.code.startsWith('2')) {
    return handleDBError(error);
  }

  return new AppError(
    'An unexpected error occurred',
    500,
    'INTERNAL_ERROR',
    'server'
  );
};

/**
 * Error response formatter
 */
export const formatErrorResponse = (error: CustomError) => {
  return {
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      statusCode: error.statusCode || 500,
      timestamp: error.timestamp || new Date().toISOString(),
      source: error.source || 'server'
    }
  };
};