# 🎯 VERIFICATION FLOW END-TO-END TESTING - START HERE

## ✅ Status: READY TO TEST

### 🚀 All Servers Running

- **Backend API** → http://localhost:4000 ✓
- **Electrician App** → http://localhost:3000 ✓
- **Admin Panel** → http://localhost:3001 ✓

---

## 📚 Documentation Files (Read in Order)

### 1. **START HERE** → [STEP_BY_STEP_TESTING_GUIDE.md](STEP_BY_STEP_TESTING_GUIDE.md)

- **Best for**: Manual testing through the UI
- **Time**: ~30 minutes
- **Contains**: 7 complete test scenarios with detailed steps
- 👉 **READ THIS FIRST if you want to manually test everything**

### 2. **Quick Reference** → [QUICK_TEST_CHECKLIST.md](QUICK_TEST_CHECKLIST.md)

- **Best for**: Quick checklist while testing
- **Time**: Quick reference
- **Contains**: Condensed checklist format for easy tracking
- 👉 **USE THIS during testing to track progress**

### 3. **Detailed Guide** → [E2E_VERIFICATION_TESTING.md](E2E_VERIFICATION_TESTING.md)

- **Best for**: Understanding the complete flow
- **Time**: 5 minute read
- **Contains**: All scenarios, expected results, debugging tips
- 👉 **REFERENCE THIS if something goes wrong**

### 4. **API Reference** → [API_REFERENCE_VERIFICATION.md](API_REFERENCE_VERIFICATION.md)

- **Best for**: Testing via cURL or Postman
- **Time**: 10 minute read
- **Contains**: All API endpoints, request/response formats, error codes
- 👉 **USE THIS for direct API testing**

---

## 🎬 Quick Start

### Option 1: Manual UI Testing (Recommended for first time)

1. Open [STEP_BY_STEP_TESTING_GUIDE.md](STEP_BY_STEP_TESTING_GUIDE.md)
2. Follow each test scenario step by step
3. Use [QUICK_TEST_CHECKLIST.md](QUICK_TEST_CHECKLIST.md) to track progress
4. **Estimated time**: 30 minutes

### Option 2: API Testing (For developers)

1. Use [API_REFERENCE_VERIFICATION.md](API_REFERENCE_VERIFICATION.md)
2. Test endpoints using cURL or Postman
3. Follow the status transitions documented
4. **Estimated time**: 20 minutes

### Option 3: Both (Comprehensive)

1. Do manual UI testing
2. Then verify with API calls
3. **Estimated time**: 50 minutes

---

## 🧪 Test Scenarios Included

| #   | Test Case                   | Expected Outcome                               | Status |
| --- | --------------------------- | ---------------------------------------------- | ------ |
| 1   | Register as electrician     | Account created, status = "not_submitted"      | ⬜     |
| 2   | Submit documents            | Status changes to "pending_review"             | ⬜     |
| 3   | Admin approves              | Status changes to "approved"                   | ⬜     |
| 4   | Go online after approval    | Electrician can toggle online                  | ⬜     |
| 5   | Admin rejects               | Status = "rejected", cooldown active (30 days) | ⬜     |
| 6   | Request more info           | Status = "needs_info", deadline shown (7 days) | ⬜     |
| 7   | Resubmit after info request | Status returns to "pending_review"             | ⬜     |
| 8   | Verify audit logs           | All actions logged with timestamps             | ⬜     |

---

## 🎯 Testing Goals

- ✅ Verify complete verification flow works end-to-end
- ✅ Test all status transitions (not_submitted → pending → approved/rejected/needs_info)
- ✅ Test admin approval/rejection/request-info functionality
- ✅ Test electrician can only go online after approval
- ✅ Test rejection cooldown period (30 days)
- ✅ Test needs_info deadline enforcement
- ✅ Verify audit logs track all changes
- ✅ Ensure UI and API are in sync

---

## 📋 Server URLs Reference

| Service                    | URL                   | Port | Purpose                    |
| -------------------------- | --------------------- | ---- | -------------------------- |
| Backend API                | http://localhost:4000 | 4000 | Core API endpoints         |
| Frontend (Electrician App) | http://localhost:3000 | 3000 | Customer-facing app        |
| Admin Panel                | http://localhost:3001 | 3001 | Admin management interface |

---

## 🔐 Test Accounts to Create

| Role          | Email                     | Password      | Purpose           |
| ------------- | ------------------------- | ------------- | ----------------- |
| Electrician 1 | john.electrician@test.com | Test@12345678 | Approval flow     |
| Electrician 2 | jane.electrician@test.com | Test@12345678 | Rejection flow    |
| Electrician 3 | mike.electrician@test.com | Test@12345678 | Request-info flow |

---

## 🛠️ Useful Terminal Commands

If servers stop, restart them:

```bash
# In terminal 1 - Backend
cd "d:\ELECTRICIAN FINDER\backend"
npm run dev

# In terminal 2 - Frontend
cd "d:\ELECTRICIAN FINDER\frontend"
npm run dev

# In terminal 3 - Admin
cd "d:\ELECTRICIAN FINDER\admin"
npm run dev
```

To kill all node processes:

```powershell
Get-Process -Name "node" | Stop-Process -Force
```

---

## ✨ Key Features Being Tested

### Verification Statuses

- **not_submitted**: Electrician hasn't submitted any documents
- **pending_review**: Documents submitted, awaiting admin review
- **approved**: Admin approved, electrician can go online ✓
- **rejected**: Admin rejected, cooldown period active ⏳
- **needs_info**: Admin requesting additional info, deadline set ⏰

### Electrician Features

- Can only go online if status = "approved"
- Cannot resubmit during rejection cooldown
- Can resubmit after request-info deadline met
- All actions logged in audit trail

### Admin Features

- Can approve, reject, or request more info
- Can view submitted documents
- Can set deadline for info request
- Can see electrician online status
- Can view audit logs of all actions

---

## ❓ FAQ

**Q: Which file should I read first?**  
A: Start with [STEP_BY_STEP_TESTING_GUIDE.md](STEP_BY_STEP_TESTING_GUIDE.md) for manual UI testing.

**Q: How long will testing take?**  
A: ~30 minutes for complete flow, ~10 minutes for quick test.

**Q: Can I use the same account for multiple tests?**  
A: No, use different emails as shown in test accounts table.

**Q: Where are the API endpoints?**  
A: See [API_REFERENCE_VERIFICATION.md](API_REFERENCE_VERIFICATION.md)

**Q: What if something goes wrong?**  
A: Check "Debugging Tips" section in [E2E_VERIFICATION_TESTING.md](E2E_VERIFICATION_TESTING.md)

**Q: Where are the servers running?**  
A: Backend (4000), Frontend (3000), Admin (3001) - see table above

---

## 📞 Support

### Check Logs

- **Backend**: Look at terminal where `npm run dev` is running
- **Frontend**: Browser DevTools → F12 → Console tab
- **Admin**: Browser DevTools → F12 → Console tab

### Common Issues

1. **Port already in use**: Kill node processes and restart
2. **Can't login to admin**: Check backend logs for credentials
3. **Documents won't upload**: Check file size and format (< 5MB, JPG/PNG/PDF)
4. **Status won't update**: Refresh page, check backend logs

---

## ✅ Final Checklist Before Starting

- [ ] All 3 servers are running (check URLs above)
- [ ] You have opened the correct documentation file
- [ ] You have prepared 3 different email addresses for test accounts
- [ ] You have some image/PDF files ready for document upload
- [ ] You have browser DevTools open for debugging if needed (F12)

---

## 🚀 Ready? Let's Go!

👉 **Open this file first**: [STEP_BY_STEP_TESTING_GUIDE.md](STEP_BY_STEP_TESTING_GUIDE.md)

Good luck with testing! 🎉
