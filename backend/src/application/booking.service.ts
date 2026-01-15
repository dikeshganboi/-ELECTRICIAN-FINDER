import crypto from "crypto";
import { BookingModel } from "../infra/db/models/booking.model";
import { ElectricianModel } from "../infra/db/models/electrician.model";
import { emitBookingUpdate } from "../interfaces/ws/emitter";

const COMMISSION_RATE = Math.min(
  Math.max(Number(process.env.PLATFORM_COMMISSION_RATE || 0.1), 0),
  1
);

const ensureElectricianOwner = (booking: any, electricianId: string) => {
  if (booking.electricianId.toString() !== electricianId) {
    throw new Error("You are not assigned to this booking");
  }
};

const emitAndReturn = (booking: any) => {
  emitBookingUpdate(booking.toObject());
  return booking;
};

export const createBooking = async (payload: {
  userId: string;
  electricianId: string;
  serviceId?: string;
  schedule: { date: string; time: string };
  issueDescription: string;
  location: { lat: number; lng: number };
  amount: number;
}) => {
  const electrician = await ElectricianModel.findById(payload.electricianId);
  if (!electrician) throw new Error("Electrician not found");
  
  // Ensure electrician is verified and approved before accepting bookings
  if (!electrician.isVerified || electrician.verificationStatus !== "approved") {
    throw new Error("Electrician is not verified");
  }

  const doc = await BookingModel.create({
    userId: payload.userId,
    electricianId: payload.electricianId,
    serviceId: payload.serviceId,
    schedule: payload.schedule,
    issueDescription: payload.issueDescription,
    location: { type: "Point", coordinates: [payload.location.lng, payload.location.lat] },
    status: "requested",
    paymentStatus: "pending",
    amount: payload.amount,
    otpForStart: crypto.randomInt(100000, 999999).toString(),
    otpForComplete: crypto.randomInt(100000, 999999).toString()
  });
  emitBookingUpdate(doc.toObject());
  return doc;
};

export const updateBookingStatus = async ({ bookingId, status }: { bookingId: string; status: string; }) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const allowedTransitions: Record<string, string[]> = {
    requested: ["accepted", "rejected", "cancelled"],
    accepted: ["arrived", "cancelled", "rejected"],
    arrived: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: ["closed"],
    closed: [],
    rejected: [],
    cancelled: []
  };

  const nextStatus = status as keyof typeof allowedTransitions;
  const current = booking.status as keyof typeof allowedTransitions;

  if (!allowedTransitions[current]?.includes(nextStatus)) {
    throw new Error(`Invalid status transition from ${current} to ${nextStatus}`);
  }

  booking.status = nextStatus;
  await booking.save();
  return emitAndReturn(booking);
};

export const markArrived = async ({ bookingId, electricianId }: { bookingId: string; electricianId: string; }) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  ensureElectricianOwner(booking, electricianId);
  if (!["accepted", "arrived"].includes(booking.status)) {
    throw new Error("Cannot mark arrived from current status");
  }
  booking.status = "arrived";
  await booking.save();
  return emitAndReturn(booking);
};

export const startWorkWithOtp = async ({ bookingId, electricianId, otp }: { bookingId: string; electricianId: string; otp: string; }) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  ensureElectricianOwner(booking, electricianId);

  if (!["accepted", "arrived"].includes(booking.status)) {
    throw new Error("Cannot start work from current status");
  }
  if (booking.otpForStart !== otp) {
    throw new Error("Invalid start OTP");
  }

  booking.status = "in_progress";
  await booking.save();
  return emitAndReturn(booking);
};

export const completeWorkWithOtp = async ({ bookingId, electricianId, otp }: { bookingId: string; electricianId: string; otp: string; }) => {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  ensureElectricianOwner(booking, electricianId);

  if (booking.status !== "in_progress") {
    throw new Error("Cannot complete work from current status");
  }
  if (booking.otpForComplete !== otp) {
    throw new Error("Invalid completion OTP");
  }

  const platformFee = Math.round(booking.amount * COMMISSION_RATE * 100) / 100;
  const electricianEarning = Math.max(0, booking.amount - platformFee);

  booking.status = "completed";
  booking.platformFee = platformFee;
  booking.electricianEarning = electricianEarning;
  await booking.save();
  return emitAndReturn(booking);
};

export const getUserBookings = async (userId: string) => {
  const bookings = await BookingModel.find({ userId })
    .populate({
      path: "electricianId",
      populate: {
        path: "userId",
        select: "name phone email"
      }
    })
    .sort({ createdAt: -1 });
  return bookings;
};
