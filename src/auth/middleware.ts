import { Request, Response, NextFunction } from 'express';
import { authenticate as verifyAccessToken } from './oauth2-service'; // Assuming this service handles token verification

// Define a type for user roles (adjust as needed)
type UserRole = 'admin' | 'user' | 'guest';

// Interface for the authenticated request
interface AuthenticatedRequest extends Request {
  userId?: string;
  userRoles?: UserRole[];
  user?: any; // Type should reflect the structure of the token
}

// Middleware to authenticate requests using OAuth2 access tokens
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await verifyAccessToken(req, res, next);

    if (!req.user) {
      return res.status(403).json({ message: 'Unauthorized: User information not found in token' });
    }

    // Extract user ID and roles from the token
    req.userId = req.user.user_id;
    req.userRoles = req.user.roles;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid access token' });
  }
};

// Middleware to enforce role-based access control
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userRoles) {
      return res.status(403).json({ message: 'Unauthorized: User roles not available' });
    }

    const hasRequiredRole = allowedRoles.some(role => req.userRoles!.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Unauthorized: Insufficient privileges' });
    }

    next(); // Proceed to the next middleware or route handler
  };
};

// Middleware for session management (example using a simple session store)
const sessions: { [key: string]: { userId: string; roles: UserRole[] } } = {};

export const sessionMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const sessionId = req.cookies?.sessionId;

  if (sessionId && sessions[sessionId]) {
    // Session exists, populate user information
    req.userId = sessions[sessionId].userId;
    req.userRoles = sessions[sessionId].roles;
    next();
  } else {
    // No session, proceed to authentication
    next();
  }
};

// Function to create a new session (example)
export const createSession = (userId: string, roles: UserRole[]) => {
  const sessionId = generateSessionId(); // Implement a function to generate unique session IDs
  sessions[sessionId] = { userId, roles };
  return sessionId;
};

// Function to generate a unique session ID (example)
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15);
};