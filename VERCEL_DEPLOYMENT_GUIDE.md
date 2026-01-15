# Vercel Deployment Guide

## Prerequisites

- Backend deployed at: `https://electrician-finder.onrender.com`
- GitHub repository: `https://github.com/dikeshganboi/-ELECTRICIAN-FINDER`

---

## Step 1: Deploy User Frontend

### 1.1 Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New... → Project"**
3. Import your GitHub repository: `dikeshganboi/-ELECTRICIAN-FINDER`
4. **Root Directory**: Set to `frontend`
5. **Framework Preset**: Next.js (auto-detected)
6. **Build Command**: `npm run build`
7. **Output Directory**: `.next` (auto-detected)

### 1.2 Configure Environment Variables

Click **"Environment Variables"** and add these three variables:

| Name                              | Value                                                 |
| --------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`        | `https://electrician-finder.onrender.com`             |
| `NEXT_PUBLIC_API_URL`             | `https://electrician-finder.onrender.com`             |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key (or leave blank for testing) |

### 1.3 Deploy

- Click **"Deploy"**
- Wait 2-3 minutes for the build to complete
- **Note your URL**: `https://your-user-app.vercel.app`

---

## Step 2: Deploy Admin Frontend

### 2.1 Import to Vercel

1. In Vercel Dashboard, click **"Add New... → Project"** again
2. Import the **same** repository: `dikeshganboi/-ELECTRICIAN-FINDER`
3. **Root Directory**: Set to `admin`
4. **Framework Preset**: Next.js (auto-detected)
5. **Build Command**: `npm run build`
6. **Output Directory**: `.next` (auto-detected)

### 2.2 Configure Environment Variables

Click **"Environment Variables"** and add:

| Name                       | Value                                     |
| -------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://electrician-finder.onrender.com` |

### 2.3 Deploy

- Click **"Deploy"**
- Wait 2-3 minutes for the build to complete
- **Note your URL**: `https://your-admin-app.vercel.app`

---

## Step 3: Update Backend CORS

Once both apps are deployed, you need to update the backend to allow requests from your Vercel domains.

### 3.1 Update Render Environment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service: **electrician-finder-api**
3. Go to **Environment** tab
4. Find or add `CORS_ORIGIN` variable
5. Set value to (replace with your actual Vercel URLs):
   ```
   https://your-user-app.vercel.app,https://your-admin-app.vercel.app
   ```
   **Important**: No spaces between URLs, comma-separated only

### 3.2 Redeploy Backend

- Click **"Manual Deploy → Deploy latest commit"**
- Wait ~1-2 minutes for restart

---

## Step 4: Verify Deployment

### 4.1 Test User App

1. Open: `https://your-user-app.vercel.app`
2. Try signing up or logging in
3. Check browser console for errors

### 4.2 Test Admin App

1. Open: `https://your-admin-app.vercel.app`
2. Try admin login
3. Check browser console for errors

### 4.3 Test Backend Health

```bash
curl https://electrician-finder.onrender.com/api/health
```

Expected response: `{"ok":true,"db":1}`

---

## Troubleshooting

### Build Fails on Vercel

- Check build logs in Vercel dashboard
- Verify `package.json` has all dependencies
- Ensure Node.js version compatibility (18+ recommended)

### CORS Errors in Browser

- Verify `CORS_ORIGIN` on Render has **exact** Vercel URLs
- No trailing slashes in URLs
- Comma-separated, no spaces
- Redeploy backend after updating

### API Connection Fails

- Check `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Verify backend is running: visit `/api/health`
- Check browser Network tab for failed requests

### MongoDB Connection Issues

- Verify `MONGODB_URI` on Render points to Atlas
- Check Atlas Network Access whitelist (add `0.0.0.0/0` for testing)
- Verify database user credentials

---

## Environment Variables Reference

### User Frontend (`frontend/`)

```env
NEXT_PUBLIC_API_BASE_URL=https://electrician-finder.onrender.com
NEXT_PUBLIC_API_URL=https://electrician-finder.onrender.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Admin Frontend (`admin/`)

```env
NEXT_PUBLIC_API_BASE_URL=https://electrician-finder.onrender.com
```

### Backend (Render)

```env
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your-secure-random-string
JWT_REFRESH_SECRET=your-secure-random-string
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
CORS_ORIGIN=https://your-user-app.vercel.app,https://your-admin-app.vercel.app
RAZORPAY_KEY=test_key_placeholder
RAZORPAY_SECRET=test_secret_placeholder
```

---

## Next Steps

After successful deployment:

1. **Create Admin User**: Run the setup script on Render (or use MongoDB Compass)
2. **Test All Flows**:
   - User registration/login
   - Electrician registration/verification
   - Booking flow
   - Real-time updates
3. **Monitor**: Check Render logs for errors
4. **Optimize**: Enable Vercel Analytics, set up custom domains

---

## Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
