# 🏗️ VERIFICATION SYSTEM: VISUAL ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELECTRICIAN FINDER PLATFORM                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐    ┌────────────────────┐    ┌───────────────┐
│   User App          │    │   Admin Panel      │    │ Electrician   │
│  (Port 3000)        │    │  (Port 3001)       │    │ App (Port 3000)│
│                     │    │                    │    │               │
│ • Search           │    │ • Verification    │    │ • Apply for   │
│ • View Map         │    │ • Review Docs     │    │   Verification│
│ • Book Electrician │    │ • Approve/Reject  │    │ • View Status │
│                     │    │ • Analytics       │    │ • Update      │
└──────────┬──────────┘    └────────┬───────────┘    │   Profile     │
           │                        │                │ • Go Online   │
           │                        │                │ • Accept Jobs │
           └────────────────────┬───┴────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
           ┌────▼─────────────┐    ┌──────────▼──────┐
           │   Express API    │    │  Socket.IO      │
           │   (Port 4000)    │    │  Real-time      │
           │                  │    │  Location       │
           │ • Auth Routes    │    │  Tracking       │
           │ • Search Routes  │    │                 │
           │ • Booking Routes │    │                 │
           │ • Admin Routes   │    │                 │
           └────┬─────────────┘    └──────────┬──────┘
                │                             │
                └─────────────────┬───────────┘
                                  │
                        ┌─────────▼────────┐
                        │    MongoDB       │
                        │                  │
                        │ • Users          │
                        │ • Electricians   │
                        │ • Bookings       │
                        │ • Submissions    │
                        │ • Audit Logs     │
                        └──────────────────┘
```

---

## Verification Flow: Complete User Journey

```
START: NEW ELECTRICIAN
│
├─ Registration
│  ├─ Email + Phone
│  ├─ Create User account
│  └─ Create Electrician profile
│     └─ isVerified: false
│     └─ verificationStatus: "unverified"
│     └─ canGoOnline: false
│
├─ Profile Update (ALLOWED)
│  ├─ Update name, phone, experience
│  ├─ Add skills
│  ├─ Set service area
│  └─ Upload profile photo (not verification)
│
├─ Try to Go Online
│  ├─ Click "Go Online" button
│  ├─ Backend checks: ensureVerified middleware
│  ├─ Response: ❌ "NOT_VERIFIED - Please complete verification first"
│  └─ Redirect to: "Apply for Verification" page
│
├─ APPLY FOR VERIFICATION (User Action)
│  ├─ Fetch: GET /api/electrician/verification-form
│  │  └─ Returns: Required documents + previous submissions
│  │
│  ├─ Upload Documents (Form)
│  │  ├─ Aadhaar Card (government ID)
│  │  ├─ Skill Certificate
│  │  └─ Profile Photo
│  │
│  ├─ Submit: POST /api/electrician/apply-for-verification
│  │  └─ Backend validation:
│  │     ├─ Check: Not already pending
│  │     ├─ Check: 24 hours since last rejection
│  │     ├─ Check: All documents provided
│  │     └─ Check: File sizes valid
│  │
│  ├─ Create Submission in DB
│  │  ├─ submissionId: UUID
│  │  ├─ verificationStatus: "pending"
│  │  ├─ documents: [aadhaar, certificate, photo]
│  │  └─ Store documents in S3 (encrypted)
│  │
│  └─ Notify Electrician
│     ├─ Email: "Your verification is under review"
│     ├─ SMS: "Estimated review: 2-3 days"
│     └─ In-app notification
│
├─ WAITING STATE (2-3 Days)
│  ├─ Electrician can: View status page
│  ├─ Electrician can: Update profile
│  ├─ Electrician CANNOT: Go online
│  ├─ Electrician CANNOT: Accept bookings
│  │
│  └─ User Search (Meanwhile)
│     ├─ User searches for electricians
│     ├─ Backend enforces: isVerified: true (HARDCODED)
│     ├─ Result: Electrician NOT visible (still pending) ✓
│     └─ Database Query Protection:
│        └─ Only returns: { isVerified: true, verificationStatus: "approved" }
│
├─ ADMIN REVIEWS (Day 2-3)
│  │
│  ├─ Admin logs into admin panel (port 3001)
│  ├─ Goes to: "Verification" tab
│  ├─ Sees: List of pending submissions (sorted by date)
│  │
│  ├─ Clicks on electrician
│  │  ├─ Views: Full profile
│  │  ├─ Views: All documents (with preview)
│  │  ├─ Reads: Years of experience, skills
│  │  └─ Checks: Previous submissions (if any)
│  │
│  ├─ Reviews Documents
│  │  ├─ Aadhaar: Is it valid? Not expired? Clear?
│  │  ├─ Certificate: Is it from recognized institution? Legit?
│  │  └─ Photo: Recent? Professional? Face visible?
│  │
│  └─ Makes Decision
│
├─ DECISION A: ✅ APPROVED
│  │
│  ├─ Admin clicks "Approve" button
│  │  ├─ Body: { feedback: "Welcome to platform" }
│  │  └─ PATCH /api/admin/verifications/:id/approve
│  │
│  ├─ Database Updates
│  │  ├─ isVerified: true  ✓
│  │  ├─ verificationStatus: "approved"  ✓
│  │  ├─ canGoOnline: true  ✓
│  │  ├─ verificationApprovedAt: now
│  │  ├─ verificationExpiresAt: now + 1 year
│  │  └─ auditLog: { action: "approved", reviewedBy: adminId, ... }
│  │
│  ├─ Notify Electrician
│  │  ├─ Email: "Congratulations! You are verified ✅"
│  │  ├─ SMS: "You can now go online to accept bookings"
│  │  └─ In-app: "Go Online" button now ENABLED
│  │
│  ├─ Search Index Updated
│  │  └─ Electrician now appears in user searches
│  │
│  └─ Electrician ONLINE (Next Step)
│     ├─ Click "Go Online"
│     ├─ PATCH /api/electrician/availability
│     │  └─ ensureVerified middleware checks:
│     │     ├─ isVerified: true ✓
│     │     ├─ verificationStatus: "approved" ✓
│     │     └─ canGoOnline: true ✓
│     │  └─ SUCCESS: Electrician goes online
│     │
│     └─ User Search NOW Returns This Electrician
│        ├─ GET /api/search/electricians
│        ├─ Backend query: { isVerified: true, isOnline: true }
│        ├─ Result: Electrician appears in search ✓
│        └─ User can book: SUCCESS ✓
│
├─ DECISION B: ❌ REJECTED
│  │
│  ├─ Admin clicks "Reject" button
│  │  ├─ Body: {
│  │  │   reason: "Aadhaar document is blurry",
│  │  │   internalNotes: "Quality too low for verification"
│  │  │ }
│  │  └─ PATCH /api/admin/verifications/:id/reject
│  │
│  ├─ Database Updates
│  │  ├─ verificationStatus: "rejected"
│  │  ├─ isVerified: false  (stays false)
│  │  ├─ canGoOnline: false  (stays false)
│  │  ├─ currentVerification.lastRejectionReason: "Aadhaar..."
│  │  └─ auditLog: { action: "rejected", reason, reviewedBy: adminId }
│  │
│  ├─ Notify Electrician
│  │  ├─ Email: "Verification Status: Rejected"
│  │  │  └─ Reason: "Aadhaar document is blurry and illegible"
│  │  ├─ SMS: "Verification rejected. Reason: [reason]"
│  │  ├─ In-app: Rejection reason + "Reapply after 24h"
│  │  └─ Email link: View detailed feedback
│  │
│  ├─ COOLDOWN: 24 HOURS
│  │  ├─ Electrician cannot resubmit for 24 hours
│  │  ├─ Try to resubmit before 24h:
│  │  │  └─ Error: "RESUBMIT_COOLDOWN - Try again in 2h 30m"
│  │  └─ After 24h: Can resubmit immediately
│  │
│  └─ RESUBMIT (After 24h)
│     ├─ Electrician takes better photo
│     ├─ Resubmits: POST /api/electrician/apply-for-verification
│     ├─ New submission created
│     ├─ Admin reviews again
│     └─ (Return to Approval/Rejection decision)
│
├─ DECISION C: 📋 NEEDS MORE INFO
│  │
│  ├─ Admin clicks "Request Info" button
│  │  ├─ Body: {
│  │  │   feedback: "Certificate is partially cut off. Please resubmit full document",
│  │  │   documentsToResubmit: ["certificate"],
│  │  │   deadline: 7
│  │  │ }
│  │  └─ PATCH /api/admin/verifications/:id/request-info
│  │
│  ├─ Database Updates
│  │  ├─ verificationStatus: "needs_info"
│  │  └─ auditLog: { action: "needs_info", feedback, ... }
│  │
│  ├─ Notify Electrician
│  │  ├─ Email: "We Need More Information"
│  │  │  └─ Feedback: "Certificate is partially cut off..."
│  │  ├─ SMS: "Resubmit documents by [deadline]"
│  │  ├─ In-app: Countdown timer to deadline
│  │  └─ Upload form: Resubmit specific documents
│  │
│  ├─ NO COOLDOWN
│  │  ├─ Electrician can resubmit immediately
│  │  ├─ Does not have to wait 24 hours
│  │  └─ Encouraged to fix quickly
│  │
│  └─ RESUBMIT (Immediately)
│     ├─ Electrician uploads better certificate
│     ├─ New submission created (new submissionId)
│     ├─ Admin reviews updated documents
│     └─ (Return to Approval/Rejection decision)
│
└─ END: ELECTRICIAN VERIFIED ✅
   ├─ isVerified: true
   ├─ Can go online
   ├─ Can accept bookings
   ├─ Appears in user search
   └─ Can stream live location
```

---

## Database Schema Relationships

```
┌──────────────┐         ┌──────────────┐
│     USER     │         │ ELECTRICIAN  │
├──────────────┤ 1 ─── * ├──────────────┤
│ _id          │         │ _id          │
│ email        │         │ userId ──────┼──→ USER._id
│ phone        │         │              │
│ name         │         │ isVerified   │ ← MAIN GATE
│              │         │ verification │
│              │         │ Status       │
│              │         │              │
│              │         │ verification │
│              │         │ Submissions[]│
│              │         │    ↓         │
│              │         │ [0] {        │
│              │         │  submissionId│
│              │         │  documents[] │
│              │         │    ↓         │
│              │         │  [0] {       │
│              │         │   type: str  │
│              │         │   url: S3    │
│              │         │   verified   │
│              │         │  }           │
│              │         │  adminReview │
│              │         │    ↓         │
│              │         │  {           │
│              │         │   reviewedBy │
│              │         │   decision   │
│              │         │   feedback   │
│              │         │  }           │
│              │         │ }            │
│              │         │              │
│              │         │ auditLog[]   │ ← COMPLIANCE
│              │         │              │
└──────────────┘         └──────────────┘
```

---

## Security: Three-Layer Defense

```
┌─────────────────────────────────────────────────────────┐
│              USER SEARCH REQUEST                         │
│     GET /api/search/electricians?lat=21&lng=73         │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────▼──────────────┐
        │    LAYER 1: BACKEND ENFORCES   │
        │                                │
        │ const query = {                │
        │   isVerified: true,            │ ← HARDCODED
        │   verificationStatus: "ap..",  │ ← NO BYPASS POSSIBLE
        │   isOnline: true               │
        │ }                              │
        │                                │
        │ User cannot pass:              │
        │ ?verified=false ← IGNORED      │
        │                                │
        └────────────────┬───────────────┘
                         │
                         ↓ Query Database
                         │
        ┌────────────────▼──────────────┐
        │    LAYER 2: INDEXES OPTIMIZE   │
        │                                │
        │ db.electricians.createIndex({  │
        │   isVerified: 1,               │
        │   isOnline: 1                  │
        │ })                             │
        │                                │
        │ Fast lookup of verified+online │
        │ (prevents slow unverified q.)  │
        │                                │
        └────────────────┬───────────────┘
                         │
                         ↓ Return Results
                         │
        ┌────────────────▼──────────────┐
        │    LAYER 3: FRONTEND DISPLAY   │
        │                                │
        │ Map shows only results         │
        │ User sees only verified        │
        │ (Even if somehow bypassed)     │
        │                                │
        └────────────────────────────────┘
```

---

## Admin Decision Path (Flow Chart)

```
                    ADMIN OPENS SUBMISSION
                           │
                           ▼
                   ┌─────────────────┐
                   │ REVIEW DOCUMENTS│
                   └────────┬────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
        APPROVED       REJECTED      NEEDS INFO
             │              │              │
             ▼              ▼              ▼
        ✅ APPROVE    ❌ REJECT    📋 REQUEST
             │              │              │
             ▼              ▼              ▼
      isVerified: true  stays false   stays false
      verificationStatus:  rejectedX  needs_info
      canGoOnline: true   false       false

             │              │              │
             ▼              ▼              ▼
      Notification:  Notification:  Notification:
      - Approved     - Rejected     - More info needed
      - Ready online - Reason       - What's needed
      - Get bookings - Can retry    - Deadline

             │              │              │
             ▼              ▼              ▼
      ✅ ONLINE     ⏳ COOLDOWN     📝 RESUBMIT
      USER BOOKS   24 HOURS       IMMEDIATELY
                   CAN'T RETRY    (NO COOLDOWN)
```

---

## Data at Each State

```
STATE 1: UNVERIFIED (Initial)
─────────────────────────────
electrician: {
  isVerified: false
  verificationStatus: "unverified"
  canGoOnline: false
  verificationSubmissions: []
  auditLog: [{ action: "profile_created" }]
}

STATE 2: PENDING (Submitted)
────────────────────────────
electrician: {
  isVerified: false
  verificationStatus: "pending"
  canGoOnline: false
  currentVerification: {
    submissionId: "sub-123"
    status: "pending"
    submittedAt: "2024-01-14T10:00:00Z"
  }
  verificationSubmissions: [{
    submissionId: "sub-123"
    status: "pending"
    documents: [aadhaar, certificate, photo]
    adminReview: {}  ← Empty (not reviewed yet)
  }]
  auditLog: [
    { action: "profile_created" },
    { action: "verification_submitted", changedBy: "electrician" }
  ]
}

STATE 3: APPROVED (By Admin)
───────────────────────────
electrician: {
  isVerified: true  ← CHANGED
  verificationStatus: "approved"  ← CHANGED
  canGoOnline: true  ← CHANGED
  verificationApprovedAt: "2024-01-14T11:00:00Z"
  verificationExpiresAt: "2025-01-14T11:00:00Z"
  currentVerification: {
    submissionId: "sub-123"
    status: "approved"
    submittedAt: "2024-01-14T10:00:00Z"
  }
  verificationSubmissions: [{
    submissionId: "sub-123"
    status: "approved"
    documents: [aadhaar, certificate, photo]
    adminReview: {
      reviewedBy: "admin-456"
      reviewedAt: "2024-01-14T11:00:00Z"
      decision: "approved"
      feedback: "All documents verified"
      notes: "Good quality documents"
    }
  }]
  auditLog: [
    { action: "profile_created" },
    { action: "verification_submitted", changedBy: "electrician" },
    { action: "verification_approved", changedBy: "admin-456" }  ← NEW
  ]
}

STATE 4: ONLINE (Electrician Initiated)
───────────────────────────────────────
electrician: {
  ... all approved fields ...
  isOnline: true  ← CHANGED
  availabilityStatus: "online"
  lastActiveAt: "2024-01-14T11:05:00Z"
  currentLocation: {
    type: "Point"
    coordinates: [73.85, 21.14]
  }
  auditLog: [
    ... previous entries ...
    { action: "went_online", changedBy: "electrician", ... }
  ]
}
```

---

## Real Scenario: User Searching

```
SCENARIO: User Search in Bombay, Radius 10km

USER ACTION:
└─ Open app
└─ Sees location: 19.076, 72.8776 (Bombay)
└─ Clicks: "Search for electricians"

REQUEST:
└─ GET /api/search/electricians?lat=19.076&lng=72.8776&radius=10

BACKEND (search.service.ts):
├─ Receives: { lat: 19.076, lng: 72.8776, radius: 10 }
│
├─ Creates query:
│  └─ {
│      isVerified: true,              ← HARDCODED (no bypass)
│      verificationStatus: "approved", ← HARDCODED (no bypass)
│      isOnline: true,
│      currentLocation: {
│        $near: {
│          $geometry: { type: "Point", coordinates: [72.8776, 19.076] },
│          $maxDistance: 10000  (10km in meters)
│        }
│      }
│    }
│
├─ Database Query:
│  └─ Searches all electricians with:
│      ✓ isVerified: true
│      ✓ verificationStatus: "approved"
│      ✓ isOnline: true
│      ✓ Within 10km radius
│
└─ Results:
   ├─ Electrician A: Verified ✅ Online ✅ 2km away
   ├─ Electrician B: Verified ✅ Online ✅ 5km away
   ├─ Electrician C: Verified ✅ Online ✅ 8km away
   │
   ├─ NOT Included:
   │  ├─ Electrician X: Pending (not verified yet)
   │  ├─ Electrician Y: Offline (verified but not online)
   │  ├─ Electrician Z: Rejected (not verified)
   │
   └─ RESULT: User sees only verified + online ✓

RESPONSE:
└─ [
    {
      _id: "123",
      profile: { name: "Raj Kumar", rating: 4.8 },
      location: { lat: 19.05, lng: 72.85 },
      distance: 2.1,  (2.1km away)
      skills: ["Wiring", "AC Installation"],
      ratePerHour: 300
    },
    ... more verified electricians ...
  ]
```

---

## Timeline Example

```
MONDAY 2024-01-08:
└─ 10:00 AM: Raj registers → isVerified: false

TUESDAY 2024-01-09:
└─ 2:30 PM: Raj applies for verification
   ├─ Uploads: Aadhaar, Certificate, Photo
   ├─ Status changes: pending
   └─ Email: "Review in 2-3 days"

WEDNESDAY 2024-01-10:
└─ 11:00 AM: Admin reviews Raj's documents
   ├─ Approves (all documents clear)
   ├─ Status changes: approved
   └─ Raj notified ✓

WEDNESDAY 2024-01-10:
└─ 11:15 AM: Raj goes online
   ├─ isOnline: true
   └─ Starts accepting bookings ✓

WEDNESDAY 2024-01-10:
└─ 11:20 AM: User searches for electricians
   ├─ Raj appears in search results ✓
   ├─ User books Raj ✓
   └─ Booking successful ✓

JANUARY 2025-01-08 (1 year later):
└─ Raj's verification expires
   ├─ Auto-notice: "Renew your verification"
   ├─ Raj can go offline OR renew
   └─ Can reapply immediately (no cooldown)
```

---

## Complete Picture

```
┌───────────────────────────────────────────────────────────────────┐
│                    PRODUCTION VERIFICATION SYSTEM                 │
│                      (Enterprise Ready)                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ✅ State Machine: Clear transitions                              │
│  ✅ Multiple Gates: Backend, Frontend, Admin                      │
│  ✅ Security: No bypasses possible                                │
│  ✅ Compliance: Audit trail for all actions                       │
│  ✅ UX: Clear messages at each state                              │
│  ✅ Scale: Millions of electricians                               │
│  ✅ Support: Dispute resolution ready                             │
│                                                                    │
│  This matches Uber/Ola/enterprise standards                       │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

---

## Next Step: Implementation

See: `IMPLEMENTATION_ROADMAP.md` for step-by-step build guide.

**Status: 🟢 READY TO BUILD**
