import { z } from "zod";

export const submitVerificationSchema = z.object({
  documents: z.array(
    z.object({
      type: z.enum(["aadhaar", "certificate", "photo", "license", "other"]),
      url: z.string().min(1), // Accept any string, including blob URLs
      expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}(T|$)/, "Invalid date format").optional()
    })
  ).min(1)
});

export const approveVerificationSchema = z.object({
  feedback: z.string().optional()
});

export const rejectVerificationSchema = z.object({
  reason: z.string().min(10),
  internalNotes: z.string().optional()
});

export const requestMoreInfoSchema = z.object({
  feedback: z.string().min(10),
  deadlineDays: z.number().int().min(1).max(30).default(7)
});
