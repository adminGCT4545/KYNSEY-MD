import winston from 'winston';

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console(),
  // Error log file transport
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Combined log file transport
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Create the logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
});

// If we're not in production, log to console with simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Create performance logger
const perfLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/performance.log' })
  ]
});

// Performance logging functions
export const logPerformance = {
  start: (operationName) => {
    const startTime = process.hrtime();
    return {
      end: () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        perfLogger.info({
          operation: operationName,
          duration_ms: duration.toFixed(3),
          timestamp: new Date().toISOString()
        });
        return duration;
      }
    };
  }
};

export const logApiCall = (method, path, duration, statusCode) => {
  logger.http(`${method} ${path} - ${statusCode} - ${duration.toFixed(2)}ms`);
};

export const logQueryPerformance = (query, duration) => {
  perfLogger.info({
    type: 'query',
    query: query.substring(0, 200), // Truncate long queries
    duration_ms: duration.toFixed(3),
    timestamp: new Date().toISOString()
  });
};

// Export the logger directly for compatibility with existing code
export default logger;
