# 🚀 Quick Deployment Checklist

Use this as a quick reference while deploying.

---

## ☁️ MongoDB Atlas

```
□ Cluster created (M0 Free tier)
□ Database user created
□ Password saved securely
□ Network access: 0.0.0.0/0
□ Connection string copied
```

**Connection String Format:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/electrician-finder?retryWrites=true&w=majority
```

---

## 🔧 Render (Backend)

```
□ Web Service created
□ Repository connected
□ Root directory: backend
□ Build command: npm install && npm run build
□ Start command: npm start
□ Environment variables added (see below)
□ Deployed successfully
□ Health check passes: /api/health
```

**Environment Variables:**

```
PORT=4000
MONGODB_URI=[from Atlas]
JWT_ACCESS_SECRET=[generated]
JWT_REFRESH_SECRET=[generated]
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
CORS_ORIGIN=[will update later]
RAZORPAY_KEY=[from Razorpay]
RAZORPAY_SECRET=[from Razorpay]
```

**Generate JWT Secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Backend URL:** `https://_____________.onrender.com`

---

## 🎨 Vercel (User Frontend)

```
□ Project created
□ Repository connected
□ Root directory: frontend
□ Framework: Next.js
□ Environment variables added (see below)
□ Deployed successfully
□ Homepage loads
□ No console errors
```

**Environment Variables:**

```
NEXT_PUBLIC_API_BASE_URL=[Backend URL]
NEXT_PUBLIC_API_URL=[Backend URL]
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[from Google Cloud]
```

**User Frontend URL:** `https://_____________.vercel.app`

---

## 🛡️ Vercel (Admin Frontend)

```
□ Project created (separate from user app)
□ Repository connected
□ Root directory: admin
□ Framework: Next.js
□ Environment variables added (see below)
□ Deployed successfully
□ Homepage loads
```

**Environment Variables:**

```
NEXT_PUBLIC_API_BASE_URL=[Backend URL]
```

**Admin Frontend URL:** `https://_____________.vercel.app`

---

## 🔄 Update CORS

```
□ Go to Render → Environment Variables
□ Update CORS_ORIGIN with actual Vercel URLs:
   https://[user-app].vercel.app,https://[admin-app].vercel.app
□ Redeploy backend (automatic)
□ Test CORS from browser console
```

---

## ✅ Verification Tests

```
□ Backend health: https://[backend]/api/health
□ User frontend loads
□ Admin frontend loads
□ User registration works
□ User login works
□ Electrician registration works
□ Electrician login works
□ Admin login works (after manual role change)
□ Admin can approve electricians
□ Approved electricians appear in search
□ Socket.IO connects (no errors in console)
□ Real-time updates work
□ Payment flow works (test mode)
□ No CORS errors
```

---

## 🔐 Create Admin User

**Method 1: MongoDB Atlas**

```
1. Go to MongoDB Atlas → Browse Collections
2. Database: electrician-finder
3. Collection: users
4. Find your user
5. Edit document
6. Change role: "user" → "admin"
7. Save
```

**Method 2: Use setup script**

```bash
cd backend
node setup-database.js
```

---

## 📊 Post-Deployment

```
□ UptimeRobot configured (keeps Render warm)
□ URLs documented
□ Admin credentials saved
□ Team notified
□ Test credentials shared with team
□ Known issues documented
```

---

## 🐛 Quick Troubleshooting

**Backend not responding:**

- Check Render logs
- Verify MongoDB connection
- Check environment variables

**Frontend not connecting:**

- Check NEXT_PUBLIC_API_BASE_URL
- Verify CORS settings
- Check browser console

**CORS errors:**

- Update CORS_ORIGIN in Render
- Format: URL1,URL2 (no spaces)
- Include https://

**Maps not loading:**

- Check Google Maps API key
- Enable required APIs in Google Cloud
- Check API key restrictions

---

## 📞 Important URLs

| Service          | URL                          | Purpose                 |
| ---------------- | ---------------------------- | ----------------------- |
| Backend          | `https://_____.onrender.com` | API Server              |
| User App         | `https://_____.vercel.app`   | Customer/Electrician UI |
| Admin Panel      | `https://_____.vercel.app`   | Admin Dashboard         |
| MongoDB          | MongoDB Atlas                | Database                |
| Render Dashboard | https://dashboard.render.com | Backend logs            |
| Vercel Dashboard | https://vercel.com/dashboard | Frontend logs           |

---

## 🔑 Test Credentials

**Test User:**

```
Email: testuser@example.com
Password: Test123!@#
Role: user
```

**Test Electrician:**

```
Email: electrician@example.com
Password: Test123!@#
Role: electrician
```

**Admin:**

```
Email: [created via script/manual]
Password: [your password]
Role: admin
```

**Razorpay Test Card:**

```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
```

---

**Last Updated:** January 15, 2026

**Status:** □ Not Started □ In Progress ✅ Complete
