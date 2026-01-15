# Admin Panel Login Fix - URGENT

## Problem

The admin panel is showing 401 errors because it's using an old token format that's incompatible with the auth middleware.

## Solution - Follow These Steps:

### Option 1: Clear localStorage (Fastest)

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Run this command:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. You'll be redirected to login page
5. Log in with:
   - Email: `admin@electricianfinder.com`
   - Password: `admin@123`

### Option 2: Manual Logout

1. In the admin panel, find and click the logout button
2. Log in again with the credentials above

### Option 3: Private/Incognito Window

1. Open `http://localhost:3001/` in an incognito window
2. Log in fresh with the credentials above

## What Was Fixed

- Admin JWT token now uses correct secret (`env.jwtAccessSecret`)
- Token payload now has `userId` field (was `id` before)
- Token is now compatible with the auth middleware

## Verification

After logging in, you should see:

- Dashboard loads without 401 errors
- Navigate to `/dashboard/verification`
- Filter by "Pending"
- You should see: **ddddd (ddd@gmail.com)** with 1 pending verification

## Database Status (Confirmed Working)

```
✅ 8 users in database
✅ 10 electricians in database
✅ 1 pending verification ready to review
✅ Backend endpoint tested and working
```

The data IS there - you just need a fresh token to access it!
