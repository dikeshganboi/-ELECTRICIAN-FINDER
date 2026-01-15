# Quick E2E Testing Checklist

## 🚀 Servers Running

- ✅ Backend: http://localhost:4000
- ✅ Frontend: http://localhost:3000
- ✅ Admin: http://localhost:3001

---

## 📝 Test Cases (Check as you go)

### Step 1: Register Electrician

- [ ] Go to http://localhost:3000
- [ ] Sign up as electrician
- [ ] Email: `test.electrician1@example.com`
- [ ] Verify logged in
- [ ] See "Not Submitted" status

### Step 2: Submit Documents

- [ ] Navigate to Verification section
- [ ] Upload identity document (any image/PDF)
- [ ] Upload license document
- [ ] Click "Submit for Review"
- [ ] Status changes to "Pending Review"

### Step 3: Admin Approval

- [ ] Go to http://localhost:3001
- [ ] Login as admin
- [ ] Find "Verification" section
- [ ] Find your electrician
- [ ] Click "Approve"
- [ ] Confirm approval

### Step 4: Go Online After Approval

- [ ] Logout from admin
- [ ] Login as electrician again
- [ ] Go to dashboard
- [ ] Toggle "Go Online" - should work now
- [ ] Verify "Online" status shows

### Step 5: Test Rejection + Cooldown

- [ ] Register 2nd electrician: `test.electrician2@example.com`
- [ ] Submit documents
- [ ] Admin: Go to verification
- [ ] Admin: Click "Reject" with reason
- [ ] 2nd Electrician: Try to resubmit
- [ ] Should show: "Can resubmit after [date]"

### Step 6: Test Request Info + Deadline

- [ ] Register 3rd electrician: `test.electrician3@example.com`
- [ ] Submit documents
- [ ] Admin: Go to verification
- [ ] Admin: Click "Request More Information"
- [ ] Admin: Add message and deadline
- [ ] 3rd Electrician: See deadline and request
- [ ] 3rd Electrician: Resubmit documents
- [ ] Should return to "Pending Review"

### Step 7: Verify Audit Trail

- [ ] Admin: Check verification audit logs
- [ ] Verify entries for: submission, approval, rejection, request-info
- [ ] Each entry has timestamp and details

---

## 🔗 Quick Links

- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3001
- **API Docs**: Check backend logs for endpoint info

---

## 💡 Test Data

**Electrician 1 (Approved)**

- Email: test.electrician1@example.com
- Status: approved
- Can go online: YES

**Electrician 2 (Rejected)**

- Email: test.electrician2@example.com
- Status: rejected
- Can resubmit: NO (cooldown active)

**Electrician 3 (Needs Info)**

- Email: test.electrician3@example.com
- Status: needs_info
- Can resubmit: YES (deadline shown)

---

## ✨ Expected Results

| Test Case                   | Expected                 | Status |
| --------------------------- | ------------------------ | ------ |
| Initial Status              | not_submitted            |        |
| After Submit                | pending_review           |        |
| After Approve               | approved                 |        |
| After Approve + Go Online   | online ✓                 |        |
| After Reject                | rejected (30d cooldown)  |        |
| After Request-Info          | needs_info (7d deadline) |        |
| Resubmit After Request-Info | pending_review           |        |

---

## 🐛 If Something Goes Wrong

**Can't login to admin**:

- Check admin credentials in backend .env
- Clear browser cache/cookies
- Try incognito mode

**Documents won't upload**:

- Check file size (should be < 5MB)
- Use .jpg, .png, .pdf formats
- Check browser console for errors

**Can't go online after approval**:

- Refresh page
- Check verification status in profile
- Verify socket.io connection in console

**Status not changing in admin**:

- Refresh admin panel
- Check backend logs for errors
- Verify you're viewing correct electrician
