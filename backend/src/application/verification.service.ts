import { randomUUID } from "crypto";
import { ElectricianModel } from "../infra/db/models/electrician.model";

const REQUIRED_DOCUMENTS = [
  { type: "aadhaar", required: true, expiryRequired: true },
  { type: "certificate", required: true, expiryRequired: false },
  { type: "photo", required: true, expiryRequired: false }
];

const DAY_MS = 24 * 60 * 60 * 1000;
const VERIFICATION_TTL_MS = 365 * DAY_MS;

const getCooldown = (submittedAt?: Date) =>
  submittedAt ? new Date(submittedAt.getTime() + DAY_MS) : undefined;

export class VerificationService {
  async getVerificationForm(userId: string) {
    const electrician = await ElectricianModel.findOne({ userId }).lean();
    if (!electrician) throw new Error("ELECTRICIAN_NOT_FOUND");

    const lastRejected = (electrician.verificationSubmissions || [])
      .filter((s) => s.status === "rejected")
      .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))[0];

    const canResubmitAt = getCooldown(lastRejected?.submittedAt as Date | undefined);

    return {
      requiredDocuments: REQUIRED_DOCUMENTS,
      previousSubmissions: electrician.verificationSubmissions || [],
      canResubmitAt
    };
  }

  async submitVerification(userId: string, documents: Array<{ type: string; url: string; expiresAt?: string }>) {
    const electrician = await ElectricianModel.findOne({ userId });
    if (!electrician) throw new Error("ELECTRICIAN_NOT_FOUND");

    this.ensureCanSubmit(electrician.toObject());

    const submissionDocuments = documents.map((doc) => ({
      documentId: randomUUID(),
      type: doc.type,
      url: doc.url,
      expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined,
      uploadedAt: new Date(),
      verified: false
    }));

    const submission = {
      submissionId: randomUUID(),
      submittedAt: new Date(),
      status: "pending" as const,
      documents: submissionDocuments,
      adminReview: {}
    };

    electrician.verificationSubmissions = electrician.verificationSubmissions || [];
    electrician.verificationSubmissions.push(submission as any);
    electrician.verificationStatus = "pending";
    electrician.isVerified = false;
    electrician.canGoOnline = false;
    electrician.currentVerification = {
      submissionId: submission.submissionId,
      status: "pending",
      submittedAt: submission.submittedAt
    } as any;
    electrician.auditLog = electrician.auditLog || [];
    electrician.auditLog.push({
      action: "verification_submitted",
      changedBy: userId,
      changedAt: new Date(),
      changes: { status: "pending" }
    });

    await electrician.save();
    return submission;
  }

  async approveVerification(submissionId: string, adminId: string, feedback?: string) {
    const electrician = await ElectricianModel.findOne({ "verificationSubmissions.submissionId": submissionId });
    if (!electrician) throw new Error("SUBMISSION_NOT_FOUND");

    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

    await ElectricianModel.updateOne(
      { "verificationSubmissions.submissionId": submissionId },
      {
        $set: {
          isVerified: true,
          verificationStatus: "approved",
          canGoOnline: true,
          verificationApprovedAt: new Date(),
          verificationExpiresAt: expiresAt,
          "verificationSubmissions.$[sub].status": "approved",
          "verificationSubmissions.$[sub].adminReview": {
            reviewedBy: adminId,
            reviewedAt: new Date(),
            decision: "approved",
            feedback
          },
          currentVerification: {
            submissionId,
            status: "approved",
            submittedAt: electrician.currentVerification?.submittedAt,
            expiresAt
          }
        },
        $push: {
          auditLog: {
            action: "verification_approved",
            changedBy: adminId,
            changedAt: new Date(),
            changes: { status: "approved" }
          }
        }
      },
      { arrayFilters: [{ "sub.submissionId": submissionId }] }
    );
  }

  async rejectVerification(submissionId: string, adminId: string, reason: string, internalNotes?: string) {
    const electrician = await ElectricianModel.findOne({ "verificationSubmissions.submissionId": submissionId });
    if (!electrician) throw new Error("SUBMISSION_NOT_FOUND");

    const resubmitAt = new Date(Date.now() + DAY_MS);

    await ElectricianModel.updateOne(
      { "verificationSubmissions.submissionId": submissionId },
      {
        $set: {
          isVerified: false,
          canGoOnline: false,
          verificationStatus: "rejected",
          "verificationSubmissions.$[sub].status": "rejected",
          "verificationSubmissions.$[sub].adminReview": {
            reviewedBy: adminId,
            reviewedAt: new Date(),
            decision: "rejected",
            feedback: reason,
            notes: internalNotes
          },
          currentVerification: {
            submissionId,
            status: "rejected",
            submittedAt: electrician.currentVerification?.submittedAt,
            lastRejectionReason: reason,
            resubmitAt
          }
        },
        $push: {
          auditLog: {
            action: "verification_rejected",
            changedBy: adminId,
            changedAt: new Date(),
            changes: { status: "rejected", reason }
          }
        }
      },
      { arrayFilters: [{ "sub.submissionId": submissionId }] }
    );

    return { resubmitAt };
  }

  async requestMoreInfo(submissionId: string, adminId: string, feedback: string, deadlineDays = 7) {
    const resubmitDeadline = new Date(Date.now() + deadlineDays * DAY_MS);
    const electrician = await ElectricianModel.findOne({ "verificationSubmissions.submissionId": submissionId });
    if (!electrician) throw new Error("SUBMISSION_NOT_FOUND");

    await ElectricianModel.updateOne(
      { "verificationSubmissions.submissionId": submissionId },
      {
        $set: {
          verificationStatus: "needs_info",
          "verificationSubmissions.$[sub].status": "needs_info",
          "verificationSubmissions.$[sub].adminReview": {
            ...(electrician.verificationSubmissions || []).find((s: any) => s.submissionId === submissionId)?.adminReview,
            decision: "needs_info",
            feedback
          },
          currentVerification: {
            submissionId,
            status: "needs_info",
            submittedAt: electrician.currentVerification?.submittedAt,
            expiresAt: electrician.currentVerification?.expiresAt,
            resubmitAt: resubmitDeadline
          }
        },
        $push: {
          auditLog: {
            action: "verification_needs_info",
            changedBy: adminId,
            changedAt: new Date(),
            changes: { status: "needs_info", feedback }
          }
        }
      },
      { arrayFilters: [{ "sub.submissionId": submissionId }] }
    );

    return { resubmitDeadline };
  }

  private ensureCanSubmit(electrician: any) {
    if (electrician.verificationStatus === "pending") {
      throw new Error("ALREADY_PENDING");
    }

    const lastRejected = (electrician.verificationSubmissions || [])
      .filter((s: any) => s.status === "rejected")
      .sort((a: any, b: any) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))[0];

    if (lastRejected) {
      const nextAllowed = getCooldown(lastRejected.submittedAt);
      if (nextAllowed && nextAllowed > new Date()) {
        const minutes = Math.ceil((nextAllowed.getTime() - Date.now()) / (60 * 1000));
        const err = new Error("RESUBMIT_COOLDOWN");
        (err as any).canResubmitAt = nextAllowed;
        (err as any).minutes = minutes;
        throw err;
      }
    }
  }
}

export const verificationService = new VerificationService();
