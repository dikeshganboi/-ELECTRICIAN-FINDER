# End-to-End Verification Flow Testing Guide

## ✅ Server Status

All servers are running and ready for testing:

- **Backend API**: http://localhost:4000
- **Customer Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3001

---

## 📋 Testing Scenarios

### 1️⃣ REGISTER ELECTRICIAN ACCOUNT

**Goal**: Create a new electrician account and verify initial status

**Steps**:

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Select "Electrician" role
4. Fill in:
   - Name: `Test Electrician`
   - Email: `electrician.test@example.com`
   - Phone: `9876543210`
   - Password: `Test@123456`
   - Service Areas: Select at least 2 areas
5. Complete signup
6. Verify you're logged in (see electrician dashboard)

**Expected Result**:

- Electrician account created
- Status shows as "Not Submitted" in profile

---

### 2️⃣ CHECK INITIAL VERIFICATION STATUS

**Goal**: Verify the initial verification state

**Steps**:

1. After login, navigate to "Profile" or "Verification"
2. Check the current verification status
3. You should see: `Status: Not Submitted`

**Expected Result**:

```
Verification Status: not_submitted
Can Go Online: false
Documents: Not submitted
```

---

### 3️⃣ SUBMIT VERIFICATION DOCUMENTS

**Goal**: Upload identity and license documents

**Steps**:

1. In the electrician dashboard, find "Verification" or "Documents" section
2. Click "Submit Verification"
3. Upload:
   - **Identity Document** (ID/Passport): Upload a test image or PDF
   - **License Document** (Professional License): Upload a test image or PDF
4. Add any additional information in notes
5. Click "Submit for Review"

**Expected Result**:

```
Status changes to: pending_review
Message: "Documents submitted for admin review"
Resubmission disabled until admin decision
```

---

### 4️⃣ ADMIN APPROVAL FLOW

**Goal**: Test admin actions on verification requests

**Steps**:

#### 4a. Login to Admin Panel

1. Go to http://localhost:3001
2. Login with admin credentials (check backend config)
3. Navigate to "Verification" or "Electricians" section
4. Find the electrician you just created

#### 4b. Approve Verification

1. Click on the electrician's verification request
2. Review the submitted documents
3. Click "Approve"
4. Add optional comments: "All documents verified"
5. Submit

**Expected Result**:

```
Status: approved
Message: "Electrician verification approved"
Electrician can now go online
```

---

### 5️⃣ TEST REJECTION FLOW WITH COOLDOWN

**Goal**: Test rejection and cooldown period

**Steps**:

#### 5a. Create another electrician account

1. Register new electrician: `electrician.reject.test@example.com`
2. Submit documents for verification

#### 5b. Admin Rejection

1. Go to admin panel
2. Find this electrician's verification request
3. Click "Reject"
4. Add rejection reason: "License document unclear"
5. Submit

**Expected Result**:

```
Status: rejected
Cooldown period: 30 days (or configured time)
Resubmission available after: [date + 30 days]
Error message when trying to resubmit: "You can resubmit after [date]"
```

---

### 6️⃣ TEST NEEDS_INFO WITH DEADLINE

**Goal**: Test request-for-info flow

**Steps**:

#### 6a. Create third electrician

1. Register: `electrician.info.test@example.com`
2. Submit documents

#### 6b. Admin Requests Additional Info

1. Go to admin panel
2. Find electrician's verification request
3. Click "Request More Information"
4. Add request: "Please provide clearer copy of license (resolution too low)"
5. Set deadline (e.g., 7 days from now)
6. Submit

**Expected Result**:

```
Status: needs_info
Deadline: [date + 7 days]
Message: "Admin requests additional information"
Resubmission enabled
Days remaining: 7
```

#### 6c. Electrician Resubmits

1. Logout from admin, login as the electrician
2. Go to verification section
3. See "Request for Information" with deadline
4. Click "Resubmit Documents"
5. Upload updated documents
6. Submit

**Expected Result**:

```
Status: pending_review (again)
Previous request cleared
Admin can now review updated docs
```

---

### 7️⃣ TEST ONLINE STATUS AFTER APPROVAL

**Goal**: Verify electrician can only go online after approval

**Steps**:

#### Before Approval

1. Login as electrician (non-approved)
2. Try to toggle "Go Online" switch
3. Should show: "You must be verified to go online"

#### After Approval

1. Admin approves verification (from Step 4)
2. Electrician refreshes or checks status
3. Toggle "Go Online" switch
4. Should successfully go online
5. Verify in admin: Electrician shows as "Online"

**Expected Result**:

```
Before Approval: Cannot go online (greyed out or error)
After Approval: Can toggle online/offline status
Shows in electrician list as "Online"
```

---

### 8️⃣ VERIFY AUDIT LOG

**Goal**: Check that all changes are logged

**Steps**:

1. In admin panel, go to "Verification" audit logs
2. Check entries for:
   - Document submission
   - Admin approval/rejection/request-info
   - Electrician resubmission

**Expected Result**:

```
Each action logged with:
- Timestamp
- User (admin/electrician)
- Action taken
- Reason/Comments
- Document details
```

---

## 🔍 Key Verification Points

### Status Transitions

- `not_submitted` → (submit docs) → `pending_review`
- `pending_review` → (approve) → `approved`
- `pending_review` → (reject) → `rejected` (with cooldown)
- `pending_review` → (request-info) → `needs_info` (with deadline)
- `needs_info` → (resubmit) → `pending_review`

### API Endpoints to Test (Optional - for direct testing)

**Check Verification Status**

```bash
GET /api/electricians/me
Authorization: Bearer [token]
```

**Submit Documents**

```bash
POST /api/verification/submit
Content-Type: multipart/form-data
Authorization: Bearer [token]

Fields:
- identityDocument (file)
- licenseDocument (file)
- additionalInfo (text, optional)
```

**Admin Actions**

```bash
# Approve
POST /api/verification/:electricianId/approve
Authorization: Bearer [admin-token]

# Reject
POST /api/verification/:electricianId/reject
Body: { reason: "..." }

# Request Info
POST /api/verification/:electricianId/request-info
Body: {
  message: "...",
  deadline: "2026-01-22"
}
```

---

## 📝 Notes for Testing

- **Documents**: Use placeholder images/PDFs for testing
- **Email Verification**: May be disabled in dev mode (check .env)
- **Cooldown Period**: Check backend config (usually 30 days)
- **Deadline**: Request-info deadline should be customizable (usually 7-30 days)
- **Admin Login**: Check backend for test admin credentials
- **Database**: Test data persists; clear if needed by resetting MongoDB

---

## ✅ Completion Checklist

- [ ] All 3 servers running
- [ ] Electrician registration works
- [ ] Initial verification status is "not_submitted"
- [ ] Can submit documents
- [ ] Admin can approve
- [ ] Admin can reject with cooldown
- [ ] Admin can request additional info
- [ ] Electrician can resubmit after request-info
- [ ] Can only go online after approval
- [ ] Audit logs show all actions
- [ ] Status transitions are correct
- [ ] Cooldown period prevents resubmission
- [ ] Deadline shown for needs_info status

---

## 🐛 Debugging Tips

**If documents don't upload**:

- Check browser console for errors
- Check backend logs for validation issues
- Verify file size limits

**If approval doesn't work**:

- Check admin authentication
- Verify electrician ID is correct
- Check backend logs

**If online toggle doesn't work**:

- Verify verification status is "approved"
- Check socket.io connection
- Verify user role is "electrician"

**Check logs**:

- Backend: `npm run dev` output in terminal
- Frontend: Browser DevTools Console (F12)
- Admin: Browser DevTools Console (F12)
