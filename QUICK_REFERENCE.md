# Auth System - Quick Reference Card

## 🚀 Start Server
```bash
npm install
npm run dev
```

---

## 📝 API Endpoints

### Signup
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

### Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Route
```bash
GET http://localhost:3000/profile
Authorization: Bearer <token_from_login>
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/services/authService.ts` | Password hashing & JWT logic |
| `src/routes/authRoutes.ts` | Signup & login endpoints |
| `src/middleware/authMiddleware.ts` | Token verification |
| `src/index.ts` | Main server file |

---

## 🛡️ How to Protect Routes

```typescript
import { authMiddleware } from './middleware/authMiddleware';

app.get('/protected', authMiddleware, (req, res) => {
  console.log(req.userId); // User ID from token
  res.json({ userId: req.userId });
});
```

---

## 🔐 Security Checklist

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens expire in 7 days
- ✅ Passwords never sent in responses
- ✅ Vague error messages
- ✅ Secrets in .env file
- ✅ Input validation

---

## 📊 Database

```sql
-- View all users
SELECT id, name, email, created_at FROM users;

-- Check if password is hashed
SELECT id, email, password FROM users LIMIT 1;
```

---

## 🧪 Test Cases

| Test | Command |
|------|---------|
| Signup | `POST /auth/signup` with valid data |
| Login | `POST /auth/login` with correct credentials |
| Protected | `GET /profile` with valid token |
| No Token | `GET /profile` without Authorization header |
| Bad Token | `GET /profile` with invalid token |

---

## ❌ Common Errors

| Error | Solution |
|-------|----------|
| "All fields are required" | Provide name, email, password, confirmPassword |
| "Passwords do not match" | Ensure password === confirmPassword |
| "Password must be at least 6 characters" | Use stronger password |
| "Email already registered" | Use different email |
| "Invalid email or password" | Check credentials |
| "No token provided" | Add Authorization header |
| "Invalid or expired token" | Login again to get new token |

---

## 🎯 What Each Function Does

### authService.ts

```typescript
// Hash password before storing
const hashed = await hashPassword("myPassword");

// Compare password during login
const isValid = await comparePassword("myPassword", hashed);

// Create token after login
const token = generateToken(userId);

// Verify token from client
const decoded = verifyToken(token); // { userId }
```

### authMiddleware.ts

```typescript
// Automatically:
// 1. Extract token from Authorization header
// 2. Verify token signature
// 3. Extract userId
// 4. Attach to req.userId
// 5. Call next middleware/route
```

---

## 📦 Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai-teamcollab?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
```

---

## 🔄 Authentication Flow

```
1. User signs up
   ↓
2. Password hashed with bcrypt
   ↓
3. User stored in database
   ↓
4. JWT token generated
   ↓
5. Token sent to client
   ↓
6. Client sends token with future requests
   ↓
7. Server verifies token
   ↓
8. Request allowed if token valid
```

---

## 💾 Database Schema

```prisma
model User {
  id         String   @id @default(uuid())
  name       String
  email      String   @unique
  password   String   // Hashed password
  created_at DateTime @default(now())
}
```

---

## 🧠 Key Concepts

| Concept | Meaning |
|---------|---------|
| **Hash** | One-way encryption of password |
| **Salt** | Random data added before hashing |
| **JWT** | Token containing user info + signature |
| **Bearer** | Token sent in Authorization header |
| **Middleware** | Function that runs before route handler |
| **Payload** | Data inside JWT token |
| **Signature** | Proof token wasn't tampered |

---

## 📚 Documentation

- `AUTH_GUIDE.md` - Learn concepts
- `TESTING.md` - Test examples
- `ARCHITECTURE.md` - Visual diagrams
- `IMPLEMENTATION_SUMMARY.md` - Full summary

---

## 🚨 Remember

1. **Never store plain passwords** - Always hash
2. **Never send passwords back** - Only send user data
3. **Keep JWT_SECRET secret** - Store in .env
4. **Use HTTPS in production** - Protect tokens in transit
5. **Validate all inputs** - Check before processing
6. **Use vague errors** - Don't reveal if email exists

---

## 🎓 Learning Path

1. Read `AUTH_GUIDE.md` - Understand concepts
2. Read `ARCHITECTURE.md` - See visual flows
3. Read code comments - Understand implementation
4. Test with `TESTING.md` - Try examples
5. Experiment - Modify and test

---

## 🔗 Useful Links

- [bcryptjs Docs](https://www.npmjs.com/package/bcryptjs)
- [JWT.io](https://jwt.io) - Decode tokens
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Prisma Docs](https://www.prisma.io/docs/)

---

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Can signup with valid data
- [ ] Can login with correct credentials
- [ ] Token returned from login
- [ ] Can access protected route with token
- [ ] Cannot access protected route without token
- [ ] Password is hashed in database
- [ ] Token expires after 7 days

---

## 🎯 Next Steps

1. **Test everything** - Use TESTING.md
2. **Understand the code** - Read comments
3. **Add features** - Email verification, password reset
4. **Deploy** - Use different JWT_SECRET in production
5. **Monitor** - Log auth events

---

## 💬 Quick Help

**Q: How do I protect a route?**
A: Use `authMiddleware` on the route

**Q: How do I get the user ID?**
A: Use `req.userId` in protected routes

**Q: How long is token valid?**
A: 7 days from creation

**Q: Can I change token expiration?**
A: Yes, edit `generateToken()` in authService.ts

**Q: How do I logout?**
A: Delete token on client (no server action needed)

**Q: Can I use this in production?**
A: Yes, but change JWT_SECRET and use HTTPS

---

## 🎉 You're All Set!

Your authentication system is ready to use. Start with testing, then integrate into your app.

Happy coding! 🚀
