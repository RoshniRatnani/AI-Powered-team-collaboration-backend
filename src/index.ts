import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);

/**
 * Example protected route
 * This route requires authentication (valid JWT token)
 * Try accessing it with: Authorization: Bearer <your_token>
 */
app.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'This is a protected route',
    userId: req.userId,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});