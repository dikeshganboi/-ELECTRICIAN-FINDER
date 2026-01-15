# 🚀 QUICK START GUIDE - Admin Panel

## ✅ Admin Panel is Running!

**URL**: http://localhost:3001  
**Login**: admin@electricianfinder.com  
**Password**: admin@123

## 📦 What's Included

### ✨ Features Ready to Use:

1. **Login Page** (/)

   - Email/password authentication
   - JWT token management
   - Demo credentials pre-filled

2. **Dashboard** (/dashboard)

   - Real-time statistics
   - Today's revenue and bookings
   - Recent activity feed
   - Performance metrics

3. **Electrician Verification** (/dashboard/verification) ⭐ CORE FEATURE

   - Pending verification list
   - View documents (Aadhaar, Certificate, Photo)
   - Approve/Reject electricians
   - Search and filter by status
   - Rejection reason tracking

4. **Electrician Management** (/dashboard/electricians)

   - List all electricians
   - View skills, rating, location
   - Online/Offline status
   - Total jobs completed

5. **User Management** (/dashboard/users)

   - View all users
   - Booking history
   - Block/Unblock functionality

6. **Bookings** (/dashboard/bookings)

   - All booking records
   - Status tracking (Pending, Completed, Cancelled)
   - Revenue reports

7. **Disputes** (/dashboard/disputes)

   - Open dispute tickets
   - Resolution tracking
   - Priority management

8. **Analytics** (/dashboard/analytics)

   - Revenue charts
   - Service distribution pie chart
   - Top electrician rankings
   - Booking trends

9. **Settings** (/dashboard/settings)
   - Commission percentage
   - Minimum booking amount
   - Cancellation policies
   - Maintenance mode toggle

## 🔗 Backend API Setup

The admin panel connects to `http://localhost:4000` by default.

### Required Backend Routes (Already Added):

```
POST /api/admin/login                          ✅ Demo credentials working
GET /api/admin/stats                           ✅ Dashboard metrics
GET /api/admin/electricians                    ✅ Verification list
PATCH /api/admin/electricians/:id/approve      ✅ Approve action
PATCH /api/admin/electricians/:id/reject       ✅ Reject action
GET /api/admin/analytics/overview              ✅ Analytics data
```

## 🎯 Testing the Admin Panel

### 1. Start Backend Server

```bash
cd backend
npm start
```

### 2. Start Admin Panel

```bash
cd admin
npm run dev
```

### 3. Login Steps:

1. Go to http://localhost:3001
2. Login with demo credentials (pre-filled)
3. You'll land on the dashboard

### 4. Test Electrician Verification:

1. Click "Verification" in the sidebar
2. If you have pending electricians, they'll appear in the table
3. Click "View Details" (eye icon)
4. See documents, approve or reject with reason

### 5. View Real-time Stats:

- Dashboard auto-refreshes every 30 seconds
- All metrics pulled from your MongoDB database
- Online electricians show in green

## 📊 Data Flow

```
User Login → JWT Token → Store in localStorage
↓
Every API Call → Include Token in Authorization Header
↓
Backend Validates → Check role: "admin"
↓
Return Data → Update UI
```

## 🎨 UI Components

All pages use:

- **Card components**: `.card` and `.card-body` classes
- **Primary buttons**: `.btn-primary` class
- **Icons**: Lucide React library
- **Charts**: Recharts library (Analytics page)

## 🔧 Customization

### Change Port:

Edit `package.json`:

```json
"dev": "next dev -p 3002"  // Change from 3001
```

### Change Backend URL:

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=https://your-backend.com
```

### Add New Admin Route:

1. Create file in `app/dashboard/your-page/page.tsx`
2. Add menu item in `app/dashboard/layout.tsx`
3. Create backend API route if needed

## 🚨 Important Notes

### Authentication:

- Demo admin credentials are hardcoded for testing
- In production, implement proper admin user management
- JWT expires in 24 hours

### Security:

- Never commit real admin credentials
- Use environment variables in production
- Implement rate limiting on login endpoint

### Performance:

- Dashboard stats refresh every 30 seconds
- Tables limited to 50 records (add pagination if needed)
- Charts use lightweight Recharts library

## 📱 Responsive Design

- Sidebar hides on mobile (toggle with menu icon)
- Tables scroll horizontally on small screens
- Cards stack vertically on mobile
- Touch-friendly buttons (44px minimum)

## 🐛 Troubleshooting

### Admin panel won't start:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't login:

- Check backend is running on port 4000
- Verify `/api/admin/login` route exists
- Check console for CORS errors

### No data showing:

- Ensure MongoDB is connected
- Check if collections have data
- Open browser DevTools → Network tab

### TypeScript errors:

- Run `npm install` again
- Check `tsconfig.json` exists
- Restart VS Code

## 📝 Next Steps

1. **Create Real Admin Users**:

   - Add AdminModel in backend
   - Hash passwords with bcrypt
   - Store in MongoDB

2. **Add Audit Logs**:

   - Track all admin actions
   - Store who/when/what changed
   - Display in activity feed

3. **Implement Role Hierarchy**:

   - Super Admin: Full access
   - Manager: Limited access
   - Support: Read-only

4. **Add Notifications**:

   - Email notifications on actions
   - SMS alerts for critical events
   - In-app notification bell

5. **Enhanced Analytics**:
   - Export reports as PDF/Excel
   - Date range filters
   - Advanced metrics

## 🎉 You're All Set!

The admin panel is fully functional and ready to use. Login and start managing your platform!

---

**Need Help?** Check the full README.md for detailed documentation.
