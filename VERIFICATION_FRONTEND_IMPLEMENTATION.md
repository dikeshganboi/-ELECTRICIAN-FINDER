# Verification System - Frontend Implementation Summary

## Overview

Complete frontend implementation for the electrician verification system, including submission, status tracking, and admin review flows.

## Components Created

### 1. VerificationStatus Component

**File**: `frontend/components/features/VerificationStatus.tsx`

Displays verification status with contextual information:

- **Status Badges**: not_submitted, pending, approved, rejected, needs_info, expired
- **Countdown Timers**: Shows resubmission cooldown (24 hours after rejection)
- **Expiry Display**: Shows days remaining for approved verification (1 year)
- **Action Buttons**: Submit, Resubmit, Renew based on current status
- **Color Coded**: Visual indicators for different statuses (green for approved, red for rejected, etc.)

### 2. DocumentUploadForm Component

**File**: `frontend/components/features/DocumentUploadForm.tsx`

Modal form for document submission:

- **Three Required Documents**:
  - Aadhaar Card (with expiry date required)
  - Electrical License/Certificate
  - Professional Photo
- **File Upload**: With visual feedback and change/remove options
- **Validation**: Ensures all required documents are uploaded
- **Error Handling**: Displays specific validation errors
- **Success Callback**: Refreshes profile after submission

### 3. AdminVerificationPanel Component

**File**: `frontend/components/features/AdminVerificationPanel.tsx`

Admin review interface for pending verifications:

- **Document Display**: Links to uploaded documents with expiry dates
- **Three Action Types**:
  - **Approve**: Optional feedback for electrician
  - **Reject**: Required reason + internal notes for admin
  - **Request More Info**: Feedback with custom deadline (3-30 days)
- **Previous Review Display**: Shows history of admin actions
- **Status Badges**: Shows current submission status

## Hooks Created

### useVerification Hook

**File**: `frontend/hooks/useVerification.ts`

Two main exports:

#### useVerification()

- `fetchForm()`: Gets verification form metadata and submission history
- `submitVerification()`: Submits documents with error handling
- `error`, `loading`, `formData` state

#### useAdminVerification()

- `approveVerification()`: Approve submission with optional feedback
- `rejectVerification()`: Reject with required reason + internal notes
- `requestMoreInfo()`: Request clarifications with deadline
- `error`, `loading` state

## Type Definitions Updated

**File**: `frontend/types/index.ts`

New types added:

- `VerificationDocument`: Document metadata (type, URL, expiry, etc.)
- `AdminReview`: Admin action record (decision, feedback, notes)
- `VerificationSubmission`: Complete submission with documents and reviews
- `CurrentVerification`: Current status tracking (pending, approved, expiry, resubmit dates)
- **Updated `Electrician` type**: Added verification-related fields

## Integration into Dashboard

### Electrician Dashboard Updates

**File**: `frontend/app/(protected)/dashboard/electrician/page.tsx`

**New Features**:

1. **Verification Status Section**

   - Displays above the online toggle
   - Shows current status with action buttons
   - Shows cooldown timer if rejected
   - Shows expiry countdown if approved

2. **Verification Warning Alert**

   - Shows when electrician is not verified
   - Explains verification requirement
   - Links to upload form

3. **Protected Online Toggle**

   - Disabled unless verification status is "approved"
   - Shows warning if user tries to go online while unverified
   - Real-time profile refresh (every 30 seconds)

4. **Document Upload Modal**

   - Triggered by verification status action buttons
   - Opens with DocumentUploadForm component
   - Refreshes profile on successful submission

5. **Profile State Management**
   - Fetches full electrician profile including verification status
   - Auto-refreshes every 30 seconds
   - Includes error handling and fallbacks

## Workflow Flows

### Electrician Workflow

1. **New Electrician**: Status is "not_submitted"

   - Click "Submit Documents" button
   - Upload required documents with expiry dates
   - Submit for review
   - Status changes to "pending"

2. **Pending Review**: Status is "pending"

   - Wait for admin review
   - Real-time status updates
   - Cannot go online

3. **Approved**: Status is "approved"

   - Can now go online and receive bookings
   - Expiry countdown shown (365 days)
   - Will expire after 1 year

4. **Rejected**: Status is "rejected"

   - Reason displayed to electrician
   - 24-hour cooldown before resubmit
   - Countdown timer shown
   - Click "Resubmit" after cooldown expires

5. **Needs Info**: Status is "needs_info"

   - Admin feedback shown
   - Deadline for submission (3-30 days)
   - Click "Submit Update" to provide additional docs
   - Countdown to deadline shown

6. **Expired**: Status is "expired"
   - Must renew verification to continue
   - Click "Renew Verification" button
   - Same process as initial submission

### Admin Workflow

1. **View Submissions**: See pending verifications in admin panel
2. **Review Documents**: Click links to view uploaded documents
3. **Take Action**:
   - **Approve**: Mark as approved, electrician can go online
   - **Reject**: Provide reason, electrician locked out for 24 hours
   - **Request Info**: Ask for clarifications with deadline
4. **Track History**: See all previous admin actions on each submission

## Error Handling

### Frontend Validation

- Ensures all documents uploaded before submission
- Validates Aadhaar expiry date is provided
- Shows specific error messages

### API Error Mapping

- `ELECTRICIAN_NOT_FOUND`: User profile not found
- `ALREADY_PENDING`: Cannot submit while already pending
- `RESUBMIT_COOLDOWN`: Shows minutes until can resubmit
- `SUBMISSION_NOT_FOUND`: Submission doesn't exist (admin only)

### User Feedback

- Toast/alert messages on success/failure
- Disabled buttons during loading
- Loading spinners during submission
- Clear error messages with next steps

## API Endpoints Used

### Electrician Endpoints

- `GET /api/verification/form`: Get verification form metadata
- `POST /api/verification/submit`: Submit documents
- `GET /api/electricians/{userId}`: Get profile with verification status

### Admin Endpoints

- `POST /api/verification/admin/approve/{submissionId}`: Approve verification
- `POST /api/verification/admin/reject/{submissionId}`: Reject verification
- `POST /api/verification/admin/request-info/{submissionId}`: Request more info

## Future Enhancements

1. Document upload to cloud storage (S3, Azure Blob)
2. Document preview/zoom before submission
3. Email notifications on status changes
4. SMS notifications for critical updates
5. Batch verification import for admins
6. Verification analytics dashboard
7. Document templates/guidelines
8. Chat support for verification issues
