# Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Signup Form     │  │  Login Form      │  │  API Request │  │
│  │  (name, email,   │  │  (email,         │  │  with Token  │  │
│  │   password)      │  │   password)      │  │              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────┘  │
│           │                     │                     │         │
└───────────┼─────────────────────┼─────────────────────┼─────────┘
            │                     │                     │
            │ POST /auth/signup   │ POST /auth/login    │ GET /profile
            │                     │                     │ + Bearer Token
            │                     │                     │
┌───────────▼─────────────────────▼─────────────────────▼─────────┐
│                    EXPRESS SERVER (Backend)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ROUTES (authRoutes.ts)                │   │
│  │                                                          │   │
│  │  POST /auth/signup ──────┐                              │   │
│  │  POST /auth/login ───────┼──→ Route Handlers            │   │
│  │  GET /profile ───────────┘                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MIDDLEWARE (authMiddleware.ts)              │   │
│  │                                                          │   │
│  │  1. Extract token from Authorization header             │   │
│  │  2. Verify token signature                              │   │
│  │  3. Extract userId from token                           │   │
│  │  4. Attach userId to request object                     │   │
│  │  5. Pass to route handler                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SERVICES (authService.ts)                   │   │
│  │                                                          │   │
│  │  hashPassword()      ──→ Hash password with bcrypt      │   │
│  │  comparePassword()   ──→ Compare plain vs hashed        │   │
│  │  generateToken()     ──→ Create JWT token               │   │
│  │  verifyToken()       ──→ Verify & decode JWT            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           PRISMA CLIENT (prisma.ts)                      │   │
│  │                                                          │   │
│  │  user.create()       ──→ Create new user                │   │
│  │  user.findUnique()   ──→ Find user by email             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────────┐
                │   PostgreSQL Database     │
                │                           │
                │  ┌─────────────────────┐  │
                │  │  users table        │  │
                │  │  ─────────────────  │  │
                │  │  id (UUID)          │  │
                │  │  name (String)      │  │
                │  │  email (String)     │  │
                │  │  password (String)  │  │
                │  │  created_at (Date)  │  │
                │  └─────────────────────┘  │
                │                           │
                └───────────────────────────┘
```

---

## Signup Flow (Detailed)

```
CLIENT                          SERVER                          DATABASE
  │                               │                               │
  │─── POST /auth/signup ────────→│                               │
  │     {name, email,             │                               │
  │      password,                │                               │
  │      confirmPassword}          │                               │
  │                               │                               │
  │                        ┌──────▼──────┐                        │
  │                        │ Validate    │                        │
  │                        │ - All fields │                        │
  │                        │ - Passwords  │                        │
  │                        │   match      │                        │
  │                        │ - Password   │                        │
  │                        │   strength   │                        │
  │                        └──────┬──────┘                        │
  │                               │                               │
  │                        ┌──────▼──────────────────────────────→│
  │                        │ Check if email exists                │
  │                        │ SELECT * FROM users WHERE email=?    │
  │                        │←──────────────────────────────────────│
  │                        │ (returns null if not found)           │
  │                        │                                       │
  │                        ┌──────▼──────┐                        │
  │                        │ Hash        │                        │
  │                        │ password    │                        │
  │                        │ using       │                        │
  │                        │ bcrypt      │                        │
  │                        └──────┬──────┘                        │
  │                               │                               │
  │                        ┌──────▼──────────────────────────────→│
  │                        │ Create user                          │
  │                        │ INSERT INTO users                    │
  │                        │ (id, name, email, password)          │
  │                        │←──────────────────────────────────────│
  │                        │ (returns created user)                │
  │                        │                                       │
  │                        ┌──────▼──────┐                        │
  │                        │ Generate    │                        │
  │                        │ JWT token   │                        │
  │                        │ (userId +   │                        │
  │                        │  expiry)    │                        │
  │                        └──────┬──────┘                        │
  │                               │                               │
  │←─ 201 Created ────────────────│                               │
  │   {user, token}               │                               │
  │                               │                               │
```

---

## Login Flow (Detailed)

```
CLIENT                          SERVER                          DATABASE
  │                               │                               │
  │─── POST /auth/login ─────────→│                               │
  │     {email, password}          │                               │
  │                               │                               │
  │                        ┌──────▼──────┐                        │
  │                        │ Validate    │                        │
  │                        │ - Email     │                        │
  │                        │ - Password  │                        │
  │                        │   provided  │                        │
  │                        └──────┬──────┘                        │
  │                               │                               │
  │                        ┌──────▼──────────────────────────────→│
  │                        │ Find user by email                   │
  │                        │ SELECT * FROM users WHERE email=?    │
  │                        │←──────────────────────────────────────│
  │                        │ (returns user with hashed password)   │
  │                        │                                       │
  │                        ┌──────▼──────┐                        │
  │                        │ Compare     │                        │
  │                        │ passwords   │                        │
  │                        │ using       │                        │
  │                        │ bcrypt      │                        │
  │                        │ (plain vs   │                        │
  │                        │  hashed)    │                        │
  │                        └──────┬──────┘                        │
  │                               │                               │
  │                        ┌──────▼──────┐                        │
  │                        │ Generate    │                        │
  │                        │ JWT token   │                        │
  │                        │ (userId +   │                        │
  │                        │  expiry)    │                        │
  │                        └──────┬──────┘                        │
  │                               │                               │
  │←─ 200 OK ─────────────────────│                               │
  │   {user, token}               │                               │
  │                               │                               │
```

---

## Protected Route Flow (Detailed)

```
CLIENT                          SERVER                          DATABASE
  │                               │                               │
  │─── GET /profile ──────────────→│                               │
  │     Authorization:             │                               │
  │     Bearer <token>             │                               │
  │                               │                               │
  │                        ┌──────▼──────────┐                    │
  │                        │ authMiddleware  │                    │
  │                        │ 1. Extract      │                    │
  │                        │    token from   │                    │
  │                        │    header       │                    │
  │                        └──────┬──────────┘                    │
  │                               │                               │
  │                        ┌──────▼──────────┐                    │
  │                        │ 2. Verify       │                    │
  │                        │    signature    │                    │
  │                        │    (using       │                    │
  │                        │    JWT_SECRET)  │                    │
  │                        └──────┬──────────┘                    │
  │                               │                               │
  │                        ┌──────▼──────────┐                    │
  │                        │ 3. Decode       │                    │
  │                        │    token &      │                    │
  │                        │    extract      │                    │
  │                        │    userId       │                    │
  │                        └──────┬──────────┘                    │
  │                               │                               │
  │                        ┌──────▼──────────┐                    │
  │                        │ 4. Attach       │                    │
  │                        │    userId to    │                    │
  │                        │    request      │                    │
  │                        └──────┬──────────┘                    │
  │                               │                               │
  │                        ┌──────▼──────────┐                    │
  │                        │ 5. Call route   │                    │
  │                        │    handler      │                    │
  │                        │    (can access  │                    │
  │                        │    req.userId)  │                    │
  │                        └──────┬──────────┘                    │
  │                               │                               │
  │←─ 200 OK ─────────────────────│                               │
  │   {message, userId}           │                               │
  │                               │                               │
```

---

## Data Flow: Password Hashing

```
Plain Password Input
        │
        ▼
┌──────────────────────────────────┐
│  bcryptjs.genSalt(10)            │
│  Generate random salt            │
│  (10 rounds of hashing)          │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  bcryptjs.hash(password, salt)   │
│  Apply salt + hash algorithm     │
│  Multiple times (10 rounds)      │
└──────────────────────────────────┘
        │
        ▼
Hashed Password
(e.g., $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm)
        │
        ▼
Store in Database
```

---

## Data Flow: JWT Token

```
User Login Successful
        │
        ▼
┌──────────────────────────────────┐
│  Create Payload                  │
│  {                               │
│    userId: "user-uuid",          │
│    iat: 1715765400,              │
│    exp: 1716370200               │
│  }                               │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  Sign with JWT_SECRET            │
│  (only server knows secret)      │
└──────────────────────────────────┘
        │
        ▼
JWT Token
(header.payload.signature)
        │
        ▼
Send to Client
        │
        ▼
Client stores in localStorage/sessionStorage
        │
        ▼
Client sends in Authorization header
for future requests
        │
        ▼
Server verifies signature
(ensures token wasn't tampered with)
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Input Validation                                 │
│  ├─ Check all required fields present                      │
│  ├─ Validate email format                                  │
│  ├─ Validate password strength                             │
│  └─ Prevent SQL injection (Prisma handles this)            │
│                                                             │
│  Layer 2: Password Security                                │
│  ├─ Hash passwords with bcrypt (10 rounds)                 │
│  ├─ Never store plain passwords                            │
│  ├─ Never send passwords in responses                      │
│  └─ Use salt to prevent rainbow table attacks              │
│                                                             │
│  Layer 3: Authentication                                   │
│  ├─ Verify email exists in database                        │
│  ├─ Compare passwords using bcrypt.compare()               │
│  ├─ Vague error messages (don't reveal if email exists)    │
│  └─ Generate JWT token on successful login                 │
│                                                             │
│  Layer 4: Authorization                                    │
│  ├─ Verify JWT signature (only server knows secret)        │
│  ├─ Check token expiration (7 days)                        │
│  ├─ Extract userId from verified token                     │
│  └─ Attach userId to request for route handlers            │
│                                                             │
│  Layer 5: Environment Security                             │
│  ├─ Store JWT_SECRET in .env (not in code)                 │
│  ├─ Store DATABASE_URL in .env (not in code)               │
│  ├─ Never commit .env to git                               │
│  └─ Use different secrets for dev/prod                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure & Responsibilities

```
src/
│
├── index.ts
│   └─ Main server file
│      ├─ Initialize Express app
│      ├─ Setup middleware (cors, json parser)
│      ├─ Register routes
│      └─ Start server
│
├── routes/
│   └── authRoutes.ts
│      ├─ POST /auth/signup
│      │  └─ Validate → Hash → Create user → Generate token
│      │
│      └─ POST /auth/login
│         └─ Validate → Find user → Compare password → Generate token
│
├── services/
│   └── authService.ts
│      ├─ hashPassword()      (bcrypt hashing)
│      ├─ comparePassword()   (bcrypt comparison)
│      ├─ generateToken()     (JWT creation)
│      └─ verifyToken()       (JWT verification)
│
├── middleware/
│   └── authMiddleware.ts
│      └─ Extract & verify token
│         └─ Attach userId to request
│
└── lib/
    └── prisma.ts
       └─ Prisma client instance
```

---

## Key Concepts Summary

| Concept | Purpose | Example |
|---------|---------|---------|
| **Hashing** | One-way encryption of passwords | `password123` → `$2a$10$...` |
| **Salt** | Random data added before hashing | Prevents rainbow table attacks |
| **JWT** | Stateless token for authentication | `header.payload.signature` |
| **Payload** | Data encoded in JWT | `{userId, iat, exp}` |
| **Signature** | Proof token wasn't tampered | Signed with JWT_SECRET |
| **Expiration** | Token validity period | 7 days from creation |
| **Middleware** | Function that runs before route | Verify token before accessing route |
| **Bearer Token** | JWT sent in Authorization header | `Authorization: Bearer <token>` |

---

## Next Steps for Enhancement

1. **Email Verification**
   - Send confirmation email on signup
   - Mark email as verified in database
   - Only allow login after verification

2. **Password Reset**
   - Generate reset token
   - Send reset link via email
   - Verify token and update password

3. **Refresh Tokens**
   - Issue short-lived access token (15 min)
   - Issue long-lived refresh token (7 days)
   - Allow refresh without re-login

4. **Rate Limiting**
   - Limit signup attempts per IP
   - Limit login attempts per email
   - Prevent brute force attacks

5. **Logging & Monitoring**
   - Log all auth events
   - Track failed login attempts
   - Alert on suspicious activity

6. **Role-Based Access Control**
   - Add role field to User model
   - Create role-based middleware
   - Restrict routes by role
