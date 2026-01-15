import { Router } from "express";
import { auth } from "../../middleware/auth";
import { verificationService } from "../../application/verification.service";
import { validate } from "./validate";
import {
  submitVerificationSchema,
  approveVerificationSchema,
  rejectVerificationSchema,
  requestMoreInfoSchema
} from "../validators/verification.validator";

const router = Router();

// Electrician: Get verification form metadata
router.get("/form", auth(["electrician"]), async (req, res, next) => {
  try {
    const form = await verificationService.getVerificationForm(req.user!.userId);
    res.json(form);
  } catch (err: any) {
    if (err.message === "ELECTRICIAN_NOT_FOUND") {
      return res.status(404).json({ error: "ELECTRICIAN_NOT_FOUND", message: "Electrician profile not found" });
    }
    next(err);
  }
});

// Electrician: Submit verification documents
router.post("/submit", auth(["electrician"]), validate(submitVerificationSchema), async (req, res, next) => {
  try {
    const { documents } = req.body;
    const submission = await verificationService.submitVerification(req.user!.userId, documents);
    res.json({ message: "Verification submitted successfully", submission });
  } catch (err: any) {
    if (err.message === "ELECTRICIAN_NOT_FOUND") {
      return res.status(404).json({ error: "ELECTRICIAN_NOT_FOUND", message: "Electrician profile not found" });
    }
    if (err.message === "ALREADY_PENDING") {
      return res.status(409).json({ error: "ALREADY_PENDING", message: "A verification is already pending" });
    }
    if (err.message === "RESUBMIT_COOLDOWN") {
      return res.status(429).json({
        error: "RESUBMIT_COOLDOWN",
        message: `Please wait ${err.minutes} minutes before resubmitting`,
        canResubmitAt: err.canResubmitAt
      });
    }
    next(err);
  }
});

// Admin: Approve verification
router.post("/admin/approve/:submissionId", auth(["admin"]), validate(approveVerificationSchema), async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { feedback } = req.body;
    await verificationService.approveVerification(submissionId, req.user!.userId, feedback);
    res.json({ message: "Verification approved successfully" });
  } catch (err: any) {
    if (err.message === "SUBMISSION_NOT_FOUND") {
      return res.status(404).json({ error: "SUBMISSION_NOT_FOUND", message: "Submission not found" });
    }
    next(err);
  }
});

// Admin: Reject verification
router.post("/admin/reject/:submissionId", auth(["admin"]), validate(rejectVerificationSchema), async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { reason, internalNotes } = req.body;
    const result = await verificationService.rejectVerification(submissionId, req.user!.userId, reason, internalNotes);
    res.json({ message: "Verification rejected", ...result });
  } catch (err: any) {
    if (err.message === "SUBMISSION_NOT_FOUND") {
      return res.status(404).json({ error: "SUBMISSION_NOT_FOUND", message: "Submission not found" });
    }
    next(err);
  }
});

// Admin: Request more information
router.post("/admin/request-info/:submissionId", auth(["admin"]), validate(requestMoreInfoSchema), async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { feedback, deadlineDays } = req.body;
    const result = await verificationService.requestMoreInfo(submissionId, req.user!.userId, feedback, deadlineDays);
    res.json({ message: "More information requested", ...result });
  } catch (err: any) {
    if (err.message === "SUBMISSION_NOT_FOUND") {
      return res.status(404).json({ error: "SUBMISSION_NOT_FOUND", message: "Submission not found" });
    }
    next(err);
  }
});

export default router;
