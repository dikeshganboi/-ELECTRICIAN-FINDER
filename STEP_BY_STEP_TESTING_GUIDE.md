# Step-by-Step Manual Testing Guide

## 🎯 Goal

Complete end-to-end testing of the electrician verification flow with all status transitions.

## ⏱️ Estimated Time

**~30 minutes** for all test scenarios

---

## 📍 SETUP STATUS

✅ **Backend**: http://localhost:4000  
✅ **Frontend**: http://localhost:3000  
✅ **Admin**: http://localhost:3001

---

## 🔴 TEST 1: REGISTER & INITIAL STATUS (5 min)

### Step 1.1: Register First Electrician

1. Open **http://localhost:3000** in browser
2. Click **"Sign Up"** button
3. Select **"Electrician"** role
4. Fill in the form:
   ```
   Full Name: John Electrician
   Email: john.electrician@test.com
   Phone: 9876543210
   Password: Test@12345678
   Confirm Password: Test@12345678
   ```
5. Select **2+ service areas** (e.g., Residential, Commercial)
6. Accept terms & click **"Create Account"**

### Step 1.2: Verify Initial Status

7. You should land on the **Electrician Dashboard**
8. Look for **Verification Status** section
9. **VERIFY**: Status shows `Not Submitted` or `not_submitted`
10. **VERIFY**: Button says "Submit Documents" or similar
11. **VERIFY**: "Go Online" toggle is **disabled** (greyed out)

**✅ Test 1 Passed If**:

- Account created
- Status is "Not Submitted"
- Cannot go online

---

## 🟡 TEST 2: SUBMIT DOCUMENTS (5 min)

### Step 2.1: Navigate to Verification

1. Click on **Verification** section in dashboard
2. Look for **"Submit Verification Documents"** or similar
3. Should see upload areas for:
   - Identity Document (ID/Passport/Aadhar)
   - License Document (Professional License)

### Step 2.2: Upload Documents

4. Click on **Identity Document** upload area
5. Select any image file from your computer (JPG, PNG, or PDF)
   - _Tip: Use any existing image, content doesn't matter for testing_
6. Click on **License Document** upload area
7. Select another image file
8. In **Additional Info** field (if exists), add:
   ```
   Testing verification flow with test documents
   ```
9. Click **"Submit for Review"** or **"Submit Documents"** button

### Step 2.3: Verify Status Change

10. Should see success message: "Documents submitted successfully" or similar
11. Status should change to **"Pending Review"** or `pending_review`
12. Resubmit button should be **disabled** until admin takes action

**✅ Test 2 Passed If**:

- Documents uploaded successfully
- Status changed to "Pending Review"
- Success message shown

---

## 🟢 TEST 3: ADMIN APPROVAL (5 min)

### Step 3.1: Login to Admin Panel

1. Open **http://localhost:3001** in a **new browser tab**
2. Look for admin login page
3. Try login with default credentials (check backend logs if needed)
   - If you see an error, check backend console for test credentials
4. You should land on **Admin Dashboard**

### Step 3.2: Find Verification Requests

5. Look for **"Verification"** menu item in sidebar
6. Click on **"Pending Verifications"** or similar
7. Find **"John Electrician"** (or your electrician name)
8. Click on it to view details

### Step 3.3: Review & Approve

9. You should see:
   - Electrician details (name, email, phone)
   - Submitted documents (thumbnails/links)
   - Status: Pending Review
10. Click **"Approve"** button
11. Optional: Add comments like "All documents verified"
12. Click **"Confirm Approve"** or **"Submit"**

### Step 3.4: Verify Change

13. Should see success message
14. Status should change to **"Approved"** or `approved`
15. Take note of the electrician ID (you might need it later)

**✅ Test 3 Passed If**:

- Admin can view electrician's documents
- Approval successful
- Status changed to "Approved"

---

## 🔵 TEST 4: GO ONLINE AFTER APPROVAL (3 min)

### Step 4.1: Return to Electrician Dashboard

1. Go back to **http://localhost:3000** tab (electrician account)
2. **Refresh the page** (F5 or Ctrl+R)
3. Navigate back to **Verification** or **Dashboard**

### Step 4.2: Toggle Go Online

4. Look for **"Go Online"** toggle or button
5. The button should now be **enabled** (not greyed out)
6. Click **"Go Online"** toggle to turn it **ON**

### Step 4.3: Verify Status

7. You should see **"Status: Online"** or similar
8. Toggle might show **green** or **enabled** state
9. Go back to admin panel and refresh
10. Verify electrician shows as **"Online"** in the list

**✅ Test 4 Passed If**:

- "Go Online" toggle is enabled
- Successfully toggled online
- Status shows online in both electrician & admin views

---

## 🔴 TEST 5: REJECTION WITH COOLDOWN (5 min)

### Step 5.1: Register Second Electrician

1. Open a **new incognito/private window**
2. Go to **http://localhost:3000**
3. Sign up with:
   ```
   Full Name: Jane Electrician
   Email: jane.electrician@test.com
   Phone: 9876543211
   Password: Test@12345678
   ```
4. Select service areas
5. Submit **in the Verification section** (upload documents like Test 2)

### Step 5.2: Admin Rejection

6. Go back to admin panel (**http://localhost:3001**)
7. Look for Jane's verification request
8. Click on it
9. Click **"Reject"** button
10. Fill in **Rejection Reason**:
    ```
    License document appears to be a photocopy. Please provide an original scan.
    ```
11. Click **"Confirm Reject"** or **"Submit"**
12. Should see success message
13. Status changes to **"Rejected"** or `rejected`

### Step 5.3: Verify Cooldown

14. In admin, should see **Cooldown Until**: [date 30 days from now]
15. Go back to Jane's electrician account
16. Navigate to Verification section
17. Try clicking **"Resubmit Documents"** button
18. **VERIFY**: Error message shows:
    ```
    You can resubmit after [date]
    OR
    Cooldown period is active until [date]
    ```

**✅ Test 5 Passed If**:

- Admin can reject
- Cooldown period appears in admin
- Electrician cannot resubmit during cooldown
- Cooldown message shown in UI

---

## 🟡 TEST 6: REQUEST ADDITIONAL INFO (5 min)

### Step 6.1: Register Third Electrician

1. Open **another incognito window**
2. Sign up with:
   ```
   Full Name: Mike Electrician
   Email: mike.electrician@test.com
   Phone: 9876543212
   Password: Test@12345678
   ```
3. Submit documents for verification

### Step 6.2: Admin Requests Info

4. Go to admin panel
5. Find Mike's verification request
6. Click on it
7. Click **"Request More Information"** or **"Request Additional Info"** button
8. Fill in:

   ```
   Message: Please provide a clearer copy of your professional license.
   The current image is too blurry. Please rescan with higher resolution.

   Deadline: [Select date 7 days from today]
   ```

9. Click **"Submit Request"** or **"Send Request"**
10. Should see success message
11. Status changes to **"Needs Info"** or `needs_info`

### Step 6.3: Verify Deadline in Electrician View

12. Switch to Mike's electrician account
13. Go to Verification section
14. **VERIFY**: You see:
    - Message: "Admin requests more information..."
    - The request message: "Please provide a clearer copy..."
    - **Deadline**: [date 7 days from now]
    - **Days Remaining**: 7 days
    - **"Resubmit Documents"** button is **enabled**

### Step 6.4: Electrician Resubmits

15. Click **"Resubmit Documents"**
16. Upload updated documents (can be same files or different)
17. In additional info, type:
    ```
    I've provided a clearer scan of my professional license with higher resolution.
    ```
18. Click **"Resubmit"**
19. Should see success: "Documents resubmitted successfully"
20. Status should return to **"Pending Review"** or `pending_review`

### Step 6.5: Verify in Admin

21. Go back to admin panel
22. Find Mike's request again
23. Status should show **"Pending Review"**
24. The previous "Needs Info" request should be cleared

**✅ Test 6 Passed If**:

- Admin can request info with deadline
- Electrician sees deadline and request message
- Electrician can resubmit documents
- Status returns to "Pending Review" after resubmit

---

## 📊 TEST 7: VERIFY AUDIT LOG (3 min)

### Step 7.1: Check Admin Audit Log

1. Go to admin panel
2. Find **"Audit Logs"** or **"Activity Logs"** section
3. Filter for **verification** activities
4. You should see entries like:
   - John: Documents Submitted → Approved → Online
   - Jane: Documents Submitted → Rejected
   - Mike: Documents Submitted → Request Info → Resubmitted

### Step 7.2: Check Individual Logs

5. Go to each electrician's details
6. Look for **"Verification History"** or **"Activity Log"**
7. Should show timeline of:
   - Submission date/time
   - Admin actions and dates
   - Comments/reasons

**✅ Test 7 Passed If**:

- Audit logs show all actions
- Each action has timestamp
- Comments are recorded

---

## ✅ COMPLETE TEST SUMMARY

### Create a Testing Report

Fill in this checklist:

```
END-TO-END VERIFICATION TESTING REPORT
Date: [Today's Date]
Tester: [Your Name]
Status: PASS / FAIL

TEST RESULTS:
□ Test 1 ✓ - Registration & Initial Status: PASS / FAIL
□ Test 2 ✓ - Document Submission: PASS / FAIL
□ Test 3 ✓ - Admin Approval: PASS / FAIL
□ Test 4 ✓ - Go Online After Approval: PASS / FAIL
□ Test 5 ✓ - Rejection with Cooldown: PASS / FAIL
□ Test 6 ✓ - Request Info with Deadline: PASS / FAIL
□ Test 7 ✓ - Audit Logs: PASS / FAIL

OVERALL: ✅ ALL TESTS PASSED / ❌ SOME TESTS FAILED

NOTES:
[Add any observations or issues found]
```

---

## 🐛 TROUBLESHOOTING

### If Documents Won't Upload

- **Issue**: File upload fails or shows error
- **Solution**:
  - Check file size (should be < 5MB)
  - Try JPG or PNG format
  - Check browser console (F12) for errors

### If Status Doesn't Change

- **Issue**: Admin approval/rejection doesn't update electrician's status
- **Solution**:
  - Refresh the page
  - Check backend logs for errors
  - Check MongoDB: verify document was saved

### If Can't Go Online After Approval

- **Issue**: "Go Online" button still greyed out after approval
- **Solution**:
  - Refresh page (F5)
  - Clear browser cache
  - Check that verification status is actually "approved"
  - Check browser console for JavaScript errors

### If Admin Can't Find Electrician

- **Issue**: Verification request doesn't show in admin
- **Solution**:
  - Check admin is logged in correctly
  - Try filtering or searching for electrician
  - Check backend logs for permission errors

### If Cooldown Not Working

- **Issue**: Electrician can resubmit immediately after rejection
- **Solution**:
  - Check backend for cooldown configuration
  - Check database for rejection record
  - Verify cooldown time is set in env variables

---

## 📞 Need Help?

### Check Logs:

1. **Backend errors**: Look at terminal where `npm run dev` is running
2. **Frontend errors**: Open browser DevTools (F12) → Console tab
3. **Admin errors**: Open browser DevTools (F12) → Console tab

### Common Log Messages to Look For:

**Backend:**

```
"Verification documents submitted"
"Verification approved"
"Cooldown period active"
"Deadline passed"
```

**Frontend Console:**

```
Network error: [error message]
API returned: [response]
```
