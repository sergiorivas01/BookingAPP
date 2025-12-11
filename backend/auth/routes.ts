/**
 * Authentication Routes
 */

import { Router, Request, Response } from 'express';
import passport from 'passport';
import { User } from './types';

export function createAuthRoutes() {
  const router = Router();

  /**
   * Initiate OAuth 2.0 login
   * GET /auth/login
   */
  router.get('/login', passport.authenticate('oauth2', { scope: ['openid', 'profile', 'email'] }));

  /**
   * OAuth 2.0 callback
   * GET /auth/callback
   */
  router.get(
    '/callback',
    passport.authenticate('oauth2', { failureRedirect: '/auth/failure' }),
    (req: Request, res: Response) => {
      // Successful authentication
      // Redirect to frontend or return success
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/success`);
    }
  );

  /**
   * Logout
   * POST /auth/logout
   */
  router.post('/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout', message: err.message });
      }

      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ error: 'Failed to destroy session', message: sessionErr.message });
        }

        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  });

  /**
   * Get current user
   * GET /auth/me
   */
  router.get('/me', (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as User;
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: user.provider,
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  /**
   * Check authentication status
   * GET /auth/status
   */
  router.get('/status', (req: Request, res: Response) => {
    res.json({
      authenticated: req.isAuthenticated(),
      user: req.isAuthenticated() && req.user ? {
        id: (req.user as User).id,
        email: (req.user as User).email,
        name: (req.user as User).name,
      } : null,
    });
  });

  /**
   * Authentication failure redirect
   * GET /auth/failure
   */
  router.get('/failure', (req: Request, res: Response) => {
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Unable to authenticate with OAuth provider',
    });
  });

  return router;
}

