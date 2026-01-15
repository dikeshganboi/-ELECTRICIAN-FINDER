export interface PaymentProps {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: "created" | "paid" | "failed" | "refunded";
  amount: number;
  method?: string;
  currency?: string;
  signature?: string;
}
