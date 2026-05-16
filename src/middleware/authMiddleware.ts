import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';

/**
 * Extend Express Request type to include userId
 * This allows us to access req.userId in protected routes
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT token and extracts user ID
 * Use this on routes that require authentication
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Step 1: Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Step 2: Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Step 3: Verify token and extract userId
    const decoded = verifyToken(token);

    // Step 4: Attach userId to request object for use in route handlers
    req.userId = decoded.userId;

    // Step 5: Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
