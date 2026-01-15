export interface BookingProps {
  userId: string;
  electricianId: string;
  serviceId?: string;
  schedule: { date: string; time: string };
  issueDescription: string;
  location: { type: "Point"; coordinates: [number, number] };
  status: "requested" | "accepted" | "arrived" | "in_progress" | "completed" | "closed" | "rejected" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  otpForStart?: string;
  otpForComplete?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  platformFee?: number;
  electricianEarning?: number;
}
