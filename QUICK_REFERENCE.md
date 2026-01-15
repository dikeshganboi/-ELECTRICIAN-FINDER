# 🚀 QUICK REFERENCE CARD

## Access Points

| Service     | URL                   | Port | Credentials                             |
| ----------- | --------------------- | ---- | --------------------------------------- |
| User App    | http://localhost:3000 | 3000 | Use any test account                    |
| Admin Panel | http://localhost:3001 | 3001 | admin@electricianfinder.com / admin@123 |
| Backend API | http://localhost:4000 | 4000 | -                                       |

---

## 🔄 The Verification Flow (One Page)

```
1. ELECTRICIAN SIGNS UP
   ↓
   Database: isVerified = false ❌

2. ELECTRICIAN COMPLETES PROFILE
   ↓
   Can go online, but NOT in user search ❌

3. ADMIN VIEWS VERIFICATION PANEL
   ↓
   Admin → Sidebar → Verification → Sees pending electricians

4. ADMIN APPROVES
   ↓
   Database: isVerified = true ✅

5. USER SEARCHES & FINDS ELECTRICIAN
   ↓
   Backend filters: isVerified = true (mandatory) ✅
   User can now book this electrician
```

---

## 📋 Critical Database Field

**Electricians Collection:**

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  skills: ["Wiring", "Troubleshooting"],
  isVerified: false,  // ← THIS CONTROLS EVERYTHING
  baseRate: 500,
  documents: [
    { type: "aadhaar", url: "..." },
    { type: "certificate", url: "..." }
  ],
  rating: 0,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Rules:**

- `isVerified: false` = Hidden from users ❌
- `isVerified: true` = Visible to users ✅
- Only admin can change this field

---

## 🛠️ API Endpoints (Admin Uses These)

```bash
# Get pending electricians
GET /api/admin/electricians?status=pending

# Approve electrician
PATCH /api/admin/electricians/{id}/approve

# Reject electrician
PATCH /api/admin/electricians/{id}/reject
{ "reason": "Invalid documents" }

# Get dashboard stats
GET /api/admin/stats
```

## 🔍 Search Endpoint (Users Use This)

```bash
# Search nearby electricians (AUTO-FILTERS isVerified:true)
GET /api/search/nearby?lat=21.14&lng=73.85&skill=Wiring

# Backend logic:
# Users ALWAYS get: isVerified: true
# Users NEVER see: isVerified: false
# No bypass possible
```

---

## ✅ Testing Checklist (5 Minutes)

- [ ] New electrician registration → appears in admin verification
- [ ] Admin approves electrician → disappears from admin panel
- [ ] Approved electrician appears in user search ✅
- [ ] New electrician NOT in user search before approval ❌
- [ ] Admin can reject and see rejection reason

---

## 📊 Admin Panel Sections

| Section      | Purpose        | Shows                                    |
| ------------ | -------------- | ---------------------------------------- |
| Dashboard    | Overview       | Real-time stats, metrics                 |
| Verification | Approve/Reject | Pending electricians with documents      |
| Electricians | Management     | All electricians (verified & unverified) |
| Users        | Support        | All users, can block                     |
| Bookings     | Tracking       | All bookings, revenue                    |
| Disputes     | Resolution     | Customer complaints                      |
| Analytics    | Reports        | Charts, trends, top electricians         |
| Settings     | Config         | Commission %, policies                   |

---

## 🔒 Security Model

```
Regular User Search:
GET /api/search/nearby?...
↓
Backend checks: isVerified: true ✅ (mandatory)
↓
Returns: Only verified electricians ✅
❌ NO WAY TO BYPASS ❌

Admin Panel:
GET /api/admin/electricians?status=pending
↓
Requires: Authorization header with admin JWT
↓
Returns: All electricians (verified & unverified)
```

---

## 📞 Common Questions

**Q: How do new electricians get visible?**  
A: Only when admin approves them in verification panel. Then `isVerified: true`.

**Q: Can users see unverified electricians?**  
A: No. Backend hardcodes `isVerified: true` for user searches.

**Q: What if admin rejects?**  
A: `isVerified` stays `false`. Electrician hidden from users. Can resubmit.

**Q: Where do I see pending electricians?**  
A: Admin Panel → Click "Verification" in sidebar.

**Q: How do I approve electrician?**  
A: Click eye icon → Review documents → Click "Approve" button.

**Q: How do users find electricians?**  
A: App → Search by location/skills → Only verified ones shown.

**Q: What shows in dashboard?**  
A: Total users, electricians, online now, today's bookings, revenue.

**Q: Can I see live electricians online?**  
A: Yes, real-time count updates every 10 seconds.

---

## 🚀 Start Commands

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: User Frontend
cd frontend
npm run dev

# Terminal 3: Admin Panel
cd admin
npm run dev
```

---

## 📁 Key Files Modified

- ✅ `backend/src/infra/db/models/electrician.model.ts` - Added documents array
- ✅ `backend/src/application/search.service.ts` - Enforces isVerified:true
- ✅ `backend/src/interfaces/http/routes/search.routes.ts` - No bypass for users
- ✅ `backend/src/interfaces/http/admin.routes.ts` - Verification endpoints
- ✅ `admin/app/dashboard/verification/page.tsx` - Verification UI

---

## 💡 How It Works (Simple Explanation)

**Before:**

- Anyone could find any electrician
- Unverified electricians appeared in search
- No control over who's visible

**After:**

- New electricians hidden by default (`isVerified: false`)
- Only admin can make them visible (`isVerified: true`)
- Users search only gets verified ones
- Backend enforces this (no bypasses)

**Result:**

- Platform has quality control
- Only verified electricians get bookings
- Users trust the system
- Admin has full control

---

## 🎯 What Changed in This Update

1. ✅ Electrician model now has `documents` array
2. ✅ Search service enforces `isVerified: true`
3. ✅ Search route doesn't let users bypass filter
4. ✅ Admin routes map `isVerified` to `verificationStatus`
5. ✅ Admin panel shows real data from backend
6. ✅ Dashboard fetches real stats
7. ✅ Complete documentation added

---

**Everything is connected and working together!** ✅

Real data → Real verification → Real filtering → Real results
