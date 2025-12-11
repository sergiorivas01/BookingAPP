/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { User } from './types';

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required',
  });
}

/**
 * Middleware to optionally get authenticated user
 * Does not fail if user is not authenticated, but adds user to request if available
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  // Just pass through, authentication is optional
  next();
}

/**
 * Get current authenticated user from request
 */
export function getCurrentUser(req: Request): User | null {
  if (req.isAuthenticated() && req.user) {
    return req.user as User;
  }
  return null;
}

