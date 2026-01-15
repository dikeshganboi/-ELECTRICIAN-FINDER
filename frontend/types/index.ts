export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "electrician" | "admin";
}

export interface VerificationDocument {
  documentId: string;
  type: "aadhaar" | "certificate" | "photo" | "license" | "other";
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
  verified: boolean;
  adminNotes?: string;
}

export interface AdminReview {
  reviewedBy?: string;
  reviewedAt?: Date;
  decision?: "approved" | "rejected" | "needs_info";
  feedback?: string;
  notes?: string;
}

export interface VerificationSubmission {
  submissionId: string;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected" | "needs_info";
  documents: VerificationDocument[];
  adminReview: AdminReview;
}

export interface CurrentVerification {
  submissionId?: string;
  status?: "pending" | "approved" | "rejected" | "needs_info" | "expired";
  submittedAt?: Date;
  expiresAt?: Date;
  resubmitAt?: Date;
  lastRejectionReason?: string;
}

export interface Electrician {
  _id: string;
  userId: string;
  skills: string[];
  experienceYears: number;
  isVerified: boolean;
  verificationStatus: "not_submitted" | "pending" | "approved" | "rejected" | "needs_info" | "expired";
  canGoOnline: boolean;
  availabilityStatus: "online" | "offline" | "busy";
  baseRate: number;
  currentLocation?: { type: "Point"; coordinates: [number, number] };
  verificationSubmissions?: VerificationSubmission[];
  currentVerification?: CurrentVerification;
  verificationExpiresAt?: Date;
}

export interface Booking {
  _id: string;
  userId: string;
  electricianId: string;
  schedule: { date: string; time: string };
  issueDescription: string;
  status: "requested" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amount: number;
}
