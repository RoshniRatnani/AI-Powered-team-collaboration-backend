# Testing Auth APIs

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm run dev
```

You should see:
```
✅ Server running on http://localhost:3000
📝 Try POST http://localhost:3000/auth/signup
🔐 Try POST http://localhost:3000/auth/login
```

---

## Testing with cURL (Command Line)

### Test Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-05-14T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MTU3NjU0MDAsImV4cCI6MTcxNjM3MDIwMH0.abc123..."
}
```

### Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-05-14T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MTU3NjU0MDAsImV4cCI6MTcxNjM3MDIwMH0.abc123..."
}
```

### Test Protected Route (with token)
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MTU3NjU0MDAsImV4cCI6MTcxNjM3MDIwMH0.abc123..."
```

**Expected Response:**
```json
{
  "message": "This is a protected route",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Testing with Postman

### Setup
1. Open Postman
2. Create a new collection called "Auth API"

### Request 1: Signup
- **Method**: POST
- **URL**: `http://localhost:3000/auth/signup`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePass123",
  "confirmPassword": "securePass123"
}
```

### Request 2: Login
- **Method**: POST
- **URL**: `http://localhost:3000/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "jane@example.com",
  "password": "securePass123"
}
```

**Save the token from response** (you'll need it for next request)

### Request 3: Access Protected Route
- **Method**: GET
- **URL**: `http://localhost:3000/profile`
- **Headers**: 
  - `Authorization: Bearer <paste_token_here>`

---

## Error Test Cases

### Test 1: Signup with Missing Fields
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com"
  }'
```
**Expected**: `400 - All fields are required`

### Test 2: Signup with Mismatched Passwords
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password456"
  }'
```
**Expected**: `400 - Passwords do not match`

### Test 3: Signup with Weak Password
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "123",
    "confirmPassword": "123"
  }'
```
**Expected**: `400 - Password must be at least 6 characters`

### Test 4: Signup with Duplicate Email
```bash
# First signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "duplicate@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Try signup again with same email
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane",
    "email": "duplicate@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```
**Expected**: `409 - Email already registered`

### Test 5: Login with Wrong Password
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```
**Expected**: `401 - Invalid email or password`

### Test 6: Access Protected Route Without Token
```bash
curl -X GET http://localhost:3000/profile
```
**Expected**: `401 - No token provided`

### Test 7: Access Protected Route with Invalid Token
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer invalid_token_here"
```
**Expected**: `401 - Invalid or expired token`

---

## Database Verification

### Check Users in Database
```bash
# Connect to PostgreSQL
psql -U postgres -d ai-teamcollab

# View all users
SELECT id, name, email, created_at FROM users;

# View user with hashed password (don't display in production!)
SELECT id, name, email, password FROM users WHERE email = 'john@example.com';
```

---

## What to Look For

✅ **Signup Success**:
- User created in database
- Password is hashed (not plain text)
- Token is returned
- Response includes user data (no password)

✅ **Login Success**:
- Correct password returns token
- Wrong password returns 401 error
- Token can be used to access protected routes

✅ **Protected Routes**:
- Valid token grants access
- Invalid/missing token returns 401
- userId is correctly extracted from token

---

## Debugging Tips

### Check Server Logs
Watch the terminal where you ran `npm run dev` for:
- Request logs
- Error messages
- Database queries

### Check Database
```bash
psql -U postgres -d ai-teamcollab
SELECT * FROM users;
```

### Verify Token
Use [jwt.io](https://jwt.io) to decode your token:
1. Copy the token from login response
2. Paste in jwt.io
3. Verify the payload contains your userId
4. Check expiration time

### Common Issues

**Issue**: "Cannot find module"
- **Solution**: Run `npm install` to install dependencies

**Issue**: "Connection refused" to database
- **Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

**Issue**: "JWT_SECRET is not defined"
- **Solution**: Add JWT_SECRET to .env file

**Issue**: "Email already registered" on first signup
- **Solution**: Use a different email or check database for existing users
