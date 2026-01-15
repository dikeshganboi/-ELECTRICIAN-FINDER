import { Schema, model } from "mongoose";

const BookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  electricianId: { type: Schema.Types.ObjectId, ref: "Electrician", required: true, index: true },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
  schedule: { date: String, time: String },
  issueDescription: String,
  location: { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], index: "2dsphere" } },
  status: { type: String, enum: ["requested", "accepted", "arrived", "in_progress", "completed", "closed", "rejected", "cancelled"], default: "requested", index: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  amount: { type: Number, required: true },
  otpForStart: String,
  otpForComplete: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  platformFee: Number,
  electricianEarning: Number
}, { timestamps: true });

export const BookingModel = model("Booking", BookingSchema);
