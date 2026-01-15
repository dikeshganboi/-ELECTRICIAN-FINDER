# 🚀 COMPLETE DEPLOYMENT GUIDE

## Electrician Finder MVP - Free Tier Deployment

> **Target Audience**: First-time deployers  
> **Platforms**: Vercel (Frontends) + Render (Backend) + MongoDB Atlas  
> **Cost**: 100% FREE

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [System Architecture Overview](#system-architecture-overview)
3. [Phase 1: Backend Deployment (Render)](#phase-1-backend-deployment-render)
4. [Phase 2: User Frontend Deployment (Vercel)](#phase-2-user-frontend-deployment-vercel)
5. [Phase 3: Admin Frontend Deployment (Vercel)](#phase-3-admin-frontend-deployment-vercel)
6. [Phase 4: CORS Configuration](#phase-4-cors-configuration)
7. [Phase 5: Verification Testing](#phase-5-verification-testing)
8. [Common Errors & Solutions](#common-errors--solutions)
9. [Environment Variables Reference](#environment-variables-reference)

---

## 🎯 PRE-DEPLOYMENT CHECKLIST

Before starting deployment, ensure you have:

- [ ] GitHub account (for code hosting)
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Render account (sign up at https://render.com)
- [ ] MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)
- [ ] Google Maps API Key (get from https://console.cloud.google.com)
- [ ] Razorpay Test Credentials (get from https://dashboard.razorpay.com)
- [ ] Your code pushed to a GitHub repository

### ✅ MongoDB Atlas Setup

1. **Create Cluster** (Free M0 tier)

   - Go to https://www.mongodb.com/cloud/atlas
   - Create a new project: "ElectricianFinder"
   - Deploy a FREE cluster (AWS, any region)

2. **Database Access**

   - Go to "Database Access" → Add New User
   - Username: `electrician_admin`
   - Password: Generate strong password (save it!)
   - Database User Privileges: "Read and write to any database"

3. **Network Access**

   - Go to "Network Access" → Add IP Address
   - **Click "Allow Access from Anywhere" (0.0.0.0/0)**
   - This is required for Render's dynamic IPs

4. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string:
   ```
   mongodb+srv://electrician_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name: `electrician-finder`
   ```
   mongodb+srv://electrician_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/electrician-finder?retryWrites=true&w=majority
   ```

### ✅ Google Maps API Setup

1. Go to https://console.cloud.google.com
2. Create a new project: "Electrician Finder"
3. Enable APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials → API Key
5. Restrict the API key (optional but recommended):
   - Set application restrictions to "HTTP referrers"
   - Add your Vercel domains (will add after deployment)

### ✅ Razorpay Test Credentials

1. Sign up at https://dashboard.razorpay.com
2. Go to Settings → API Keys
3. Generate Test Keys (NOT live keys for testing)
4. Save:
   - Test Key ID: `rzp_test_xxxxx`
   - Test Key Secret: `xxxxx`

---

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────┐
│                    DEPLOYED SYSTEM                           │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│  USER FRONTEND      │         │  ADMIN FRONTEND     │
│  (Vercel)           │         │  (Vercel)           │
│                     │         │                     │
│  app.myproject      │         │  admin.myproject    │
│  .vercel.app        │         │  .vercel.app        │
│                     │         │                     │
│  - Customer UI      │         │  - Verification UI  │
│  - Electrician UI   │         │  - User Management  │
│  - Maps & Booking   │         │  - Analytics        │
│  - Live Tracking    │         │  - Platform Control │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │    HTTPS Requests             │
           │    JWT Auth                   │
           │    Socket.IO                  │
           │                               │
           └───────────┬───────────────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │   BACKEND API         │
           │   (Render)            │
           │                       │
           │   api.myproject       │
           │   .onrender.com       │
           │                       │
           │   - REST API          │
           │   - JWT Auth          │
           │   - Socket.IO Server  │
           │   - Role-Based Access │
           └───────────┬───────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │   MongoDB Atlas       │
           │   (Cloud Database)    │
           │                       │
           │   - Users             │
           │   - Electricians      │
           │   - Bookings          │
           │   - Verification Docs │
           └───────────────────────┘
```

**Key Points:**

- **Two separate frontends** but one shared backend
- Backend enforces role-based access (user/electrician/admin)
- Admin panel is just another UI client with admin role requirement
- All three apps communicate via REST API + WebSocket

---

## 🎬 PHASE 1: BACKEND DEPLOYMENT (RENDER)

### Step 1: Push Code to GitHub

```bash
# If not already done
cd d:\ELECTRICIAN\ FINDER\backend
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

### Step 2: Create Render Web Service

1. **Go to Render Dashboard**

   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**

   - Connect your GitHub account
   - Select your repository
   - Select the `backend` directory (if monorepo)

3. **Configure Service**

   ```
   Name:                electrician-finder-api
   Region:              Oregon (US West) [or closest to you]
   Branch:              main
   Root Directory:      backend  [IMPORTANT: Specify if monorepo]
   Runtime:             Node
   Build Command:       npm install && npm run build
   Start Command:       npm start
   Instance Type:       Free
   ```

4. **Environment Variables** (Click "Advanced" → "Add Environment Variable")

   Add these ONE BY ONE:

   ```bash
   PORT=4000

   MONGODB_URI=mongodb+srv://electrician_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/electrician-finder?retryWrites=true&w=majority

   JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars-long-12345

   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long-67890

   JWT_ACCESS_TTL=15m

   JWT_REFRESH_TTL=7d

   RAZORPAY_KEY=rzp_test_YOUR_KEY_HERE

   RAZORPAY_SECRET=YOUR_RAZORPAY_SECRET_HERE

   CORS_ORIGIN=https://your-user-app.vercel.app,https://your-admin-app.vercel.app
   ```

   **⚠️ IMPORTANT NOTES:**

   - For `CORS_ORIGIN`, use placeholder domains for now (we'll update after deploying frontends)
   - Generate JWT secrets using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Keep MongoDB password safe!

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Note your backend URL: `https://electrician-finder-api.onrender.com`

### Step 3: Test Backend Deployment

Once deployed, test the health endpoint:

```bash
# Method 1: Browser
# Visit: https://your-backend-url.onrender.com/api/health

# Method 2: curl
curl https://electrician-finder-api.onrender.com/api/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

### 🚨 Render Free Tier Limitation

**CRITICAL**: Render free tier services spin down after 15 minutes of inactivity!

- **First request takes 30-60 seconds** (cold start)
- Keep service warm by pinging every 10 minutes using:
  - [UptimeRobot](https://uptimerobot.com) (free monitoring)
  - [Cron-Job.org](https://cron-job.org) (free cron jobs)

---

## 🎨 PHASE 2: USER FRONTEND DEPLOYMENT (VERCEL)

### Step 1: Prepare Frontend

Create `.env.production` file in the `frontend` directory:

```bash
cd d:\ELECTRICIAN\ FINDER\frontend
```

Create file: `.env.production`

```env
NEXT_PUBLIC_API_BASE_URL=https://electrician-finder-api.onrender.com
NEXT_PUBLIC_API_URL=https://electrician-finder-api.onrender.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

**⚠️ IMPORTANT CONSISTENCY ISSUE:**

Your codebase uses TWO different variable names:

- `NEXT_PUBLIC_API_BASE_URL` (in some files)
- `NEXT_PUBLIC_API_URL` (in Socket.IO hooks)

**Solution**: Define BOTH with the same value (shown above).

### Step 2: Update next.config.mjs (if needed)

Check your [frontend/next.config.mjs](frontend/next.config.mjs):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // Allow WebSocket connections
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
```

### Step 3: Deploy to Vercel

1. **Push Code to GitHub**

   ```bash
   git add .
   git commit -m "Add production environment config"
   git push origin main
   ```

2. **Go to Vercel Dashboard**

   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

3. **Import Repository**

   - Select your GitHub repository
   - **Root Directory**: Click "Edit" → Select `frontend`
   - Framework Preset: Next.js (auto-detected)
   - Click "Deploy"

4. **Configure Environment Variables**

   Go to Project Settings → Environment Variables → Add:

   ```
   NEXT_PUBLIC_API_BASE_URL=https://electrician-finder-api.onrender.com
   NEXT_PUBLIC_API_URL=https://electrician-finder-api.onrender.com
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```

   - Set scope: "Production, Preview, Development"
   - Click "Save"

5. **Redeploy** (if needed)

   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

6. **Note Your URL**
   - Your app will be at: `https://electrician-finder-frontend.vercel.app`
   - Or custom domain: `https://your-app.vercel.app`

### Step 4: Test User Frontend

1. Visit your Vercel URL
2. Check if the homepage loads
3. Try to register a new user
4. Check browser console for errors

---

## 🛡️ PHASE 3: ADMIN FRONTEND DEPLOYMENT (VERCEL)

### Step 1: Prepare Admin Panel

Create `.env.production` file in the `admin` directory:

```bash
cd d:\ELECTRICIAN\ FINDER\admin
```

Create file: `.env.production`

```env
NEXT_PUBLIC_API_BASE_URL=https://electrician-finder-api.onrender.com
```

### Step 2: Check Admin next.config.js

Verify [admin/next.config.js](admin/next.config.js):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // Allow requests to backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Step 3: Deploy Admin Panel to Vercel

1. **Go to Vercel Dashboard**

   - Click "Add New..." → "Project"

2. **Import SAME Repository Again**

   - Select your GitHub repository
   - **Root Directory**: Click "Edit" → Select `admin`
   - Framework Preset: Next.js
   - **Project Name**: `electrician-finder-admin` (different from user app!)

3. **Configure Environment Variables**

   ```
   NEXT_PUBLIC_API_BASE_URL=https://electrician-finder-api.onrender.com
   ```

4. **Deploy**

   - Click "Deploy"
   - Wait for deployment to complete

5. **Note Admin URL**
   - Your admin panel: `https://electrician-finder-admin.vercel.app`

---

## 🔐 PHASE 4: CORS CONFIGURATION

Now that both frontends are deployed, update backend CORS settings.

### Step 1: Update Render Environment Variables

1. Go to Render Dashboard → Your Web Service
2. Go to "Environment" tab
3. **Update** the `CORS_ORIGIN` variable:

```
CORS_ORIGIN=https://electrician-finder-frontend.vercel.app,https://electrician-finder-admin.vercel.app
```

**⚠️ IMPORTANT:**

- NO spaces after commas
- NO trailing slashes
- Include HTTPS protocol
- Use your actual Vercel URLs

### Step 2: Trigger Redeploy

After updating environment variables:

1. Render automatically redeploys
2. Wait 5 minutes for redeployment
3. Check logs for successful startup

### Step 3: Verify CORS

Test CORS from browser console on your frontend:

```javascript
// Open browser console on your Vercel app
fetch("https://electrician-finder-api.onrender.com/api/health", {
  method: "GET",
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => console.log("✅ CORS working:", data))
  .catch((err) => console.error("❌ CORS error:", err));
```

**Expected**: Should log `✅ CORS working: { status: "ok", ... }`

---

## ✅ PHASE 5: VERIFICATION TESTING

### Test Plan: Complete System Verification

#### 🔹 Test 1: Backend Health Check

**URL**: `https://electrician-finder-api.onrender.com/api/health`

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00.000Z"
}
```

**✅ Pass Criteria**: Returns 200 OK

---

#### 🔹 Test 2: User Frontend Loads

**URL**: `https://electrician-finder-frontend.vercel.app`

**Verify:**

- [ ] Homepage loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Map loads (if on homepage)
- [ ] Navigation links work

**❌ Common Issues:**

- Map doesn't load → Check Google Maps API key
- 404 errors → Check NEXT_PUBLIC_API_BASE_URL
- CORS errors → Check backend CORS_ORIGIN

---

#### 🔹 Test 3: User Registration & Login

**Test User Registration:**

1. Go to Register page
2. Fill form:
   ```
   Name: Test User
   Email: testuser@example.com
   Password: Test123!@#
   Phone: 1234567890
   Role: User
   ```
3. Submit form

**Expected:**

- ✅ Success message
- ✅ Redirected to dashboard or login
- ✅ JWT token stored (F12 → Application → Cookies/LocalStorage)

**Test Login:**

1. Go to Login page
2. Enter credentials:
   ```
   Email: testuser@example.com
   Password: Test123!@#
   ```
3. Submit

**Expected:**

- ✅ Login successful
- ✅ Redirected to user dashboard
- ✅ Can see user profile

---

#### 🔹 Test 4: Electrician Registration & Login

**Test Electrician Registration:**

1. Go to Register page
2. Fill form:
   ```
   Name: Test Electrician
   Email: electrician@example.com
   Password: Test123!@#
   Phone: 9876543210
   Role: Electrician
   ```
3. Submit

**Expected:**

- ✅ Registration successful
- ✅ Electrician can login
- ✅ Redirected to electrician dashboard
- ✅ Status shows "Pending Verification"

---

#### 🔹 Test 5: Admin Panel Access

**Create Admin User (via MongoDB):**

Since there's no admin registration UI, you need to create admin manually:

1. Go to MongoDB Atlas Dashboard
2. Browse Collections → `electrician-finder` database → `users` collection
3. Find your test user document
4. Click "Edit Document"
5. Change `role` field from `"user"` to `"admin"`
6. Save

**OR** use backend script if available:

```bash
# Create admin via database
# Run this in MongoDB Atlas Data Explorer:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Test Admin Login:**

1. Go to: `https://electrician-finder-admin.vercel.app`
2. Login with admin credentials
3. Verify you can access admin dashboard

**Expected:**

- ✅ Admin dashboard loads
- ✅ Can see electrician verification queue
- ✅ Can see user management
- ✅ Can see statistics/analytics

---

#### 🔹 Test 6: Electrician Verification Flow

**Full workflow test:**

1. **As Electrician:**

   - Login to user frontend (electrician role)
   - Navigate to dashboard
   - Upload verification documents (ID, license, photo)
   - Submit for verification

2. **As Admin:**

   - Login to admin panel
   - Go to "Verification Queue" or "Pending Electricians"
   - See the electrician's application
   - Review documents
   - **Approve** the electrician

3. **As User:**
   - Login to user frontend (customer role)
   - Search for electricians
   - **Verify approved electrician appears in search results**

**Expected:**

- ✅ Document upload works
- ✅ Admin can view pending applications
- ✅ Admin can approve/reject
- ✅ Approved electricians show in user search
- ✅ Rejected electricians don't show in search

---

#### 🔹 Test 7: Real-Time Features (Socket.IO)

**Test Live Location Updates:**

1. **As Electrician:**

   - Login to user frontend
   - Go to electrician dashboard
   - Enable location sharing
   - Move around (or simulate with browser dev tools)

2. **As User:**
   - Login on another browser/device
   - Search for electricians
   - **Verify electrician's location updates in real-time**

**Expected:**

- ✅ Socket connection establishes
- ✅ Location markers move on map
- ✅ No console errors

**Test Booking Notifications:**

1. **As User:**

   - Create a booking request

2. **As Electrician:**

   - **Verify real-time notification appears**
   - Accept/Reject booking

3. **As User:**
   - **Verify booking status updates in real-time**

**Expected:**

- ✅ Notifications work
- ✅ Status updates without page refresh

---

#### 🔹 Test 8: Cross-Frontend Role Enforcement

**Security Test:**

1. Login to USER frontend as regular user
2. Try to access admin features (if any admin links exist)

   - **Expected**: Should be blocked or hidden

3. Try to access admin panel URL directly while logged in as user

   - **Expected**: Should redirect or show "Access Denied"

4. Login to ADMIN panel as admin
5. Verify can access all admin features

**Expected:**

- ✅ Backend enforces role-based access
- ✅ Non-admin users can't access admin endpoints
- ✅ Frontend hides admin UI for non-admins

---

#### 🔹 Test 9: Payment Integration (Razorpay Test Mode)

**Test Payment Flow:**

1. **As User:**

   - Create booking
   - Proceed to payment
   - Use Razorpay test card:
     ```
     Card Number: 4111 1111 1111 1111
     CVV: 123
     Expiry: Any future date
     ```

2. **Verify:**
   - Payment modal opens
   - Test payment succeeds
   - Booking status updates to "Paid"

**Expected:**

- ✅ Razorpay modal loads
- ✅ Test payment succeeds
- ✅ Payment recorded in database

---

### 🎯 Verification Checklist Summary

Copy this checklist and check off as you test:

```
□ Backend health endpoint responds
□ User frontend loads without errors
□ Admin frontend loads without errors
□ User registration works
□ User login works
□ Electrician registration works
□ Electrician login works
□ Admin login works (after manual role change)
□ Admin can see verification queue
□ Admin can approve electricians
□ Approved electricians appear in search
□ Socket.IO connects successfully
□ Real-time location updates work
□ Booking notifications work
□ Role-based access is enforced
□ Non-admin can't access admin panel
□ Payment flow works (test mode)
□ No CORS errors in console
□ No 404 errors in console
□ Mobile responsive design works
```

---

## 🐛 COMMON ERRORS & SOLUTIONS

### Error 1: Backend Returns 502 Bad Gateway

**Symptoms:**

- Frontend can't connect to backend
- Render logs show "Application failed to start"

**Causes & Solutions:**

**1. MongoDB Connection Failed**

```bash
# Error in Render logs:
MongoServerError: bad auth : Authentication failed.
```

**Solution:**

- Verify MongoDB URI is correct
- Check MongoDB user has read/write permissions
- Ensure network access is set to 0.0.0.0/0
- Password must be URL-encoded (replace special chars)

**2. Missing Environment Variables**

```bash
# Error in Render logs:
Error: Missing env var JWT_ACCESS_SECRET
```

**Solution:**

- Go to Render → Environment → Add missing variables
- Redeploy service

**3. Build Failed**

```bash
# Error in Render logs:
npm ERR! code ELIFECYCLE
```

**Solution:**

- Check `package.json` has correct build script
- Verify `tsconfig.json` is present
- Check Node version compatibility

---

### Error 2: CORS Policy Blocked

**Symptoms:**

```
Access to fetch at 'https://api.onrender.com/api/...' from origin
'https://app.vercel.app' has been blocked by CORS policy
```

**Solutions:**

**1. Update Backend CORS_ORIGIN**

```bash
# In Render environment variables:
CORS_ORIGIN=https://your-user-app.vercel.app,https://your-admin-app.vercel.app
```

**2. Check Backend Code**

```typescript
// backend/src/index.ts
app.use(
  cors({
    origin: env.corsOrigin, // Must be array or string
    credentials: true,
  })
);
```

**3. Frontend Request Must Include Credentials**

```typescript
// In frontend API calls:
fetch(url, {
  credentials: "include", // Important!
  headers: { "Content-Type": "application/json" },
});
```

---

### Error 3: "NEXT_PUBLIC_API_BASE_URL is undefined"

**Symptoms:**

- API calls fail
- Console shows: `undefined/api/users`

**Solutions:**

**1. Check Environment Variables in Vercel**

- Go to Vercel → Project Settings → Environment Variables
- Verify `NEXT_PUBLIC_API_BASE_URL` is set
- Must include `NEXT_PUBLIC_` prefix!

**2. Redeploy After Adding Variables**

- Environment changes require redeploy
- Go to Deployments → Click "..." → Redeploy

**3. Check Variable Name Consistency**

```typescript
// Your codebase uses both:
process.env.NEXT_PUBLIC_API_BASE_URL; // ✅
process.env.NEXT_PUBLIC_API_URL; // ✅

// Define both in Vercel!
```

---

### Error 4: Socket.IO Connection Failed

**Symptoms:**

```javascript
WebSocket connection to 'wss://api.onrender.com' failed
```

**Solutions:**

**1. Check Backend Socket.IO Setup**

```typescript
// backend/src/index.ts
import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: env.corsOrigin,
    credentials: true,
  },
});
```

**2. Frontend Socket Connection**

```typescript
// frontend/hooks/useSocket.ts
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  transports: ["websocket", "polling"], // Try both
  withCredentials: true,
});
```

**3. Render Free Tier Limitation**

- Cold start takes 30-60 seconds
- WebSocket may fail during spin-up
- Solution: Retry connection with exponential backoff

---

### Error 5: "Application Error" on Render

**Symptoms:**

- Backend shows "Application Error" page
- Logs show process crash

**Solutions:**

**1. Check Start Command**

```json
// package.json
{
  "scripts": {
    "start": "node dist/index.js" // Must match Render config
  }
}
```

**2. Check PORT Binding**

```typescript
// backend/src/index.ts
const PORT = process.env.PORT || 4000; // Must use Render's PORT
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**3. Check Node Version**

```json
// package.json (add if missing)
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### Error 6: Google Maps Not Loading

**Symptoms:**

- Map container is blank
- Console error: `InvalidKeyMapError`

**Solutions:**

**1. Verify API Key**

```bash
# In Vercel environment variables:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

**2. Enable Required APIs**

- Go to Google Cloud Console
- Enable:
  - Maps JavaScript API ✅
  - Geocoding API ✅
  - Places API ✅

**3. Check API Key Restrictions**

- Go to Google Cloud → Credentials
- Edit API Key → Application Restrictions
- Add Vercel domains:
  ```
  https://your-app.vercel.app/*
  https://*.vercel.app/*  (for preview deployments)
  ```

---

### Error 7: JWT Token Not Persisting

**Symptoms:**

- User logged out after page refresh
- Token not found in storage

**Solutions:**

**1. Check Token Storage**

```typescript
// frontend/context/AuthContext.tsx
// Store token in localStorage (not sessionStorage)
localStorage.setItem("accessToken", token);
```

**2. Check Token Expiry**

```bash
# Backend environment:
JWT_ACCESS_TTL=15m   # Short-lived
JWT_REFRESH_TTL=7d   # Long-lived
```

**3. Implement Token Refresh**

```typescript
// Auto-refresh token before expiry
setInterval(() => {
  refreshAccessToken();
}, 14 * 60 * 1000); // 14 minutes
```

---

### Error 8: Images/Uploads Not Working

**Symptoms:**

- File upload fails
- Images don't display

**Solutions:**

**1. Check Backend Storage**

```typescript
// Your backend likely uses MongoDB for document storage
// Verify file size limits:
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
```

**2. Check Frontend File Upload**

```typescript
// Use FormData for file uploads
const formData = new FormData();
formData.append("file", file);

fetch(`${API_URL}/api/upload`, {
  method: "POST",
  body: formData,
  // DON'T set Content-Type header (browser sets it)
});
```

**3. Consider Using Cloud Storage**

- For production, use:
  - Cloudinary (free tier)
  - AWS S3 (pay-as-you-go)
  - Google Cloud Storage

---

### Error 9: Admin Can't Approve Electricians

**Symptoms:**

- Approve button doesn't work
- No error shown

**Solutions:**

**1. Check Admin Role**

```bash
# Verify in MongoDB:
db.users.findOne({ email: "admin@example.com" })
# Should show: { role: "admin", ... }
```

**2. Check Backend Middleware**

```typescript
// backend/src/middleware/auth.ts
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
```

**3. Check API Request**

```typescript
// frontend/admin API call must include auth token
fetch(`${API_URL}/api/electricians/${id}/approve`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`, // ✅
    "Content-Type": "application/json",
  },
});
```

---

### Error 10: Slow Cold Starts (Render Free Tier)

**Symptoms:**

- First request takes 60+ seconds
- Backend spins down after 15 min inactivity

**Solutions:**

**1. Set Up Uptime Monitor**

Use UptimeRobot (free):

- Create account at https://uptimerobot.com
- Add new monitor:
  ```
  Type: HTTP(s)
  URL: https://your-api.onrender.com/api/health
  Interval: 5 minutes
  ```

**2. Implement Loading States**

```typescript
// frontend: Show loading during cold start
const [isColdStart, setIsColdStart] = useState(false);

fetch(url).then((res) => {
  // If response takes >5s, show cold start message
  if (responseTime > 5000) {
    setIsColdStart(true);
  }
});
```

**3. Optimize Backend Startup**

```typescript
// Lazy load heavy dependencies
// Connect to DB only when needed
app.listen(PORT, () => {
  console.log("Server started");
  // Don't await DB connection here
  connectDb().catch(console.error);
});
```

---

## 📚 ENVIRONMENT VARIABLES REFERENCE

### Backend (Render)

| Variable             | Required | Example                                           | Notes                 |
| -------------------- | -------- | ------------------------------------------------- | --------------------- |
| `PORT`               | ✅       | `4000`                                            | Render provides this  |
| `MONGODB_URI`        | ✅       | `mongodb+srv://...`                               | From MongoDB Atlas    |
| `JWT_ACCESS_SECRET`  | ✅       | `32-char-random-string`                           | Generate securely     |
| `JWT_REFRESH_SECRET` | ✅       | `32-char-random-string`                           | Different from access |
| `JWT_ACCESS_TTL`     | ❌       | `15m`                                             | Token expiry          |
| `JWT_REFRESH_TTL`    | ❌       | `7d`                                              | Refresh token expiry  |
| `CORS_ORIGIN`        | ✅       | `https://app.vercel.app,https://admin.vercel.app` | Comma-separated       |
| `RAZORPAY_KEY`       | ✅       | `rzp_test_...`                                    | Test mode key         |
| `RAZORPAY_SECRET`    | ✅       | `...`                                             | Test mode secret      |

**Generate JWT Secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### User Frontend (Vercel)

| Variable                          | Required | Example                    | Notes                         |
| --------------------------------- | -------- | -------------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`        | ✅       | `https://api.onrender.com` | Backend URL                   |
| `NEXT_PUBLIC_API_URL`             | ✅       | `https://api.onrender.com` | Same as above (for Socket.IO) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅       | `AIza...`                  | From Google Cloud             |

**⚠️ Note:** Variables with `NEXT_PUBLIC_` prefix are exposed to browser!

---

### Admin Frontend (Vercel)

| Variable                   | Required | Example                    | Notes       |
| -------------------------- | -------- | -------------------------- | ----------- |
| `NEXT_PUBLIC_API_BASE_URL` | ✅       | `https://api.onrender.com` | Backend URL |

---

## 🎓 DEPLOYMENT BEST PRACTICES

### 1. Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS only (Vercel/Render do this automatically)
- [ ] Restrict MongoDB network access after testing
- [ ] Use environment variables for all secrets
- [ ] Never commit `.env` files to Git
- [ ] Implement rate limiting (already in your backend)
- [ ] Use Razorpay test mode for MVP
- [ ] Implement input validation on backend

### 2. Monitoring Setup

**Render Dashboard:**

- Set up email alerts for failed deployments
- Check logs regularly: Dashboard → Logs → Live Logs

**Vercel Analytics:**

- Enable Vercel Analytics (free)
- Monitor page load times
- Track errors in production

**MongoDB Atlas:**

- Enable alerts for:
  - High connection count
  - Storage usage >80%
  - Unusual query patterns

### 3. Git Workflow

```bash
# Create production branch
git checkout -b production
git push origin production

# Deploy from production branch
# Connect Render/Vercel to 'production' branch
# Keep 'main' for development
```

### 4. Environment Management

**Development:**

```
Backend: localhost:4000
User Frontend: localhost:3000
Admin Frontend: localhost:3001
Database: Local MongoDB or Atlas Dev Cluster
```

**Production:**

```
Backend: https://api.onrender.com
User Frontend: https://app.vercel.app
Admin Frontend: https://admin.vercel.app
Database: MongoDB Atlas Production Cluster
```

---

## 🚀 POST-DEPLOYMENT TASKS

### 1. Custom Domains (Optional)

**Vercel Custom Domain:**

1. Buy domain from Namecheap/GoDaddy (~$10/year)
2. Go to Vercel → Project Settings → Domains
3. Add custom domain: `electricianfinder.com`
4. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
5. For admin: `admin.electricianfinder.com`

**Render Custom Domain:**

1. Go to Render → Your Service → Settings
2. Add custom domain: `api.electricianfinder.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-service.onrender.com
   ```

### 2. Set Up Monitoring

**UptimeRobot** (Free):

- Monitor backend uptime
- Get email alerts on downtime
- Keep Render service warm

**Sentry** (Free tier):

```bash
# Install in frontend
npm install @sentry/nextjs

# Configure in next.config.js
```

### 3. Enable Analytics

**Vercel Analytics:**

```bash
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
<Analytics />
```

### 4. Performance Optimization

**Backend:**

- Enable Redis caching (RedisLabs free tier)
- Optimize MongoDB queries (use indexes)
- Enable compression (already in your code ✅)

**Frontend:**

- Enable Next.js Image Optimization
- Use dynamic imports for heavy components
- Implement lazy loading for maps

---

## 🎯 FINAL DEPLOYMENT CHECKLIST

Print this and check off as you complete:

```
BACKEND DEPLOYMENT:
□ MongoDB Atlas cluster created
□ Database user created with read/write access
□ Network access set to 0.0.0.0/0
□ Connection string copied
□ Render web service created
□ All environment variables added
□ Build and start commands configured
□ Deployment successful
□ Health endpoint returns 200 OK
□ UptimeRobot monitor configured

USER FRONTEND DEPLOYMENT:
□ GitHub repository pushed
□ Vercel project created
□ Root directory set to 'frontend'
□ Environment variables added
□ Deployment successful
□ Homepage loads without errors
□ API calls work (check console)
□ Google Maps loads

ADMIN FRONTEND DEPLOYMENT:
□ Vercel project created (separate)
□ Root directory set to 'admin'
□ Environment variables added
□ Deployment successful
□ Admin panel loads

INTEGRATION:
□ CORS updated with both frontend URLs
□ Backend redeployed after CORS update
□ User registration tested
□ User login tested
□ Electrician registration tested
□ Admin login tested (after role change)
□ Electrician verification flow tested
□ Socket.IO real-time features tested
□ Payment flow tested (test mode)

SECURITY:
□ JWT secrets are strong (32+ chars)
□ Razorpay in test mode
□ No secrets in frontend code
□ Role-based access enforced
□ HTTPS enabled (automatic)

DOCUMENTATION:
□ URLs documented
□ Test credentials saved securely
□ Admin creation process documented
□ Known issues documented
□ User guide created (optional)

OPTIONAL:
□ Custom domains configured
□ Analytics enabled
□ Error monitoring (Sentry)
□ Performance monitoring
□ Backup strategy defined
```

---

## 📞 SUPPORT & RESOURCES

### Platform Documentation

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

### Community Support

- **Render Community**: https://community.render.com
- **Vercel Discord**: https://vercel.com/discord
- **Stack Overflow**: Tag your questions with `render`, `vercel`, `nextjs`

### Debugging Tools

- **Render Logs**: Dashboard → Your Service → Logs
- **Vercel Logs**: Dashboard → Your Project → Deployments → [Deployment] → Runtime Logs
- **MongoDB Logs**: Atlas → Clusters → Monitoring

---

## 🎉 CONGRATULATIONS!

You've successfully deployed a production-ready MVP of your Electrician Finder application!

**Your Live URLs:**

- 👤 User App: `https://your-app.vercel.app`
- 🛡️ Admin Panel: `https://your-admin.vercel.app`
- 🔧 Backend API: `https://your-api.onrender.com`

**Next Steps:**

1. Create test users and electricians
2. Share links with beta testers
3. Gather feedback
4. Iterate and improve
5. Add custom domain
6. Scale as needed

**Remember:**

- Render free tier spins down after 15 min (use UptimeRobot)
- MongoDB Atlas free tier has 512MB limit
- Vercel free tier has bandwidth limits

**When to upgrade:**

- > 500 active users → Upgrade Render ($7/month)
- > 1000 users → Upgrade MongoDB Atlas ($9/month)
- Need custom domains → Already supported on free tier!

---

**Good luck with your launch! 🚀**

---

_Last Updated: January 15, 2026_
_Version: 1.0.0_
