# 🚀 Deployment Package - Quick Start

Welcome! This folder contains everything you need to deploy your Electrician Finder application to FREE cloud platforms.

---

## 📦 What's Included

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide (MAIN DOCUMENT)
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Quick reference checklist
- **[DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md)** - System architecture diagrams
- **[check-deployment.js](check-deployment.js)** - Health check script
- **[backend/setup-database.js](backend/setup-database.js)** - Admin user creation script

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Prerequisites

Sign up for FREE accounts at:

- ✅ https://vercel.com (for frontends)
- ✅ https://render.com (for backend)
- ✅ https://www.mongodb.com/cloud/atlas (for database)
- ✅ https://console.cloud.google.com (for Google Maps)
- ✅ https://dashboard.razorpay.com (for payments)

### Step 2: Follow the Guide

Open **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** and follow these phases:

1. **Phase 1**: Deploy Backend to Render (~10 min)
2. **Phase 2**: Deploy User Frontend to Vercel (~5 min)
3. **Phase 3**: Deploy Admin Frontend to Vercel (~5 min)
4. **Phase 4**: Configure CORS (~2 min)
5. **Phase 5**: Verify deployment (~10 min)

**Total time: ~30 minutes**

### Step 3: Create Admin User

```bash
cd backend
node setup-database.js
```

### Step 4: Test Everything

```bash
node check-deployment.js
```

---

## 🎯 Your Deployment URLs

Fill these in as you deploy:

```
✅ Backend API:
   https://________________________________.onrender.com

✅ User Frontend:
   https://________________________________.vercel.app

✅ Admin Panel:
   https://________________________________.vercel.app
```

---

## 📋 Environment Variables Needed

### Backend (Render)

```
PORT=4000
MONGODB_URI=[from MongoDB Atlas]
JWT_ACCESS_SECRET=[generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_REFRESH_SECRET=[generate different one]
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
CORS_ORIGIN=[user-frontend-url],[admin-frontend-url]
RAZORPAY_KEY=[from Razorpay dashboard]
RAZORPAY_SECRET=[from Razorpay dashboard]
```

### User Frontend (Vercel)

```
NEXT_PUBLIC_API_BASE_URL=[backend URL]
NEXT_PUBLIC_API_URL=[backend URL]
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[from Google Cloud]
```

### Admin Frontend (Vercel)

```
NEXT_PUBLIC_API_BASE_URL=[backend URL]
```

---

## 🆘 Common Issues

### Backend doesn't start

- Check MongoDB URI is correct
- Verify all required env vars are set
- Check Render logs for errors

### Frontend shows CORS errors

- Update `CORS_ORIGIN` in Render with actual Vercel URLs
- Format: `https://app1.vercel.app,https://app2.vercel.app` (no spaces!)
- Redeploy backend after changing

### Map doesn't load

- Check Google Maps API key is set
- Enable Maps JavaScript API, Geocoding API, Places API in Google Cloud
- Remove API key restrictions (or add Vercel domains)

### Slow first request (60+ seconds)

- This is normal! Render free tier spins down after 15 min
- Solution: Set up UptimeRobot to ping every 5 minutes
- Instructions in deployment guide

---

## ✅ Verification Checklist

```
□ Backend health endpoint responds: /api/health
□ User frontend loads without errors
□ Admin frontend loads without errors
□ User can register and login
□ Electrician can register and login
□ Admin can login (after manual role change)
□ Admin can approve electricians
□ Approved electricians show in search
□ Socket.IO connects (no console errors)
□ Payment flow works (Razorpay test mode)
```

---

## 📚 Documents

| Document                                                 | Purpose                          | When to Use                 |
| -------------------------------------------------------- | -------------------------------- | --------------------------- |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)               | Complete deployment instructions | First-time deployment       |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)       | Quick reference                  | During deployment           |
| [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md) | System architecture              | Understanding system design |

---

## 🔧 Useful Commands

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Health

```bash
curl https://your-backend.onrender.com/api/health
```

### Check Deployment Status

```bash
node check-deployment.js
```

### Create Admin User

```bash
cd backend
node setup-database.js
```

### View Backend Logs

```bash
# Go to: https://dashboard.render.com
# Click your service → Logs tab
```

### View Frontend Logs

```bash
# Go to: https://vercel.com/dashboard
# Click your project → Deployments → [deployment] → Runtime Logs
```

---

## 🎓 Learning Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Next.js Deploy**: https://nextjs.org/docs/deployment

---

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section** in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. **View logs**:
   - Render: Dashboard → Your Service → Logs
   - Vercel: Dashboard → Your Project → Deployments → Runtime Logs
   - Browser: F12 → Console tab
3. **Common errors** are documented with solutions in the guide

---

## 🎉 Success!

Once deployed successfully, you'll have:

✅ User-facing application (Vercel)  
✅ Admin management panel (Vercel)  
✅ Backend API server (Render)  
✅ Cloud database (MongoDB Atlas)  
✅ Real-time features (Socket.IO)  
✅ Payment gateway (Razorpay test mode)  
✅ HTTPS everywhere  
✅ Zero monthly cost

---

## 🚀 Next Steps After Deployment

1. **Create test data**:

   - Register test users
   - Register test electricians
   - Create admin user
   - Test booking flow

2. **Share with team**:

   - Document all URLs
   - Share test credentials
   - Brief team on deployment

3. **Set up monitoring**:

   - Configure UptimeRobot
   - Enable Vercel Analytics
   - Set up email alerts

4. **Plan for scale**:
   - Monitor usage
   - Track performance
   - Prepare upgrade path

---

## 📊 Cost to Scale

Your app is FREE now, but here's when to upgrade:

| Users     | Monthly Cost | What to Upgrade            |
| --------- | ------------ | -------------------------- |
| 0-500     | **$0**       | Nothing! Use free tier     |
| 500-1000  | **$7**       | Render Standard (no sleep) |
| 1000-5000 | **$16**      | + MongoDB M2 ($9)          |
| 5000+     | **$150+**    | Full production stack      |

---

**Ready? Start with [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)! 🚀**

---

_Last Updated: January 15, 2026_  
_Version: 1.0.0_
