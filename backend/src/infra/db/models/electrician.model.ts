import { Schema, model, Types } from "mongoose";

const DocumentSchema = new Schema({
  documentId: { type: String, default: () => new Types.ObjectId().toString() },
  type: { type: String, enum: ["aadhaar", "certificate", "photo", "license", "other"], required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  verified: { type: Boolean, default: false },
  adminNotes: { type: String }
}, { _id: false });

const AdminReviewSchema = new Schema({
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  decision: { type: String, enum: ["approved", "rejected", "needs_info"] },
  feedback: { type: String },
  notes: { type: String }
}, { _id: false });

const SubmissionSchema = new Schema({
  submissionId: { type: String, default: () => new Types.ObjectId().toString(), index: true },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "approved", "rejected", "needs_info"], default: "pending" },
  documents: [DocumentSchema],
  adminReview: AdminReviewSchema
}, { _id: false });

const AuditLogSchema = new Schema({
  action: { type: String, required: true },
  changedBy: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changes: { type: Schema.Types.Mixed }
}, { _id: false });

const ElectricianSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  skills: [{ type: String, trim: true }],
  experienceYears: { type: Number, min: 0 },
  documents: [DocumentSchema],
  isVerified: { type: Boolean, default: false, index: true },
  verificationStatus: {
    type: String,
    enum: ["not_submitted", "pending", "approved", "rejected", "needs_info", "expired"],
    default: "not_submitted",
    index: true
  },
  verificationApprovedAt: { type: Date },
  verificationExpiresAt: { type: Date },
  verificationSubmissions: [SubmissionSchema],
  currentVerification: {
    submissionId: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected", "needs_info", "expired"] },
    submittedAt: { type: Date },
    expiresAt: { type: Date },
    resubmitAt: { type: Date },
    lastRejectionReason: { type: String }
  },
  canGoOnline: { type: Boolean, default: false },
  availabilityStatus: { type: String, enum: ["online", "offline", "busy"], default: "offline", index: true },
  serviceRadiusKm: { type: Number, default: 5 },
  baseRate: { type: Number, default: 200 },
  onService: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },
  currentLocation: { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], index: "2dsphere" } },
  // Geohash for fast cell-based location indexing (Uber/Ola style)
  cell: { type: String, index: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  rejectionReason: { type: String },
  auditLog: [AuditLogSchema]
}, { timestamps: true });

export const ElectricianModel = model("Electrician", ElectricianSchema);
