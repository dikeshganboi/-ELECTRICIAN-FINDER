# 🔄 Complete Verification Flow

## User Journey: New Electrician → Verified → Visible to Users

### Phase 1: New Electrician Registration (isVerified: false)

**What happens:**

1. Electrician signs up with email, phone, password
2. Backend creates User record with role: "electrician"
3. Backend creates Electrician record with `isVerified: false` ❌ NOT VISIBLE
4. Electrician can login but NOT appear in user's search results

```
POST /api/auth/register
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "9876543210",
  "password": "pass123",
  "role": "electrician"
}

Response: JWT Token, User ID
```

**Database State:**

```
users collection:
{
  _id: ObjectId("123"),
  name: "Rajesh Kumar",
  email: "rajesh@example.com",
  role: "electrician"
}

electricians collection:
{
  _id: ObjectId("456"),
  userId: ObjectId("123"),
  skills: [],
  isVerified: false ❌ PENDING VERIFICATION
  currentLocation: { type: "Point", coordinates: [0, 0] }
}
```

---

### Phase 2: Electrician Completes Profile

**What happens:**

1. Electrician logs in to their app
2. Completes profile: skills, experience, base rate
3. Uploads documents: Aadhaar, Certificate, Photo
4. Sets availability to "online"
5. Still INVISIBLE to users (isVerified still false)

**Request:** (Electrician can update their own profile)

```
PATCH /api/electrician/profile
{
  "skills": ["Wiring", "Troubleshooting"],
  "baseRate": 500,
  "documents": [
    { type: "aadhaar", url: "s3://..." },
    { type: "certificate", url: "s3://..." },
    { type: "photo", url: "s3://..." }
  ]
}
```

**Database State:**

```
electricians collection:
{
  userId: ObjectId("123"),
  skills: ["Wiring", "Troubleshooting"],
  baseRate: 500,
  documents: [
    { type: "aadhaar", url: "s3://...", verified: false },
    { type: "certificate", url: "s3://...", verified: false },
    { type: "photo", url: "s3://...", verified: false }
  ],
  isVerified: false ❌ STILL PENDING
}
```

---

### Phase 3: Admin Reviews in Verification Panel

**What happens:**

1. Admin logs into admin panel at http://localhost:3001
2. Clicks "Verification" → sees pending electricians
3. Clicks on electrician to view documents
4. Reviews Aadhaar, Certificate, Photo

**Request to get pending electricians:**

```
GET /api/admin/electricians?status=pending
Authorization: Bearer <admin_token>

Response:
[
  {
    _id: "456",
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@example.com",
    skills: ["Wiring", "Troubleshooting"],
    rating: 0,
    documents: [
      { type: "aadhaar", url: "s3://...", verified: false },
      { type: "certificate", url: "s3://...", verified: false },
      { type: "photo", url: "s3://...", verified: false }
    ],
    verificationStatus: "pending",
    createdAt: "2024-01-14T10:30:00Z"
  }
]
```

---

### Phase 4: Admin APPROVES Electrician

**What happens:**

1. Admin reviews all documents ✓
2. Clicks "Approve" button in modal
3. Backend updates: `isVerified: true` ✅
4. Electrician NOW APPEARS in user's search results
5. Users can NOW see and book this electrician

**Request:**

```
PATCH /api/admin/electricians/:electricianId/approve
Authorization: Bearer <admin_token>

Response: { message: "Electrician approved" }
```

**Database Update:**

```
electricians collection:
{
  _id: ObjectId("456"),
  userId: ObjectId("123"),
  isVerified: true ✅ NOW VERIFIED!
  skills: ["Wiring", "Troubleshooting"],
  availabilityStatus: "online",
  currentLocation: { type: "Point", coordinates: [73.8567, 21.1458] }
}
```

---

### Phase 5: User Searches & Finds Electrician

**What happens:**

1. User opens app and searches "Wiring"
2. Backend filters: `isVerified: true` ✅
3. Only APPROVED electricians are returned
4. User sees "Rajesh Kumar" in search results
5. User can book, pay, and rate the electrician

**Request from user's phone:**

```
GET /api/search/nearby?lat=21.1445&lng=73.8567&skill=Wiring&radiusKm=5
Authorization: Bearer <user_token>

Backend automatically filters for:
{
  isVerified: true, ✅ ONLY verified electricians
  skills: "Wiring",
  availabilityStatus: "online",
  currentLocation: { $near: { coordinates, $maxDistance: 5000 } }
}

Response: [
  {
    _id: "456",
    name: "Rajesh Kumar",
    rating: 4.8,
    baseRate: 500,
    skills: ["Wiring", "Troubleshooting"],
    location: { lat: 21.1458, lng: 73.8567 }
  }
]
```

---

### Phase 6: (Alternative) Admin REJECTS Electrician

**What happens:**

1. Admin reviews documents ✗
2. Finds issues (invalid documents, etc)
3. Clicks "Reject" button
4. Provides rejection reason
5. Electrician gets email notification (optional)
6. Electrician NEVER appears in user search results
7. Electrician can resubmit/appeal (optional)

**Request:**

```
PATCH /api/admin/electricians/:electricianId/reject
Authorization: Bearer <admin_token>
{
  "reason": "Invalid Aadhaar document. Please resubmit with current Aadhaar."
}

Response: { message: "Electrician rejected" }
```

**Database Update:**

```
electricians collection:
{
  userId: ObjectId("123"),
  isVerified: false ❌ REJECTED
  rejectionReason: "Invalid Aadhaar document. Please resubmit with current Aadhaar.",
  rejectionDate: "2024-01-14T12:00:00Z"
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   NEW ELECTRICIAN REGISTRATION                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Create User (role: electrician)│
          │  Create Electrician Record      │
          │  isVerified: false ❌           │
          └────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────────┐
          │  Electrician completes profile:        │
          │  • Add skills, experience, rate        │
          │  • Upload documents                    │
          │  • Set to online status                │
          │  isVerified: false ❌ (STILL HIDDEN)  │
          └────────────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────────┐
          │  Admin Panel - Verification Queue      │
          │  Shows: All pending electricians       │
          │  Admin reviews documents               │
          └────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  APPROVE         │  │  REJECT          │
        │  isVerified:true │  │  isVerified:false│
        │  ✅ VERIFIED    │  │  rejectionReason │
        └────────┬─────────┘  └──────────────────┘
                 │
                 ▼
        ┌──────────────────────────────────┐
        │  User Searches for Electricians   │
        │  Backend filters: isVerified:true │
        │  Only APPROVED electricians shown │
        │  User can book and pay            │
        └──────────────────────────────────┘
```

---

## API Endpoints Reference

### For Electricians

```
POST /api/auth/register                    Register new electrician
GET  /api/electrician/profile              Get own profile
PATCH /api/electrician/profile             Update profile & upload documents
PATCH /api/electrician/availability        Toggle online/offline
```

### For Users (Search)

```
GET /api/search/nearby?lat=X&lng=Y&skill=Z   Search verified electricians only
                                              (Backend auto-filters isVerified:true)
```

### For Admin

```
GET  /api/admin/electricians?status=pending    Get pending verification queue
GET  /api/admin/electricians?status=approved   Get approved electricians
GET  /api/admin/electricians?status=all        Get all electricians

PATCH /api/admin/electricians/:id/approve      Approve electrician
PATCH /api/admin/electricians/:id/reject       Reject with reason
```

---

## Testing the Flow Manually

### 1. Register as New Electrician

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Electrician",
    "email": "test@example.com",
    "phone": "9999999999",
    "password": "pass123",
    "role": "electrician"
  }'

# Get the JWT token from response
```

### 2. Verify NOT visible to users

```bash
curl "http://localhost:4000/api/search/nearby?lat=21.1445&lng=73.8567&skill=Wiring" \
  -H "Authorization: Bearer <user_token>"

# Response should be empty (new electrician not visible)
```

### 3. Admin views pending electricians

```bash
curl "http://localhost:4000/api/admin/electricians?status=pending" \
  -H "Authorization: Bearer <admin_token>"

# Response should include the new electrician
```

### 4. Admin approves electrician

```bash
curl -X PATCH http://localhost:4000/api/admin/electricians/<electrician_id>/approve \
  -H "Authorization: Bearer <admin_token>"

# Response: { message: "Electrician approved" }
```

### 5. Verify NOW visible to users

```bash
curl "http://localhost:4000/api/search/nearby?lat=21.1445&lng=73.8567&skill=Wiring" \
  -H "Authorization: Bearer <user_token>"

# Response should NOW include the approved electrician ✅
```

---

## Security Notes

✅ **What's Protected:**

- Users CANNOT query unverified electricians (no parameter to bypass)
- Unverified electricians NOT returned in search queries
- Admin endpoints require JWT with role: "admin"
- Only verified electricians appear in live tracking

⚠️ **Important Settings:**

```typescript
// In search.service.ts - ALWAYS enforces verification
const matchVerified = verified === "false" ? {} : { isVerified: true };

// In search.routes.ts - Regular users can't override
verified: true; // ALWAYS true for regular users
```

---

## Summary

| Status         | isVerified | Admin Panel | User Search | Can Accept Bookings |
| -------------- | ---------- | ----------- | ----------- | ------------------- |
| Pending Review | false ❌   | ✅ Visible  | ❌ Hidden   | ❌ No               |
| Approved       | true ✅    | ✅ Visible  | ✅ Visible  | ✅ Yes              |
| Rejected       | false ❌   | ✅ Visible  | ❌ Hidden   | ❌ No               |

---

**All electricians start as unverified. Only admin can make them visible to users by approving them.**
