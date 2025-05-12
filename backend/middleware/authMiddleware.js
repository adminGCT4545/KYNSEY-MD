const jwt = require('jsonwebtoken');
const roleModel = require('../models/roleModel');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'kynsey-md-jwt-secret-key-change-in-production';

/**
 * Authentication middleware - Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || []
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Authorization middleware - Check if user has required permission
 * @param {string} permission - Permission to check
 */
const authorize = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Superadmin bypass - always has all permissions
      if (req.user.roles.includes('superadmin')) {
        return next();
      }
      
      // Check if user has permission
      const hasPermission = await roleModel.hasPermission(req.user.id, permission);
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Role check middleware - Check if user has required role
 * @param {string|string[]} roles - Role(s) to check
 */
const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Convert single role to array
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has any of the required roles
      const userRoles = req.user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Resource ownership middleware - Check if user owns or has access to a resource
 * @param {Function} getResourceOwnerId - Function that returns the owner ID of the resource
 */
const isResourceOwner = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Get the owner ID of the resource
      const ownerId = await getResourceOwnerId(req);
      
      // Check if user is the owner
      if (req.user.id === ownerId) {
        return next();
      }
      
      // Allow admins and superadmins
      if (req.user.roles.includes('admin') || req.user.roles.includes('superadmin')) {
        return next();
      }
      
      // Otherwise, deny access
      return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Audit logging middleware - Log authentication and authorization events
 */
const auditLog = (action) => {
  return async (req, res, next) => {
    const start = Date.now();
    
    // Store the original end method to capture response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
      // Restore the original end method
      res.end = originalEnd;
      
      // Call the original end method
      res.end(chunk, encoding);
      
      // Log the authentication or authorization event
      const duration = Date.now() - start;
      const timestamp = new Date().toISOString();
      const userId = req.user ? req.user.id : 'unauthenticated';
      const method = req.method;
      const url = req.originalUrl;
      const statusCode = res.statusCode;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      // Create log entry
      const logEntry = {
        timestamp,
        action,
        userId,
        method,
        url,
        statusCode,
        duration,
        userAgent,
        ipAddress
      };
      
      // Log to console for now (in production, would log to a database or file)
      console.log(`AUTH_AUDIT: ${JSON.stringify(logEntry)}`);
    };
    
    next();
  };
};

/**
 * Rate limiter middleware - Limit requests based on IP address
 * Very simple in-memory implementation. For production, use Redis or a dedicated rate limiter.
 */
const ipRequests = new Map();
const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Initialize or clean up old requests
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, []);
    }
    
    const requests = ipRequests.get(ip);
    const validRequests = requests.filter(timestamp => timestamp > now - windowMs);
    ipRequests.set(ip, validRequests);
    
    // Check if the IP has exceeded the rate limit
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000) 
      });
    }
    
    // Add current request timestamp
    validRequests.push(now);
    ipRequests.set(ip, validRequests);
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  hasRole,
  isResourceOwner,
  auditLog,
  rateLimit
};