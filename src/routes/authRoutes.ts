import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword, generateToken } from '../services/authService.js';

const router = express.Router();

/**
 * SIGNUP ENDPOINT
 * POST /auth/signup
 * Creates a new user account
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Step 1: Validate input
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Step 2: Validate password match
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    // Step 3: Validate password strength (at least 6 characters)
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Step 4: Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    // Step 5: Hash the password before storing
    const hashedPassword = await hashPassword(password);

    // Step 6: Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store hashed password, NOT plain text
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    // Step 7: Generate JWT token
    const token = generateToken(user.id);

    // Step 8: Return success response
    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * LOGIN ENDPOINT
 * POST /auth/login
 * Authenticates user and returns JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Step 1: Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Step 2: Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Step 3: Check if user exists
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Step 4: Compare provided password with stored hashed password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Step 5: Generate JWT token
    const token = generateToken(user.id);

    // Step 6: Return success response (don't send password back)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
