# ✅ IMPLEMENTATION PLAN: PRODUCTION VERIFICATION SYSTEM

## Current State vs. Target State

### Current Implementation (PHASE 1 - COMPLETE)

- ✅ Basic isVerified field exists
- ✅ Documents array schema implemented
- ✅ Basic admin approval/rejection endpoints
- ✅ Admin panel UI created

### Target Implementation (PHASE 2 - THIS PLAN)

- 🔲 **Electrician-side UI**: Verification submission form with document upload
- 🔲 **Verification status page** with clear state machine
- 🔲 **Backend validation** for all requirements
- 🔲 **Resubmission logic** with 24-hour restriction
- 🔲 **Search filter** enforcement
- 🔲 **Online status gating** (only verified can go online)
- 🔲 **Audit logging** for compliance
- 🔲 **Notification system** (email + SMS + in-app)
- 🔲 **Analytics dashboard** for admin

---

## PHASE 2A: DATABASE SCHEMA UPDATES

### Update Electrician Model

**File**: `backend/src/infra/db/models/electrician.model.ts`

**Changes Required**:

```typescript
// BEFORE:
documents: [{
  type: String,
  url: String,
  verified: Boolean
}]

// AFTER:
{
  verificationStatus: {
    type: String,
    enum: ["unverified", "pending", "approved", "rejected", "needs_info", "revoked"],
    default: "unverified"
  },

  verificationSubmissions: [{
    submissionId: String,
    submittedAt: Date,
    status: String,
    documents: [{
      documentId: String,
      type: { type: String, enum: ["aadhaar", "certificate", "photo", "license"] },
      url: String,
      uploadedAt: Date,
      expiresAt: Date,
      verified: Boolean,
      adminNotes: String
    }],
    adminReview: {
      reviewedBy: String,
      reviewedAt: Date,
      decision: String,
      feedback: String,
      notes: String
    }
  }],

  currentVerification: {
    submissionId: String,
    status: String,
    submittedAt: Date,
    expiresAt: Date,
    lastRejectionReason: String
  },

  canGoOnline: { type: Boolean, default: false },

  complianceStatus: {
    documentsExpiring: Boolean,
    expiryDate: Date,
    requiresRenewal: Boolean
  },

  auditLog: [{
    action: String,
    changedBy: String,
    changedAt: Date,
    changes: Object
  }],

  verificationApprovedAt: Date,
  verificationExpiresAt: Date
}
```

**Action Item**: Use `db.electricians.updateMany()` to migrate existing records to set:

```javascript
db.electricians.updateMany(
  { verificationStatus: { $exists: false } },
  {
    $set: {
      verificationStatus: "unverified",
      canGoOnline: false,
      verificationSubmissions: [],
      currentVerification: {},
      complianceStatus: {},
      auditLog: [],
    },
  }
);
```

---

## PHASE 2B: BACKEND API IMPLEMENTATION

### 1. Verification Service Layer

**File**: `backend/src/application/verification.service.ts` (NEW)

```typescript
export class VerificationService {
  // 1. Get verification form (what docs are needed)
  async getVerificationForm(electricianId: string) {
    const electrician = await ElectricianModel.findOne({
      userId: electricianId,
    });

    // Check if already pending
    if (electrician.verificationStatus === "pending") {
      throw new Error("ALREADY_PENDING");
    }

    // Check 24-hour cooldown
    const lastRejection = electrician.verificationSubmissions
      .filter((s) => s.status === "rejected")
      .sort((a, b) => b.submittedAt - a.submittedAt)[0];

    if (lastRejection) {
      const hoursSince =
        (Date.now() - lastRejection.submittedAt) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        throw new Error("RESUBMIT_COOLDOWN", {
          canResubmitAt: new Date(
            lastRejection.submittedAt + 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    return {
      requiredDocuments: [
        { type: "aadhaar", required: true, expiryRequired: true },
        { type: "certificate", required: true, expiryRequired: false },
        { type: "photo", required: true, expiryRequired: false },
      ],
      previousSubmissions: electrician.verificationSubmissions,
    };
  }

  // 2. Submit verification with documents
  async submitVerification(
    electricianId: string,
    documents: File[],
    metadata: any
  ) {
    const electrician = await ElectricianModel.findOne({
      userId: electricianId,
    });

    // Validate
    this.validateSubmission(electrician);
    this.validateDocuments(documents);

    // Upload to S3
    const uploadedDocs = await Promise.all(
      documents.map((doc) => this.uploadDocumentToS3(doc))
    );

    // Create submission
    const submission = {
      submissionId: generateUUID(),
      submittedAt: new Date(),
      status: "pending",
      documents: uploadedDocs,
      adminReview: {},
    };

    // Update electrician
    const updatedElec = await ElectricianModel.findOneAndUpdate(
      { userId: electricianId },
      {
        $push: { verificationSubmissions: submission },
        $set: {
          verificationStatus: "pending",
          "currentVerification.submissionId": submission.submissionId,
          "currentVerification.status": "pending",
          "currentVerification.submittedAt": submission.submittedAt,
        },
        $push: {
          auditLog: {
            action: "verification_submitted",
            changedBy: electricianId,
            changedAt: new Date(),
            changes: { from: "unverified", to: "pending" },
          },
        },
      },
      { new: true }
    );

    // Send notification
    await this.notificationService.sendVerificationSubmitted(electrician.email);

    return submission;
  }

  // 3. Admin approve verification
  async approveVerification(
    submissionId: string,
    adminId: string,
    feedback: string
  ) {
    const electrician = await ElectricianModel.findOne({
      "verificationSubmissions.submissionId": submissionId,
    });

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    await ElectricianModel.updateOne(
      { "verificationSubmissions.submissionId": submissionId },
      {
        $set: {
          isVerified: true,
          canGoOnline: true,
          verificationStatus: "approved",
          "verificationSubmissions.$[sub].status": "approved",
          "verificationSubmissions.$[sub].adminReview": {
            reviewedBy: adminId,
            reviewedAt: new Date(),
            decision: "approved",
            feedback,
          },
          verificationApprovedAt: new Date(),
          verificationExpiresAt: expiryDate,
        },
        $push: {
          auditLog: {
            action: "verification_approved",
            changedBy: adminId,
            changedAt: new Date(),
            changes: { from: "pending", to: "approved" },
          },
        },
      },
      { arrayFilters: [{ "sub.submissionId": submissionId }] }
    );

    // Notify electrician
    await this.notificationService.sendVerificationApproved(
      electrician.email,
      electrician.phone
    );

    // Add to search index
    await this.searchIndexService.addVerifiedElectrician(electrician._id);
  }

  // 4. Admin reject verification
  async rejectVerification(
    submissionId: string,
    adminId: string,
    reason: string,
    internalNotes: string
  ) {
    const electrician = await ElectricianModel.findOne({
      "verificationSubmissions.submissionId": submissionId,
    });

    const resubmitAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await ElectricianModel.updateOne(
      { "verificationSubmissions.submissionId": submissionId },
      {
        $set: {
          verificationStatus: "rejected",
          "verificationSubmissions.$[sub].status": "rejected",
          "verificationSubmissions.$[sub].adminReview": {
            reviewedBy: adminId,
            reviewedAt: new Date(),
            decision: "rejected",
            feedback: reason,
            notes: internalNotes,
          },
          "currentVerification.lastRejectionReason": reason,
        },
        $push: {
          auditLog: {
            action: "verification_rejected",
            changedBy: adminId,
            changedAt: new Date(),
            changes: { from: "pending", to: "rejected", reason },
          },
        },
      },
      { arrayFilters: [{ "sub.submissionId": submissionId }] }
    );

    // Notify electrician
    await this.notificationService.sendVerificationRejected(
      electrician.email,
      reason,
      resubmitAt
    );
  }

  // 5. Request more information
  async requestMoreInfo(
    submissionId: string,
    adminId: string,
    feedback: string,
    deadline: number = 7
  ) {
    const resubmitDeadline = new Date(
      Date.now() + deadline * 24 * 60 * 60 * 1000
    );

    await ElectricianModel.updateOne(
      { "verificationSubmissions.submissionId": submissionId },
      {
        $set: {
          verificationStatus: "needs_info",
          "verificationSubmissions.$[sub].status": "needs_info",
          "verificationSubmissions.$[sub].adminReview.feedback": feedback,
        },
        $push: {
          auditLog: {
            action: "verification_needs_info",
            changedBy: adminId,
            changedAt: new Date(),
            changes: { from: "pending", to: "needs_info" },
          },
        },
      },
      { arrayFilters: [{ "sub.submissionId": submissionId }] }
    );
  }

  // Helper methods
  private validateSubmission(electrician: any) {
    if (electrician.verificationStatus === "pending") {
      throw new Error("ALREADY_PENDING");
    }

    const lastRejection = electrician.verificationSubmissions
      .filter((s) => s.status === "rejected")
      .sort((a, b) => b.submittedAt - a.submittedAt)[0];

    if (lastRejection) {
      const hoursSince =
        (Date.now() - lastRejection.submittedAt) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        throw new Error("RESUBMIT_COOLDOWN");
      }
    }
  }

  private validateDocuments(documents: File[]) {
    const required = ["aadhaar", "certificate", "photo"];
    const uploaded = documents.map((d) => d.fieldname);

    for (const req of required) {
      if (!uploaded.includes(req)) {
        throw new Error("MISSING_DOCUMENT", { type: req });
      }
    }

    // File size validation
    for (const doc of documents) {
      if (doc.fieldname === "photo" && doc.size > 2 * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE", { maxSize: "2MB" });
      }
      if (doc.size > 5 * 1024 * 1024) {
        throw new Error("FILE_TOO_LARGE", { maxSize: "5MB" });
      }
    }
  }
}
```

### 2. Update Electrician Routes

**File**: `backend/src/interfaces/http/routes/electrician.routes.ts`

```typescript
router.get("/verification-status", authMiddleware, async (req, res) => {
  const electrician = await ElectricianModel.findOne({ userId: req.user.id });

  res.json({
    verificationStatus: electrician.verificationStatus,
    isVerified: electrician.isVerified,
    canGoOnline: electrician.canGoOnline,
    currentSubmission: electrician.currentVerification,
    message: getStatusMessage(electrician.verificationStatus),
    nextAction: getNextAction(electrician.verificationStatus),
  });
});

router.get("/verification-form", authMiddleware, async (req, res) => {
  const form = await verificationService.getVerificationForm(req.user.id);
  res.json(form);
});

router.post(
  "/apply-for-verification",
  authMiddleware,
  upload.array("documents"),
  async (req, res) => {
    try {
      const submission = await verificationService.submitVerification(
        req.user.id,
        req.files,
        req.body
      );
      res.status(201).json({
        message: "Verification submitted",
        submissionId: submission.submissionId,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.patch("/availability", ensureVerified, async (req, res) => {
  // Go online - only if isVerified: true and verificationStatus: "approved"
  const electrician = await ElectricianModel.findOneAndUpdate(
    { userId: req.user.id },
    {
      isOnline: true,
      availabilityStatus: "online",
      lastActiveAt: new Date(),
      currentLocation: {
        type: "Point",
        coordinates: [req.body.lng, req.body.lat],
      },
    },
    { new: true }
  );

  // Broadcast via Socket.IO
  io.to(`elec:${electrician._id}`).emit("online_status_changed", {
    isOnline: true,
  });

  res.json({ message: "You are now online", electrician });
});
```

### 3. Update Admin Routes with Proper Endpoints

**File**: `backend/src/interfaces/http/admin.routes.ts`

```typescript
// Get verification queue
router.get("/verifications/queue", adminAuthMiddleware, async (req, res) => {
  const { status = "pending", page = 1, limit = 20 } = req.query;

  const query = {};
  if (status !== "all") query.verificationStatus = status;

  const submissions = await ElectricianModel.find(query)
    .sort({ "currentVerification.submittedAt": -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("userId", "email phone");

  res.json({
    total: await ElectricianModel.countDocuments(query),
    submissions: submissions.map(formatSubmissionForAdmin),
  });
});

// Get single submission for review
router.get(
  "/verifications/:submissionId",
  adminAuthMiddleware,
  async (req, res) => {
    const electrician = await ElectricianModel.findOne({
      "verificationSubmissions.submissionId": req.params.submissionId,
    }).populate("userId");

    const submission = electrician.verificationSubmissions.find(
      (s) => s.submissionId === req.params.submissionId
    );

    res.json({
      electrician: formatElectricianForAdmin(electrician),
      submission,
    });
  }
);

// Approve
router.patch(
  "/verifications/:submissionId/approve",
  adminAuthMiddleware,
  async (req, res) => {
    await verificationService.approveVerification(
      req.params.submissionId,
      req.user.id,
      req.body.feedback
    );

    res.json({ message: "Verified successfully" });
  }
);

// Reject
router.patch(
  "/verifications/:submissionId/reject",
  adminAuthMiddleware,
  async (req, res) => {
    await verificationService.rejectVerification(
      req.params.submissionId,
      req.user.id,
      req.body.reason,
      req.body.internalNotes
    );

    res.json({ message: "Rejected" });
  }
);

// Request info
router.patch(
  "/verifications/:submissionId/request-info",
  adminAuthMiddleware,
  async (req, res) => {
    await verificationService.requestMoreInfo(
      req.params.submissionId,
      req.user.id,
      req.body.feedback,
      req.body.deadline
    );

    res.json({ message: "Request sent" });
  }
);
```

---

## PHASE 2C: FRONTEND UI IMPLEMENTATION

### 1. Electrician Verification Form

**File**: `frontend/components/verification/VerificationForm.tsx` (NEW)

```typescript
export function VerificationForm() {
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = (type: string, file: File) => {
    setDocuments((prev) => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(documents).forEach(([type, file]) => {
        formData.append(type, file);
      });

      const response = await fetch("/api/electrician/apply-for-verification", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast.success("Verification submitted! ✅");
        // Redirect to verification status page
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Apply for Verification</h2>

      <div className="space-y-6">
        {/* Aadhaar Upload */}
        <DocumentUploadBox
          type="aadhaar"
          title="Aadhaar Card / ID Proof"
          description="Government-issued ID (not expired)"
          onUpload={(file) => handleFileUpload("aadhaar", file)}
          file={documents.aadhaar}
        />

        {/* Certificate Upload */}
        <DocumentUploadBox
          type="certificate"
          title="Skill Certificate"
          description="Electrical training or experience certificate"
          onUpload={(file) => handleFileUpload("certificate", file)}
          file={documents.certificate}
        />

        {/* Photo Upload */}
        <DocumentUploadBox
          type="photo"
          title="Profile Photo"
          description="Clear face photo (recent, professional)"
          onUpload={(file) => handleFileUpload("photo", file)}
          file={documents.photo}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!Object.keys(documents).length || loading}
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {loading ? "Submitting..." : "Submit for Verification"}
      </button>
    </div>
  );
}
```

### 2. Verification Status Page

**File**: `frontend/components/verification/VerificationStatus.tsx` (NEW)

```typescript
export function VerificationStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/electrician/verification-status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  if (!status) return <LoadingSpinner />;

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Status Badge */}
      <StatusBadge status={status.verificationStatus} />

      {status.verificationStatus === "unverified" && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Ready to get verified?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Complete verification to appear in user searches and accept
            bookings.
          </p>
          <Link
            href="/verification/apply"
            className="text-blue-600 font-semibold"
          >
            Apply for Verification →
          </Link>
        </div>
      )}

      {status.verificationStatus === "pending" && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Under Review ⏳</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your documents are being reviewed by our team.
          </p>
          <p className="text-xs text-gray-500">
            Estimated review time: 2-3 business days
          </p>
        </div>
      )}

      {status.verificationStatus === "approved" && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">Verified ✅</h3>
          <p className="text-sm text-gray-600 mb-4">
            You can now go online and accept bookings!
          </p>
          <button className="w-full bg-green-600 text-white py-2 rounded">
            Go Online
          </button>
        </div>
      )}

      {status.verificationStatus === "rejected" && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold mb-2">Verification Rejected ❌</h3>
          <p className="text-sm text-red-700 mb-4">
            {status.currentSubmission?.lastRejectionReason}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            You can reapply after{" "}
            {formatDate(status.currentSubmission?.resubmitAt)}
          </p>
          {/* Show reapply button if cooldown expired */}
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 2D: ADMIN PANEL ENHANCEMENTS

### Enhanced Verification Panel

**File**: `admin/app/dashboard/verification/page.tsx` (UPDATE)

```typescript
export default function VerificationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const res = await fetch("/api/admin/verifications/queue?status=pending");
    const data = await res.json();
    setSubmissions(data.submissions);
  };

  const handleApprove = async (submissionId: string) => {
    await fetch(`/api/admin/verifications/${submissionId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ feedback }),
      headers: { "Content-Type": "application/json" },
    });

    fetchSubmissions();
    setSelectedSubmission(null);
  };

  const handleReject = async (submissionId: string, reason: string) => {
    await fetch(`/api/admin/verifications/${submissionId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
      headers: { "Content-Type": "application/json" },
    });

    fetchSubmissions();
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-screen">
      {/* Queue List */}
      <div className="col-span-1 border-r overflow-y-auto">
        <h3 className="font-semibold p-4 border-b sticky top-0 bg-white">
          Pending ({submissions.length})
        </h3>

        {submissions.map((sub) => (
          <div
            key={sub.submissionId}
            onClick={() => setSelectedSubmission(sub)}
            className="p-4 border-b cursor-pointer hover:bg-gray-50"
          >
            <p className="font-semibold">{sub.electricianName}</p>
            <p className="text-sm text-gray-500">{sub.phone}</p>
            <p className="text-xs text-gray-400">
              {formatDate(sub.submittedAt)} ({sub.waitingDays}d)
            </p>
          </div>
        ))}
      </div>

      {/* Submission Review */}
      <div className="col-span-2 overflow-y-auto">
        {selectedSubmission ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {selectedSubmission.electricianName}
            </h2>

            {/* Profile Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded">
              <div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="font-semibold">{selectedSubmission.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-semibold">{selectedSubmission.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Experience</p>
                <p className="font-semibold">
                  {selectedSubmission.profile.yearsOfExperience} years
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Submitted</p>
                <p className="font-semibold">
                  {formatDate(selectedSubmission.submittedAt)}
                </p>
              </div>
            </div>

            {/* Document Review */}
            <h3 className="font-semibold mb-4">Documents</h3>
            <div className="space-y-4 mb-6">
              {selectedSubmission.documents.map((doc) => (
                <DocumentReviewCard key={doc.documentId} document={doc} />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 p-4 bg-gray-50 rounded">
              <button
                onClick={() => handleApprove(selectedSubmission.submissionId)}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                ✅ Approve
              </button>
              <button
                onClick={() =>
                  handleReject(selectedSubmission.submissionId, feedback)
                }
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a submission to review
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## PHASE 2E: MIDDLEWARE & GUARDS

### Verification Required Middleware

**File**: `backend/src/application/middleware/ensureVerified.ts` (NEW)

```typescript
export const ensureVerified = async (req, res, next) => {
  const electrician = await ElectricianModel.findOne({
    userId: req.user.id
  });

  if (!electrician) {
    return res.status(404).json({ error: "Electrician profile not found" });
  }

  if (electrician.verificationStatus !== "approved" || !electrician.isVerified) {
    return res.status(403).json({
      error: "VERIFICATION_REQUIRED",
      verificationStatus: electrician.verificationStatus,
      message: getStatusMessage(electrician.verificationStatus),
      nextSteps: getNextSteps(electrician.verificationStatus)
    });
  }

  // Check expiry
  if (electrician.verificationExpiresAt < new Date()) {
    return res.status(403).json({
      error: "VERIFICATION_EXPIRED",
      message: "Your verification has expired. Please renew."
    });
  }

  next();
};

// Apply to all protected electrician routes
app.patch('/api/electrician/availability', ensureVerified, ...);
app.post('/api/bookings/:bookingId/accept', ensureVerified, ...);
app.post('/api/location/stream', ensureVerified, ...);
```

---

## PHASE 2F: SEARCH FILTER ENFORCEMENT

### Update Search Service

**File**: `backend/src/application/search.service.ts` (UPDATE)

```typescript
export class SearchService {
  async searchElectricians(query: any) {
    // MANDATORY: Only search verified electricians
    const searchQuery = {
      ...query,
      isVerified: true, // ← ENFORCED
      verificationStatus: "approved", // ← ENFORCED
      isOnline: true,
    };

    // Geospatial search
    const electricians = await ElectricianModel.find(searchQuery)
      .where("currentLocation")
      .near({
        center: { type: "Point", coordinates: [query.lng, query.lat] },
        maxDistance: query.radius * 1000, // Convert km to meters
      })
      .select("profile currentLocation rating availabilityStatus skills")
      .lean();

    return electricians;
  }
}
```

**File**: `backend/src/interfaces/http/routes/search.routes.ts` (UPDATE)

```typescript
// User search - ALWAYS only verified
router.get("/api/search/electricians", async (req, res) => {
  const electricians = await searchService.searchElectricians({
    lat: parseFloat(req.query.lat),
    lng: parseFloat(req.query.lng),
    radius: parseFloat(req.query.radius) || 10,
    // NOTE: User cannot override verification filter
    // isVerified: true is ALWAYS enforced at service level
  });

  res.json(electricians);
});
```

---

## PHASE 2G: AUDIT LOGGING

### Audit Log Helper

**File**: `backend/src/application/audit.service.ts` (NEW)

```typescript
export class AuditService {
  async logChange(
    electricianId: string,
    action: string,
    changedBy: string,
    changes: any
  ) {
    await ElectricianModel.updateOne(
      { _id: electricianId },
      {
        $push: {
          auditLog: {
            action,
            changedBy,
            changedAt: new Date(),
            changes,
          },
        },
      }
    );
  }

  async getAuditLog(electricianId: string) {
    const electrician = await ElectricianModel.findById(electricianId).select(
      "auditLog"
    );

    return electrician.auditLog.sort((a, b) => b.changedAt - a.changedAt);
  }
}
```

---

## PHASE 2H: NOTIFICATION SYSTEM

### Notification Service

**File**: `backend/src/application/notification.service.ts` (NEW)

```typescript
export class NotificationService {
  async sendVerificationSubmitted(email: string, phone: string) {
    await this.emailService.send({
      to: email,
      subject: "Verification Request Received",
      template: "verification_submitted",
      data: { estimatedTime: "2-3 days" },
    });

    await this.smsService.send({
      to: phone,
      message:
        "Your verification request has been received. Review time: 2-3 days",
    });
  }

  async sendVerificationApproved(email: string, phone: string) {
    await this.emailService.send({
      to: email,
      subject: "✅ Verification Approved!",
      template: "verification_approved",
      data: {},
    });

    await this.smsService.send({
      to: phone,
      message:
        "Congratulations! You are now verified. Go online to accept bookings.",
    });
  }

  async sendVerificationRejected(
    email: string,
    phone: string,
    reason: string,
    resubmitAt: Date
  ) {
    await this.emailService.send({
      to: email,
      subject: "Verification Status Update",
      template: "verification_rejected",
      data: {
        reason,
        resubmitAt: formatDate(resubmitAt),
        feedbackLink: `${APP_URL}/verification/feedback`,
      },
    });

    await this.smsService.send({
      to: phone,
      message: `Verification rejected: ${reason}. You can reapply after ${formatTime(
        resubmitAt
      )}`,
    });
  }

  async sendNeedsMoreInfo(
    email: string,
    phone: string,
    feedback: string,
    deadline: Date
  ) {
    await this.emailService.send({
      to: email,
      subject: "Action Required: Verification Needs More Info",
      template: "verification_needs_info",
      data: { feedback, deadline: formatDate(deadline) },
    });

    await this.smsService.send({
      to: phone,
      message: `Verification needs more info. Deadline: ${formatDate(
        deadline
      )}`,
    });
  }
}
```

---

## IMPLEMENTATION TIMELINE

### Week 1: Backend Core

- [ ] Day 1: Database schema updates + migration
- [ ] Day 2: VerificationService implementation
- [ ] Day 3: Backend routes implementation
- [ ] Day 4: Audit logging
- [ ] Day 5: Testing

### Week 2: Frontend & Integration

- [ ] Day 1: Electrician verification form UI
- [ ] Day 2: Verification status page
- [ ] Day 3: Admin panel enhancements
- [ ] Day 4: Search filter enforcement
- [ ] Day 5: Testing

### Week 3: Notifications & Polish

- [ ] Day 1: Email/SMS notifications
- [ ] Day 2: In-app notifications
- [ ] Day 3: Error handling & edge cases
- [ ] Day 4: QA testing
- [ ] Day 5: Performance optimization

### Week 4: Deployment & Monitoring

- [ ] Day 1: Staging deployment
- [ ] Day 2: Production rollout
- [ ] Day 3: Monitoring & hotfixes
- [ ] Day 4-5: Buffer for issues

---

## TESTING CHECKLIST

```
Backend Tests:
[ ] Electrician can submit verification with all documents
[ ] Cannot submit twice (pending check)
[ ] Cannot resubmit < 24 hours (cooldown)
[ ] Admin can approve → electrician goes verified
[ ] Admin can reject → electrician gets notification
[ ] Audit log records all actions
[ ] Search only returns verified electricians
[ ] Unverified cannot go online
[ ] Verification expires after 1 year

Frontend Tests:
[ ] Form validates all required documents
[ ] Upload feedback clear
[ ] Status page shows correct state
[ ] Cannot apply for verification if already pending
[ ] Cannot go online if not verified
[ ] Error messages helpful

E2E Tests:
[ ] Full flow: Register → Apply → Admin Reviews → Approve → User sees in search
[ ] Full flow: Register → Apply → Admin Rejects → Reapply after 24h
[ ] Admin can view all submissions
[ ] Electrician receives all notifications
```

---

## PRODUCTION CHECKLIST

- [ ] Database backups configured
- [ ] S3 bucket for documents (encrypted, versioned)
- [ ] Email service (SendGrid/AWS SES) configured
- [ ] SMS service (Twilio) configured
- [ ] Rate limiting on verification endpoints
- [ ] Document scanning API (optional)
- [ ] GDPR/Privacy compliant
- [ ] Audit logs backed up separately
- [ ] Monitoring & alerts set up
- [ ] Rollback plan ready

This is your complete implementation roadmap for production verification system.
