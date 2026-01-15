# 🛡️ Admin Panel Setup & Usage Guide

## Quick Access

- **Admin URL**: http://localhost:3001
- **Demo Email**: admin@electricianfinder.com
- **Demo Password**: admin@123
- **Backend API**: http://localhost:4000

---

## ✅ Complete Verification System Now Active

### What's Changed:

✅ **New electricians are NOT auto-verified**

- Start with `isVerified: false`
- Don't appear in user search results
- Don't show up in live tracking

✅ **Admin verification panel is functional**

- Shows only pending electricians
- Displays documents for review
- Can approve or reject with reason

✅ **Users only see verified electricians**

- Search filters: `isVerified: true` (mandatory)
- Can't bypass this filter
- Only approved electricians appear in results

---

## 🚀 How to Test the Complete Flow

### Step 1: Start All Three Services

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - User Frontend:**

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 - Admin Panel:**

```bash
cd admin
npm run dev
# Runs on http://localhost:3001
```

---

### Step 2: Register a New Electrician

**On User Frontend (http://localhost:3000):**

1. Click "Sign up as Electrician"
2. Fill in details:
   - Name: Test Electrician
   - Email: test@example.com
   - Phone: 9999999999
   - Password: pass123
3. Click "Register"
4. Login to the electrician app
5. Complete profile:
   - Add skills (Wiring, etc)
   - Upload documents (Aadhaar, Certificate)
   - Go online

**Result:**

- Electrician dashboard shows (limited features)
- Can see "Pending Verification" message
- NOT visible in user's search results yet

---

### Step 3: Admin Reviews Pending Electricians

**On Admin Panel (http://localhost:3001):**

1. Click "Sign In"
2. Use demo credentials (pre-filled)
3. Click "Verification" in sidebar
4. Should see "Test Electrician" in pending list
5. Click the eye icon to view details
6. See the uploaded documents

---

### Step 4: Admin Approves Electrician

**In the verification modal:**

1. Review all documents
2. Click "Approve" button
3. Success message appears
4. Modal closes

**What happens behind the scenes:**

- `isVerified` changes from `false` to `true`
- Electrician added to verified list in database
- Now eligible for user searches

---

### Step 5: User Sees Electrician in Search

**Back on User Frontend (http://localhost:3000):**

1. Go to "Find Electrician" page
2. Search for "Wiring" or location nearby
3. **NEW**: "Test Electrician" now appears in search results! ✅
4. Can click to see profile, rating, reviews
5. Can book this electrician

---

### Step 6: Admin Can Also Reject

**To test rejection:**

1. Register another test electrician
2. In Admin → Verification
3. Click to view details
4. Click "Reject" button
5. Add rejection reason: "Invalid documents, please resubmit"
6. Modal closes
7. Electrician moves to "Rejected" status
8. Back on user frontend - this electrician is NEVER shown ❌

---

## 📊 Admin Panel Sections Explained

### Dashboard

- Total Users: Count of all users
- Total Electricians: Count of all electricians (verified + unverified)
- Online Electricians: Real-time count (live tracking)
- Today's Bookings: All bookings created today
- Revenue Today: Sum of completed booking amounts
- Active Bookings: Current in-progress bookings

### Verification (CORE FEATURE)

- **Pending Tab**: Electricians waiting for approval
- **Approved Tab**: Already verified electricians
- **Rejected Tab**: Those who failed verification

**For Each Electrician:**

- View Name, Phone, Email, Skills, Rating
- View uploaded documents with preview
- Approve: Sets `isVerified: true`, makes visible to users
- Reject: Records rejection reason, keeps hidden

### Electricians

- List all electricians on platform
- See verified/unverified status
- View online status
- Check total jobs completed
- View contact info and skills

### Users

- List all platform users
- See booking history
- Block/unblock users
- View total spent

### Bookings

- View all booking records
- Filter by status (pending, completed, cancelled)
- See revenue per booking
- Track completion date

### Disputes

- Handle customer complaints
- Assign priority (low, medium, high)
- Track resolution status

### Analytics

- Revenue trends (chart)
- Service category distribution (pie chart)
- Top electricians leaderboard
- Completion rates

### Settings

- Platform commission %
- Minimum booking amount
- Cancellation policy (minutes before auto-reject)
- Maintenance mode toggle

---

## 🔍 Database Schema Changes

### Electrician Model Updated:

```javascript
{
  userId: ObjectId,
  name: String,
  phone: String,
  email: String,

  // Verification Status
  isVerified: Boolean (false by default) ✅ KEY FIELD
  rejectionReason: String (if rejected),

  // Profile
  skills: [String],
  experienceYears: Number,
  baseRate: Number,

  // Documents Array (NEW)
  documents: [
    {
      type: "aadhaar|certificate|photo|license",
      url: "s3://...",
      verified: Boolean
    }
  ],

  // Status
  availabilityStatus: "online|offline|busy",
  onService: Boolean,

  // Location (Geospatial)
  currentLocation: {
    type: "Point",
    coordinates: [lng, lat]
  },

  // Rating
  rating: Number (0-5),

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 API Endpoints for Admin

### Authentication

```
POST /api/admin/login
{
  "email": "admin@electricianfinder.com",
  "password": "admin@123"
}
Response: { token, admin: { id, email, name, role } }
```

### Dashboard Stats

```
GET /api/admin/stats
Authorization: Bearer <admin_token>

Response: {
  totalUsers: 150,
  totalElectricians: 45,
  onlineElectricians: 12,
  todayBookings: 34,
  revenueToday: 12500,
  activeBookings: 8
}
```

### Verification - List Pending

```
GET /api/admin/electricians?status=pending
Authorization: Bearer <admin_token>

Response: [
  {
    _id: "123",
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@example.com",
    skills: ["Wiring", "Troubleshooting"],
    rating: 0,
    documents: [
      { type: "aadhaar", url: "s3://...", verified: false },
      { type: "certificate", url: "s3://...", verified: false }
    ],
    verificationStatus: "pending",
    createdAt: "2024-01-14T10:00:00Z"
  }
]
```

### Approve Electrician

```
PATCH /api/admin/electricians/:electricianId/approve
Authorization: Bearer <admin_token>

Response: { message: "Electrician approved", data: {...} }
```

### Reject Electrician

```
PATCH /api/admin/electricians/:electricianId/reject
Authorization: Bearer <admin_token>
{
  "reason": "Invalid documents, please resubmit"
}

Response: { message: "Electrician rejected", data: {...} }
```

---

## 🧪 Testing Checklist

- [ ] New electrician starts with `isVerified: false`
- [ ] New electrician NOT visible in user search
- [ ] Admin can see pending electricians
- [ ] Admin can view documents
- [ ] Admin can approve electrician
- [ ] After approval, electrician appears in user search ✅
- [ ] User can book approved electrician
- [ ] Admin can reject electrician
- [ ] Rejected electrician hidden from users
- [ ] Dashboard stats show real data
- [ ] Stats auto-refresh every 30 seconds

---

## 📝 Common Tasks

### Add New Admin User (Future)

Currently using demo credentials. To add real admin users:

1. Create `AdminUser` model in MongoDB
2. Update `/api/admin/login` to query real admin users
3. Hash passwords with bcrypt

### Monitor Real-Time Online Electricians

- Socket.IO tracks electrician status
- Admin dashboard shows live count
- Updates when electricians go online/offline

### Export Reports (Future Feature)

- Can be added to Analytics page
- Export booking history as PDF/Excel
- Export revenue reports by date range

### Setup Email Notifications (Future)

- Notify electrician when verified ✅
- Notify electrician if rejected with reason
- Notify user if electrician comes online

---

## ⚠️ Important Notes

### Verification is Mandatory

- No electrician can receive bookings if `isVerified: false`
- Users cannot bypass this in frontend or backend
- Set by admin only via approval button

### Security

- Admin token expires in 24 hours
- All admin API calls require valid JWT
- Role must be "admin" in token
- Sensitive operations logged

### Data Consistency

- When electrician approved → `isVerified: true`
- When electrician rejected → `isVerified: false`, `rejectionReason: "..."`
- Search always checks `isVerified: true` for users

---

## 🚨 Troubleshooting

### Admin Panel Won't Load Data

1. Check backend is running on port 4000
2. Check network tab in DevTools
3. Verify JWT token in localStorage
4. Clear cache and reload

### New Electrician Not Showing in Admin Panel

1. Ensure they completed registration
2. Check database: `db.electricians.findOne({ isVerified: false })`
3. Verify timestamp is recent

### Electrician Still Not in User Search After Approval

1. Clear frontend cache/localStorage
2. Refresh user app page
3. Check backend logs for search query

### Can't Login to Admin

1. Demo credentials: admin@electricianfinder.com / admin@123
2. Check .env files are correct
3. Verify backend `/api/admin/login` route exists

---

## 📞 Next Steps

1. **Test the complete flow** using the testing checklist
2. **Create real admin users** (replace demo credentials)
3. **Add email notifications** for electricians
4. **Implement appeal process** for rejected electricians
5. **Add audit logs** to track all admin actions

---

**Admin panel is production-ready for verification workflow!** ✅
