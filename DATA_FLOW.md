# 🔗 COMPLETE DATA FLOW DIAGRAM

## Real-Time Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         ELECTRICIAN FINDER                           │
│                      Real-Time Data Architecture                      │
└──────────────────────────────────────────────────────────────────────┘


┌─────────────────────┐                           ┌──────────────────┐
│  USER FRONTEND      │                           │  ADMIN PANEL     │
│  (localhost:3000)   │                           │  (localhost:3001)│
│                     │                           │                  │
│ ┌─────────────────┐ │                           │ ┌──────────────┐ │
│ │ Search Page     │ │                           │ │ Login Page   │ │
│ └────────┬────────┘ │                           │ └──────┬───────┘ │
│          │          │                           │        │         │
│ ┌────────▼────────┐ │                           │ ┌──────▼───────┐ │
│ │ useBookingHook  │ │◄──────────────────────────┼─►│ AdminContext │ │
│ │ useSearch Hook  │ │                           │ │ (JWT token)  │ │
│ └────────┬────────┘ │                           │ └──────┬───────┘ │
│          │          │                           │        │         │
└──────────┼──────────┘                           └────────┼─────────┘
           │                                              │
           │ API Calls                                    │ API Calls
           │ (JWT: user)                                  │ (JWT: admin)
           │                                              │
           └──────────────────┬──────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  BACKEND (4000)   │
                    │                   │
        ┌───────────┼───────────────────┼──────────────┐
        │           │                   │              │
        │           │                   │              │
┌───────▼──────┐    │   ┌──────────────┐│    ┌────────▼─────────┐
│ Auth Routes  │    │   │Search Routes ││    │ Admin Routes     │
├──────────────┤    │   ├──────────────┤│    ├──────────────────┤
│ POST /login  │    │   │GET /nearby   ││    │GET /stats        │
│ POST /reg    │    │   │   +filters   ││    │GET /electricians │
│ POST /logout │    │   └──────────────┘│    │PATCH /approve    │
└──────────────┘    │        ▲▼          │    │PATCH /reject     │
                    │        ││          │    └──────────────────┘
                    │        ││ Enforces │
                    │        ││ Filter   │
        ┌───────────┼────────┼┼──────────┼──────────────┐
        │           │        ││          │              │
        │           │   ┌────┴┴──────┐   │              │
        │           │   │ SERVICES   │   │              │
        │           │   ├────────────┤   │              │
        │           │   │Search Svc  │   │              │
        │           │   │ (isVerified│   │              │
        │           │   │  : true)   │   │              │
        │           │   └────────────┘   │              │
        │           │                    │              │
        │           └────────────────────┘              │
        │                                               │
        └───────────────────┬──────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   MONGODB      │
                    │                │
    ┌───────────────┼────────────────┼──────────────┐
    │               │                │              │
┌───▼────────────┐  │  ┌────────────┐│  ┌─────────┐ │
│ Users:         │  │  │Electricians││  │Bookings│ │
├────────────────┤  │  ├────────────┤│  ├────────┤ │
│_id: ObjectId   │  │  │_id: ObjId  ││  │_id: ObjId
│name: String    │  │  │userId: ObjId  │status:String
│email: String   │  │  │skills: [...]  │amount:Number
│role: "user"    │  │  │baseRate:Num   │paymentStatus
│passwordHash    │  │  │isVerified:Bool│electricianId
└────────────────┘  │  │currentLocation││userId
                    │  │ {GeoJSON}    ││createdAt
                    │  │documents:[..]││updatedAt
                    │  │rating: Num    │
                    │  │rejectionReaso │
                    │  │createdAt      │
                    │  └────────────────
                    │
                    └────────────────────┘
```

---

## 1️⃣ NEW ELECTRICIAN REGISTRATION FLOW

```
USER APP (Frontend)                    BACKEND (API)                 MONGODB
─────────────────────────────────────────────────────────────────────────────

Electrician registers:
Name: Rajesh
Email: rajesh@example.com
Password: pass123
Role: electrician

                                POST /api/auth/register
                        ─────────────────────────────────►
                                                        Create User:
                                                        {
                                                          name: "Rajesh",
                                                          email: "rajesh@example.com",
                                                          role: "electrician",
                                                          passwordHash: bcrypt(pass123)
                                                        }
                                                        ↓ INSERT
                                                        users.insertOne(...)

                                                        Create Electrician:
                                                        {
                                                          userId: user._id,
                                                          skills: [],
                                                          isVerified: false ❌
                                                          availabilityStatus: "offline",
                                                          currentLocation: {...}
                                                        }
                                                        ↓ INSERT
                                                        electricians.insertOne(...)

                        ◄─────────────────────────────────
                        Response: { token, user }

JWT Token stored in localStorage

                        ✅ Electrician can login
                        ❌ But NOT visible to users yet
                        ❌ Stays isVerified: false
```

---

## 2️⃣ ELECTRICIAN COMPLETES PROFILE

```
ELECTRICIAN APP                        BACKEND                     MONGODB
───────────────────────────────────────────────────────────────────────────

Electrician:
- Adds skills: ["Wiring", "Troubleshooting"]
- Uploads documents:
  * Aadhaar: s3://...
  * Certificate: s3://...
  * Photo: s3://...
- Sets base rate: 500
- Goes online

                        PATCH /api/electrician/profile
                        ───────────────────────────────►
                                                    UPDATE electrician:
                                                    {
                                                      skills: [...],
                                                      documents: [...],
                                                      baseRate: 500,
                                                      availabilityStatus: "online",
                                                      isVerified: false ❌ STILL!
                                                    }

                        ◄────────────────────────────────
                        Response: { profile updated }

                        ✅ Profile complete
                        ❌ Still NOT visible to users
                        ❌ Still isVerified: false
```

---

## 3️⃣ ADMIN VIEWS VERIFICATION QUEUE

```
ADMIN PANEL                            BACKEND                     MONGODB
────────────────────────────────────────────────────────────────────────────

Admin clicks: Sidebar → Verification

                        GET /api/admin/electricians?status=pending
                        Authorization: Bearer <admin_jwt>
                        ───────────────────────────────────────►
                                                        FIND electricians:
                                                        {
                                                          isVerified: false
                                                        }
                                                        .populate("userId")

                                                        RESULT:
                                                        [{
                                                          name: "Rajesh",
                                                          email: "rajesh@example.com",
                                                          skills: [...],
                                                          documents: [...],
                                                          verificationStatus: "pending"
                                                        }]

                        ◄─────────────────────────────────────────
                        Response: [ electrician object ]

                        ✅ Admin sees pending list
                        ✅ Admin can review documents
                        ✅ Admin can decide: Approve or Reject
```

---

## 4️⃣ ADMIN APPROVES ELECTRICIAN

```
ADMIN PANEL                            BACKEND                     MONGODB
────────────────────────────────────────────────────────────────────────────

Admin clicks: "Approve" button
(After reviewing documents)

                        PATCH /api/admin/electricians/{id}/approve
                        Authorization: Bearer <admin_jwt>
                        ─────────────────────────────────────────►
                                                        UPDATE electrician:
                                                        {
                                                          isVerified: true ✅
                                                        }

                                                        electricians.findByIdAndUpdate(
                                                          { _id: electricianId },
                                                          { isVerified: true }
                                                        )

                        ◄──────────────────────────────────────────
                        Response: { message: "Approved" }

                        ✅ Database updated
                        ✅ isVerified: true
                        ✅ NOW READY FOR USER SEARCH
```

---

## 5️⃣ USER SEARCHES FOR ELECTRICIAN

```
USER APP                               BACKEND                     MONGODB
────────────────────────────────────────────────────────────────────────────

User searches: "Wiring" at location (21.14, 73.85)

                        GET /api/search/nearby?
                            lat=21.14&
                            lng=73.85&
                            skill=Wiring&
                            radiusKm=5
                        Authorization: Bearer <user_jwt>
                        ───────────────────────────────────────►
                                                        Backend ALWAYS adds:
                                                        { isVerified: true }
                                                        (hardcoded, no bypass)

                                                        FIND electricians:
                                                        {
                                                          isVerified: true ✅,
                                                          skills: "Wiring",
                                                          availabilityStatus: "online",
                                                          currentLocation: {
                                                            $near: {
                                                              coordinates: [73.85, 21.14],
                                                              $maxDistance: 5000
                                                            }
                                                          }
                                                        }

                                                        RESULT:
                                                        [{
                                                          name: "Rajesh Kumar",
                                                          rating: 4.8,
                                                          skills: [...],
                                                          baseRate: 500,
                                                          currentLocation: {...}
                                                        }]

                        ◄────────────────────────────────────────────
                        Response: [ Rajesh Kumar's profile ]

                        ✅ Rajesh appears in search!
                        ✅ User sees full profile
                        ✅ User can now book
```

---

## 6️⃣ USER BOOKS ELECTRICIAN

```
USER APP                               BACKEND                     MONGODB
────────────────────────────────────────────────────────────────────────────

User clicks: "Book Now" on Rajesh's profile
Enters: Issue description, time
Clicks: "Request Booking"

                        POST /api/bookings/create
                        Authorization: Bearer <user_jwt>
                        {
                          electricianId: "456",
                          issueDescription: "Faulty wiring",
                          schedule: { date, time }
                        }
                        ────────────────────────────────────────►
                                                        CREATE booking:
                                                        {
                                                          userId: user._id,
                                                          electricianId: "456",
                                                          status: "requested",
                                                          amount: 500,
                                                          paymentStatus: "pending",
                                                          issueDescription: "Faulty wiring",
                                                          schedule: { date, time }
                                                        }
                                                        ↓ INSERT
                                                        bookings.insertOne(...)

                        ◄────────────────────────────────────────
                        Response: { bookingId: "..." }

                        ✅ Booking created!
                        ✅ Electrician gets notification
                        ✅ User sees booking in progress
```

---

## KEY: Search Filter Logic

```
┌─────────────────────────────────────────────────────────┐
│           SEARCH FILTER ENFORCEMENT                      │
└─────────────────────────────────────────────────────────┘

USER SEARCH REQUEST:
│
├─► Backend receives query
│
├─► Check: Is user authenticated? (via JWT)
│   └─ Yes → Continue
│   └─ No → Error 401
│
├─► Backend automatically adds filter:
│   └─ { isVerified: true }  ← HARDCODED (no parameter)
│
├─► User CANNOT override this:
│   └─ GET /api/search/nearby?verified=false
│       → Ignored! Still filters isVerified: true
│
├─► Query becomes:
│   {
│     isVerified: true,           ✅ REQUIRED
│     skills: "Wiring",
│     availabilityStatus: "online",
│     currentLocation: { $near: {...} }
│   }
│
└─► Result:
    ├─ Verified electricians returned ✅
    └─ Unverified electricians NEVER returned ❌
```

---

## ADMIN VERIFICATION STATISTICS

```
┌─────────────────────────────────────────────────────────┐
│        ADMIN SEES REAL-TIME STATISTICS                  │
└─────────────────────────────────────────────────────────┘

Dashboard → Stats update every 30 seconds

GET /api/admin/stats
Authorization: Bearer <admin_jwt>
                            │
                            ▼
    ┌───────────────────────────────────────┐
    │                                       │
    ├─ COUNT users                         │
    │  db.users.countDocuments()            │
    │  Result: 150                          │
    │                                       │
    ├─ COUNT electricians (ALL)            │
    │  db.electricians.countDocuments()     │
    │  Result: 45 (verified + unverified)   │
    │                                       │
    ├─ COUNT electricians (ONLINE)         │
    │  db.electricians.countDocuments({    │
    │    isOnline: true                     │
    │  })                                   │
    │  Result: 12                           │
    │                                       │
    ├─ COUNT bookings (TODAY)              │
    │  db.bookings.countDocuments({        │
    │    createdAt: { $gte: today }        │
    │  })                                   │
    │  Result: 34                           │
    │                                       │
    ├─ SUM revenue (TODAY)                 │
    │  db.bookings.aggregate([             │
    │    { $match: { status: "completed" }} │
    │    { $sum: "$amount" }               │
    │  ])                                   │
    │  Result: ₹12,500                      │
    │                                       │
    └─ COUNT active bookings               │
       db.bookings.countDocuments({        │
         status: { $in: ["accepted",       │
                        "in_progress"] }   │
       })                                   │
       Result: 8                            │

Response to Admin:
{
  totalUsers: 150,
  totalElectricians: 45,
  onlineElectricians: 12,
  todayBookings: 34,
  revenueToday: 12500,
  activeBookings: 8
}

✅ All real data from MongoDB
✅ Auto-refreshes every 30 seconds
```

---

## ALTERNATE FLOW: Admin Rejects Electrician

```
Admin Reviews Documents
        │
        ├─► Issues found!
        │   • Invalid Aadhaar
        │   • Blurry photo
        │
        ├─► Admin clicks "Reject"
        │
        ├─► Admin enters reason:
        │   "Invalid Aadhaar. Please resubmit with current document."
        │
        ├─► Backend:
        │
        │   PATCH /api/admin/electricians/{id}/reject
        │   {
        │     reason: "Invalid Aadhaar..."
        │   }
        │
        │   UPDATE electrician:
        │   {
        │     isVerified: false ❌ (stays false)
        │     rejectionReason: "Invalid Aadhaar..."
        │   }
        │
        ├─► Database updated
        │
        └─► Result:
            ✅ Electrician hidden from users
            ✅ Electrician sees rejection reason
            ✅ Can resubmit with corrections
            ✅ Admin sees in "Rejected" list
```

---

## SUMMARY: Data Flow

```
Registration
    ↓
Create User + Electrician (isVerified: false)
    ↓
Electrician Completes Profile (still isVerified: false)
    ↓
Admin Reviews in Verification Panel
    ↓
    ├─ APPROVE → isVerified: true ✅
    │           ↓
    │           User searches → Finds electrician ✅
    │           ↓
    │           User books electrician ✅
    │
    └─ REJECT → isVerified: false ❌
                ↓
                User searches → Electrician hidden ❌
```

---

**Every piece of data flows through the backend and database. No shortcuts. Complete verification system!** ✅
