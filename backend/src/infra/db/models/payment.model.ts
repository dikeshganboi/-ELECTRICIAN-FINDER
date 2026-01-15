import { Schema, model } from "mongoose";

const PaymentSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: String,
  status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
  amount: { type: Number, required: true },
  method: String,
  currency: { type: String, default: "INR" },
  signature: String,
  platformFee: Number,
  electricianEarning: Number
}, { timestamps: true });

export const PaymentModel = model("Payment", PaymentSchema);
