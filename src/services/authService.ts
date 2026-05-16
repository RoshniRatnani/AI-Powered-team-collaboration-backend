import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Hash a plain text password using bcrypt
 * Why: We never store plain passwords. Hashing is one-way encryption.
 * @param password - Plain text password from user
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10); // Generate salt (10 rounds of hashing)
  return bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with hashed password
 * Why: During login, we compare the entered password with stored hash
 * @param password - Plain text password from login
 * @param hashedPassword - Stored hashed password from database
 * @returns true if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token for authenticated user
 * Why: Token is sent to client and used to authenticate future requests
 * @param userId - User ID to encode in token
 * @returns JWT token string
 */
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ userId }, secret, { expiresIn: '7d' }); // Token expires in 7 days
};

/**
 * Verify and decode JWT token
 * Why: When client sends token, we verify it's valid and extract user info
 * @param token - JWT token from client
 * @returns Decoded token payload with userId
 */
export const verifyToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
