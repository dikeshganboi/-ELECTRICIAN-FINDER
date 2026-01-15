import { Request, Response, NextFunction } from "express";
import { ElectricianModel } from "../infra/db/models/electrician.model";

/**
 * Blocks actions that require verified electricians (go online, accept bookings, stream location).
 * Returns status, message, and next steps when blocked.
 */
export const ensureVerified = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const electrician = await ElectricianModel.findOne({ userId });
  if (!electrician) return res.status(404).json({ message: "Electrician profile not found" });

  const isApproved = electrician.isVerified && electrician.verificationStatus === "approved";
  const isExpired = electrician.verificationExpiresAt && electrician.verificationExpiresAt < new Date();

  if (!isApproved) {
    return res.status(403).json({
      error: "VERIFICATION_REQUIRED",
      verificationStatus: electrician.verificationStatus,
      message: "You must be verified to perform this action",
      nextSteps: electrician.verificationStatus === "rejected"
        ? "Fix issues and reapply after cooldown"
        : "Complete verification from your dashboard"
    });
  }

  if (isExpired) {
    return res.status(403).json({
      error: "VERIFICATION_EXPIRED",
      message: "Your verification has expired. Please renew to continue.",
      nextSteps: "Submit a new verification request"
    });
  }

  return next();
};
