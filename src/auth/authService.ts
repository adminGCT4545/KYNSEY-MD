import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'kynsey-md-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = 12;

// Types
export interface UserPayload {
  id: string;
  email: string;
  roles: string[];
  permissions?: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken extends UserPayload {
  iat: number;
  exp: number;
  jti: string;
}

// In-memory token blacklist (should be replaced with Redis in production)
const tokenBlacklist = new Set<string>();
const refreshTokenStore = new Map<string, { userId: string; expiresAt: number }>();

/**
 * JWT Authentication Service
 * Handles token generation, validation, and refresh operations
 */
class AuthService {
  /**
   * Generate JWT token pair (access token + refresh token)
   */
  generateTokenPair(user: UserPayload): TokenPair {
    // Generate a unique token ID
    const tokenId = uuidv4();
    
    // Create access token
    const accessToken = jwt.sign(
      { ...user, tokenType: 'access' },
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN,
        jti: tokenId 
      }
    );
    
    // Generate refresh token with longer expiration
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshExpiry = Date.now() + (parseInt(REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000);
    
    // Store refresh token
    refreshTokenStore.set(refreshToken, { 
      userId: user.id, 
      expiresAt: refreshExpiry
    });
    
    // Auto-cleanup expired refresh tokens
    this.cleanupExpiredTokens();
    
    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(JWT_EXPIRES_IN) * 1000
    };
  }
  
  /**
   * Verify JWT token and return decoded payload
   */
  verifyToken(token: string): DecodedToken | null {
    try {
      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        return null;
      }
      
      // Verify token signature and expiration
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string): TokenPair | null {
    // Check if refresh token exists and is valid
    const storedData = refreshTokenStore.get(refreshToken);
    if (!storedData) {
      return null;
    }
    
    // Check if refresh token has expired
    if (storedData.expiresAt < Date.now()) {
      refreshTokenStore.delete(refreshToken);
      return null;
    }
    
    // TODO: Fetch user data from database using storedData.userId
    // For now, we'll use a mock user
    const user: UserPayload = {
      id: storedData.userId,
      email: 'user@example.com',
      roles: ['user']
    };
    
    // Invalidate old refresh token
    refreshTokenStore.delete(refreshToken);
    
    // Generate new token pair
    return this.generateTokenPair(user);
  }
  
  /**
   * Blacklist a token (used for logout)
   */
  blacklistToken(token: string): void {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (decoded) {
        // Store the token's jti in the blacklist until its expiration
        tokenBlacklist.add(decoded.jti);
        
        // Set timeout to automatically remove from blacklist after expiration
        const expiresIn = decoded.exp * 1000 - Date.now();
        if (expiresIn > 0) {
          setTimeout(() => {
            this.removeFromBlacklist(decoded.jti);
          }, expiresIn);
        }
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }
  }
  
  /**
   * Validate user password
   */
  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  
  /**
   * Hash password for secure storage
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }
  
  /**
   * Extract token from request
   */
  extractTokenFromRequest(req: Request): string | null {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.substring(7);
    }
    return null;
  }
  
  /**
   * Check if a token is blacklisted
   */
  private isTokenBlacklisted(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      return tokenBlacklist.has(decoded.jti);
    } catch (error) {
      return true;
    }
  }
  
  /**
   * Remove token from blacklist
   */
  private removeFromBlacklist(tokenId: string): void {
    tokenBlacklist.delete(tokenId);
  }
  
  /**
   * Clean up expired refresh tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of refreshTokenStore.entries()) {
      if (data.expiresAt < now) {
        refreshTokenStore.delete(token);
      }
    }
  }
}

export default new AuthService();