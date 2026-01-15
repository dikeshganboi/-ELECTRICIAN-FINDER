export type VerificationStatus = "not_submitted" | "pending" | "approved" | "rejected" | "needs_info" | "expired";

export interface VerificationDocument {
  documentId?: string;
  type: "aadhaar" | "certificate" | "photo" | "license" | "other";
  url: string;
  uploadedAt?: Date;
  expiresAt?: Date;
  verified?: boolean;
  adminNotes?: string;
}

export interface VerificationSubmission {
  submissionId: string;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected" | "needs_info";
  documents: VerificationDocument[];
  adminReview?: {
    reviewedBy?: string;
    reviewedAt?: Date;
    decision?: "approved" | "rejected" | "needs_info";
    feedback?: string;
    notes?: string;
  };
}

export interface CurrentVerificationState {
  submissionId?: string;
  status?: VerificationStatus;
  submittedAt?: Date;
  expiresAt?: Date;
  resubmitAt?: Date;
  lastRejectionReason?: string;
}

export interface AuditLogEntry {
  action: string;
  changedBy: string;
  changedAt: Date;
  changes?: Record<string, any>;
}

export interface ElectricianProps {
  userId: string;
  skills: string[];
  experienceYears?: number;
  documents?: VerificationDocument[];
  verificationStatus: VerificationStatus;
  verificationSubmissions?: VerificationSubmission[];
  currentVerification?: CurrentVerificationState;
  verificationApprovedAt?: Date;
  verificationExpiresAt?: Date;
  canGoOnline: boolean;
  isVerified: boolean;
  availabilityStatus: "online" | "offline" | "busy";
  serviceRadiusKm: number;
  baseRate: number;
  onService: boolean;
  lastActiveAt?: Date;
  currentLocation?: { type: "Point"; coordinates: [number, number] };
  rating?: number;
  auditLog?: AuditLogEntry[];
}
