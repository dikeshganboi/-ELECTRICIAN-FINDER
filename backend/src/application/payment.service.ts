import crypto from "crypto";
import { PaymentModel } from "../infra/db/models/payment.model";
import { BookingModel } from "../infra/db/models/booking.model";
import { razorpayClient } from "../infra/providers/razorpay";
import { emitBookingUpdate } from "../interfaces/ws/emitter";

export const createOrder = async (bookingId: string) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "completed") throw new Error("Work not marked completed yet");
  if (booking.paymentStatus === "paid") throw new Error("Payment already captured");

  const platformFee = booking.platformFee ?? Math.round(booking.amount * 0.1 * 100) / 100;
  const electricianEarning = booking.electricianEarning ?? Math.max(0, booking.amount - platformFee);

  const order = await razorpayClient.orders.create({
    amount: Math.round(booking.amount * 100),
    currency: "INR",
    receipt: bookingId
  });
  await PaymentModel.create({ bookingId, razorpayOrderId: order.id, status: "created", amount: booking.amount, platformFee, electricianEarning });
  booking.razorpayOrderId = order.id;
  await booking.save();
  return order;
};

export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) => {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET || "").update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
  if (expected !== razorpay_signature) throw new Error("Invalid signature");
  const payment = await PaymentModel.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { razorpayPaymentId: razorpay_payment_id, signature: razorpay_signature, status: "paid" }, { new: true });
  if (!payment) throw new Error("Payment not found");
  const booking = await BookingModel.findById(payment.bookingId);
  if (booking) {
    booking.paymentStatus = "paid";
    booking.status = "closed";
    booking.razorpayPaymentId = razorpay_payment_id;
    if (payment.platformFee !== undefined) booking.platformFee = payment.platformFee;
    if (payment.electricianEarning !== undefined) booking.electricianEarning = payment.electricianEarning;
    await booking.save();
    emitBookingUpdate(booking.toObject());
  }
  return payment;
};
