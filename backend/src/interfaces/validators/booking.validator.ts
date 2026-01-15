import { z } from "zod";

export const createBookingSchema = z.object({
  serviceId: z.string().optional(),
  electricianId: z.string(),
  schedule: z.object({ date: z.string(), time: z.string() }),
  issueDescription: z.string().min(3),
  location: z.object({ lat: z.number(), lng: z.number() }),
  amount: z.number().positive()
});

export const updateStatusSchema = z.object({
  status: z.enum(["accepted", "rejected", "arrived", "in_progress", "completed", "closed", "cancelled"])
});

export const otpSchema = z.object({ otp: z.string().min(4).max(6) });
