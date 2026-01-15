import Razorpay from "razorpay";
import { env } from "../../config/env";

export const razorpayClient = new Razorpay({
  key_id: env.razorpayKey,
  key_secret: env.razorpaySecret
});
