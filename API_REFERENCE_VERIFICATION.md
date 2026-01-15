# Verification Flow - API Reference Guide

## Base URL

```
http://localhost:4000/api
```

---

## 📋 API Endpoints for Verification Testing

### 1. REGISTER AS ELECTRICIAN

**Endpoint:**

```
POST /auth/register
```

**Request Body:**

```json
{
  "name": "Test Electrician",
  "email": "electrician.test@example.com",
  "phone": "9876543210",
  "password": "Test@123456",
  "role": "electrician",
  "serviceAreas": ["area1", "area2"],
  "address": {
    "street": "123 Test St",
    "city": "Test City",
    "state": "Test State",
    "pincode": "123456"
  }
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "electricianId": "507f1f77bcf86cd799439012",
    "email": "electrician.test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 2. LOGIN

**Endpoint:**

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "electrician.test@example.com",
  "password": "Test@123456"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": "507f1f77bcf86cd799439011",
      "email": "electrician.test@example.com",
      "role": "electrician"
    }
  }
}
```

---

### 3. GET VERIFICATION STATUS

**Endpoint:**

```
GET /verification/status
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "verificationStatus": "not_submitted",
    "canGoOnline": false,
    "documentsSubmitted": false,
    "lastSubmissionDate": null,
    "rejectionReason": null,
    "cooldownUntil": null,
    "needsInfoDeadline": null,
    "needsInfoMessage": null
  }
}
```

---

### 4. SUBMIT VERIFICATION DOCUMENTS

**Endpoint:**

```
POST /verification/submit
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

```
identityDocument: (file) - image or PDF of identity
licenseDocument: (file) - image or PDF of license
additionalInfo: (text, optional) - any additional notes
```

**cURL Example:**

```bash
curl -X POST http://localhost:4000/api/verification/submit \
  -H "Authorization: Bearer {token}" \
  -F "identityDocument=@/path/to/id.jpg" \
  -F "licenseDocument=@/path/to/license.jpg" \
  -F "additionalInfo=Additional information here"
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Documents submitted successfully",
  "data": {
    "verificationStatus": "pending_review",
    "submissionDate": "2026-01-15T11:30:00Z",
    "documentPaths": {
      "identityDocument": "uploads/verification/...",
      "licenseDocument": "uploads/verification/..."
    }
  }
}
```

---

### 5. GET ELECTRICIAN PROFILE

**Endpoint:**

```
GET /electricians/me
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "electricianId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Test Electrician",
    "email": "electrician.test@example.com",
    "phone": "9876543210",
    "isVerified": false,
    "verificationStatus": "pending_review",
    "isOnline": false,
    "documents": {
      "identityDocument": "uploads/verification/...",
      "licenseDocument": "uploads/verification/...",
      "submittedAt": "2026-01-15T11:30:00Z"
    }
  }
}
```

---

### 6. TOGGLE ONLINE STATUS

**Endpoint:**

```
PATCH /electricians/me/online
```

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "isOnline": true
}
```

**Response (if not verified):**

```json
{
  "statusCode": 403,
  "message": "You must be verified to go online",
  "error": "VERIFICATION_REQUIRED"
}
```

**Response (if verified):**

```json
{
  "statusCode": 200,
  "message": "Online status updated",
  "data": {
    "isOnline": true,
    "lastOnlineAt": "2026-01-15T11:35:00Z"
  }
}
```

---

## 👨‍💼 ADMIN ENDPOINTS

### 7. GET PENDING VERIFICATIONS

**Endpoint:**

```
GET /admin/verification/pending
```

**Headers:**

```
Authorization: Bearer {adminToken}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "count": 3,
    "verifications": [
      {
        "electricianId": "507f1f77bcf86cd799439012",
        "name": "Test Electrician",
        "email": "electrician.test@example.com",
        "phone": "9876543210",
        "verificationStatus": "pending_review",
        "submittedAt": "2026-01-15T11:30:00Z",
        "documents": {
          "identityDocument": "uploads/verification/...",
          "licenseDocument": "uploads/verification/..."
        }
      }
    ]
  }
}
```

---

### 8. APPROVE VERIFICATION

**Endpoint:**

```
POST /admin/verification/:electricianId/approve
```

**Headers:**

```
Authorization: Bearer {adminToken}
```

**Request Body:**

```json
{
  "comments": "All documents verified and approved"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Verification approved successfully",
  "data": {
    "electricianId": "507f1f77bcf86cd799439012",
    "verificationStatus": "approved",
    "approvedAt": "2026-01-15T11:40:00Z",
    "approvedBy": "admin_user_id",
    "comments": "All documents verified and approved"
  }
}
```

---

### 9. REJECT VERIFICATION

**Endpoint:**

```
POST /admin/verification/:electricianId/reject
```

**Headers:**

```
Authorization: Bearer {adminToken}
```

**Request Body:**

```json
{
  "reason": "License document is unclear. Please provide a better quality scan.",
  "comments": "Additional comments for the electrician"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Verification rejected successfully",
  "data": {
    "electricianId": "507f1f77bcf86cd799439012",
    "verificationStatus": "rejected",
    "rejectionReason": "License document is unclear. Please provide a better quality scan.",
    "rejectedAt": "2026-01-15T11:40:00Z",
    "rejectedBy": "admin_user_id",
    "cooldownUntil": "2026-02-14T11:40:00Z",
    "resubmissionAllowedAfter": "2026-02-14T11:40:00Z"
  }
}
```

---

### 10. REQUEST ADDITIONAL INFORMATION

**Endpoint:**

```
POST /admin/verification/:electricianId/request-info
```

**Headers:**

```
Authorization: Bearer {adminToken}
```

**Request Body:**

```json
{
  "message": "Please provide a clearer copy of your professional license. The current scan is too blurry.",
  "deadline": "2026-01-22",
  "comments": "Administrative notes"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Information request sent successfully",
  "data": {
    "electricianId": "507f1f77bcf86cd799439012",
    "verificationStatus": "needs_info",
    "infoRequest": {
      "message": "Please provide a clearer copy of your professional license...",
      "deadline": "2026-01-22",
      "requestedAt": "2026-01-15T11:40:00Z",
      "daysRemaining": 7
    },
    "requestedBy": "admin_user_id"
  }
}
```

---

### 11. RESUBMIT DOCUMENTS (after needs_info)

**Endpoint:**

```
POST /verification/resubmit
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

```
identityDocument: (file, optional) - updated identity document
licenseDocument: (file, optional) - updated license document
additionalInfo: (text) - response to admin's request
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Documents resubmitted successfully",
  "data": {
    "verificationStatus": "pending_review",
    "resubmittedAt": "2026-01-18T10:00:00Z",
    "previousRequest": {
      "status": "needs_info",
      "message": "Please provide a clearer copy...",
      "deadline": "2026-01-22"
    }
  }
}
```

---

### 12. GET VERIFICATION AUDIT LOG

**Endpoint:**

```
GET /admin/verification/:electricianId/audit-log
```

**Headers:**

```
Authorization: Bearer {adminToken}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "electricianId": "507f1f77bcf86cd799439012",
    "auditLog": [
      {
        "timestamp": "2026-01-15T11:30:00Z",
        "action": "DOCUMENTS_SUBMITTED",
        "actor": "electrician",
        "actorId": "507f1f77bcf86cd799439012",
        "details": {
          "documents": ["identityDocument", "licenseDocument"]
        }
      },
      {
        "timestamp": "2026-01-15T11:40:00Z",
        "action": "VERIFICATION_APPROVED",
        "actor": "admin",
        "actorId": "admin_user_id",
        "details": {
          "comments": "All documents verified and approved"
        }
      }
    ]
  }
}
```

---

## 🛠️ Testing with cURL

### Example: Complete Flow

**1. Register**

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Electrician",
    "email": "test@example.com",
    "password": "Test@123456",
    "phone": "9876543210",
    "role": "electrician",
    "serviceAreas": ["area1"]
  }'
```

**2. Submit Documents**

```bash
curl -X POST http://localhost:4000/api/verification/submit \
  -H "Authorization: Bearer {token}" \
  -F "identityDocument=@id.jpg" \
  -F "licenseDocument=@license.jpg"
```

**3. Admin Approve**

```bash
curl -X POST http://localhost:4000/api/admin/verification/{electricianId}/approve \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "comments": "Approved"
  }'
```

**4. Go Online**

```bash
curl -X PATCH http://localhost:4000/api/electricians/me/online \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "isOnline": true
  }'
```

---

## ❌ Error Responses

### Not Verified Error

```json
{
  "statusCode": 403,
  "message": "You must be verified to go online",
  "error": "VERIFICATION_REQUIRED"
}
```

### Cooldown Active

```json
{
  "statusCode": 400,
  "message": "You cannot resubmit documents during cooldown period",
  "error": "COOLDOWN_ACTIVE",
  "data": {
    "cooldownUntil": "2026-02-14T11:40:00Z"
  }
}
```

### Deadline Passed

```json
{
  "statusCode": 400,
  "message": "Deadline for information request has passed",
  "error": "DEADLINE_PASSED",
  "data": {
    "deadline": "2026-01-22"
  }
}
```

### Unauthorized

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "UNAUTHORIZED"
}
```

---

## 📊 Status Transition Diagram

```
not_submitted
    ↓ (submit docs)
pending_review
    ↓ (multiple outcomes)
    ├─ approve → approved (✓ can go online)
    ├─ reject → rejected (⏳ cooldown 30 days)
    └─ request-info → needs_info (⏰ deadline 7 days)
              ↓ (resubmit)
         pending_review
```

---

## 🔐 Authentication

All endpoints (except auth endpoints) require the `Authorization` header:

```
Authorization: Bearer {token}
```

Get token from login or register response. Token is typically valid for 15 minutes (JWT_ACCESS_TTL).
