# Authentication System Guide

## Overview
This guide explains the authentication system we built for your AI-Powered Team Collaboration app.

---

## 🔐 Key Concepts

### 1. **Password Hashing (bcryptjs)**
- **What**: Converting plain text passwords into irreversible hashes
- **Why**: Never store plain passwords. If database is compromised, passwords remain safe
- **How**: `bcryptjs` uses salt + hashing algorithm
- **Example**:
  ```
  Plain password: "myPassword123"
  Hashed: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm"
  ```

### 2. **JWT Tokens (jsonwebtoken)**
- **What**: JSON Web Tokens - a way to securely transmit user info
- **Why**: Stateless authentication (no need to store sessions on server)
- **How**: Token contains encoded user ID + expiration time
- **Structure**: `header.payload.signature`
- **Lifespan**: 7 days (configurable)

### 3. **Authentication Flow**

#### Signup Flow:
```
1. User submits: name, email, password, confirmPassword
2. Validate inputs (all fields present, passwords match, strong password)
3. Check if email already exists
4. Hash password using bcrypt
5. Store user in database with hashed password
6. Generate JWT token
7. Return user data + token to client
```

#### Login Flow:
```
1. User submits: email, password
2. Find user by email in database
3. Compare submitted password with stored hashed password
4. If match: Generate JWT token
5. Return user data + token to client
6. If no match: Return "Invalid credentials" error
```

#### Protected Route Flow:
```
1. Client sends request with Authorization header: "Bearer <token>"
2. Middleware extracts token
3. Verify token signature and expiration
4. Extract userId from token
5. Attach userId to request object
6. Allow route handler to execute
```

---

## 📁 File Structure

```
src/
├── index.ts                    # Main server file
├── services/
│   └── authService.ts         # Password hashing & JWT logic
├── routes/
│   └── authRoutes.ts          # Signup & Login endpoints
├── middleware/
│   └── authMiddleware.ts      # Token verification middleware
└── lib/
    └── prisma.ts             # Database client
```

---

## 🚀 How to Use

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Signup
**Request:**
```bash
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-05-14T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Test Login
**Request:**
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-05-14T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Test Protected Route
**Request:**
```bash
GET http://localhost:3000/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "This is a protected route",
  "userId": "uuid-here"
}
```

---

## 🛡️ Security Best Practices Implemented

1. ✅ **Password Hashing**: Passwords are hashed with bcrypt (10 rounds)
2. ✅ **JWT Expiration**: Tokens expire after 7 days
3. ✅ **No Password in Response**: We never send passwords back to client
4. ✅ **Vague Error Messages**: "Invalid email or password" (don't reveal if email exists)
5. ✅ **Environment Variables**: JWT secret stored in .env (not in code)
6. ✅ **Input Validation**: Check for required fields and password strength

---

## 🔧 How to Protect Routes

To make a route require authentication, use the `authMiddleware`:

```typescript
import { authMiddleware } from './middleware/authMiddleware';

// This route requires valid JWT token
app.get('/protected-route', authMiddleware, (req, res) => {
  // req.userId is available here
  res.json({ userId: req.userId });
});
```

---

## 📚 Learning Points

### What is Hashing?
- One-way encryption: `hash(password)` → hash, but `hash` ↛ password
- Same password always produces same hash
- Different passwords produce different hashes
- Even tiny password change produces completely different hash

### What is JWT?
- Stateless: Server doesn't store tokens, just verifies them
- Self-contained: Token includes user info (userId)
- Secure: Signed with secret key (only server knows)
- Expiring: Token becomes invalid after set time

### Why Not Store Sessions?
- **Sessions**: Server stores user data in memory/database
- **JWT**: Token contains user data, server just verifies signature
- **Benefit**: Scales better, no database lookup needed for every request

---

## 🐛 Common Issues & Solutions

### Issue: "JWT_SECRET is not defined"
**Solution**: Add `JWT_SECRET` to your `.env` file

### Issue: "Email already registered"
**Solution**: Use a different email or login with existing account

### Issue: "Invalid or expired token"
**Solution**: 
- Token expired (7 days passed) → Login again
- Token malformed → Check Authorization header format
- Token tampered → Use original token from login

### Issue: "Passwords do not match"
**Solution**: Ensure `password` and `confirmPassword` are identical

---

## 🎯 Next Steps

1. **Add Email Verification**: Send confirmation email before account activation
2. **Add Password Reset**: Allow users to reset forgotten passwords
3. **Add Refresh Tokens**: Implement token refresh without re-login
4. **Add Role-Based Access**: Admin, user, moderator roles
5. **Add Rate Limiting**: Prevent brute force attacks
6. **Add Logging**: Track authentication events

---

## 📖 Resources

- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [JWT Introduction](https://jwt.io/introduction)
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
