import { Router } from "express";
import { auth } from "../../middleware/auth";
import { ensureVerified } from "../../middleware/ensureVerified";
import { validate } from "./validate";
import { createBookingSchema, updateStatusSchema, otpSchema } from "../validators/booking.validator";
import * as bookingService from "../../application/booking.service";
import { BookingModel } from "../../infra/db/models/booking.model";
import { ElectricianModel } from "../../infra/db/models/electrician.model";

const resolveElectricianId = async (userId: string) => {
  const electrician = await ElectricianModel.findOne({ userId }).select("_id");
  if (!electrician) throw new Error("Electrician profile not found");
  return electrician._id.toString();
};

const router = Router();

router.get("/user/:userId", auth(["user", "admin"]), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requester = req.user!;

    if (requester.role !== "admin" && requester.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const bookings = await bookingService.getUserBookings(userId);
    res.json(bookings);
  } catch (err) { next(err); }
});

router.get("/electrician/:electricianId", auth(["electrician", "admin"]), async (req, res, next) => {
  try {
    const { electricianId } = req.params;
    const requester = req.user!;

    // Electricians can only view their own bookings, admins can view anyone's
    if (requester.role === "electrician") {
      const electrician = await BookingModel.findOne({ 
        electricianId,
        status: { $in: ["completed", "in_progress", "accepted"] }
      }).populate("userId", "name email phone").select("_id status amount createdAt userId");
      
      if (!electrician) {
        return res.json([]);
      }
    }

    const bookings = await BookingModel.find({ electricianId })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { next(err); }
});

router.post("/", auth(["user"]), validate(createBookingSchema), async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking({ ...req.body, userId: req.user!.userId });
    res.json(booking);
  } catch (err) { next(err); }
});

// Electrician marks arrival (physical presence)
router.post("/:id/arrive", auth(["electrician", "admin"]), async (req, res, next) => {
  try {
    const requester = req.user!;
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (requester.role === "electrician") {
      return ensureVerified(req, res, async () => {
        const electricianId = await resolveElectricianId(requester.userId);
        const updated = await bookingService.markArrived({ bookingId: req.params.id, electricianId });
        res.json(updated);
      });
    }

    const updated = await bookingService.markArrived({ bookingId: req.params.id, electricianId: booking.electricianId.toString() });
    res.json(updated);
  } catch (err) { next(err); }
});

// Electrician starts work with OTP verification
router.post("/:id/start", auth(["electrician", "admin"]), validate(otpSchema), async (req, res, next) => {
  try {
    const requester = req.user!;
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (requester.role === "electrician") {
      return ensureVerified(req, res, async () => {
        const electricianId = await resolveElectricianId(requester.userId);
        const updated = await bookingService.startWorkWithOtp({ bookingId: req.params.id, electricianId, otp: req.body.otp });
        res.json(updated);
      });
    }

    const updated = await bookingService.startWorkWithOtp({ bookingId: req.params.id, electricianId: booking.electricianId.toString(), otp: req.body.otp });
    res.json(updated);
  } catch (err) { next(err); }
});

// Electrician completes work with OTP verification
router.post("/:id/complete", auth(["electrician", "admin"]), validate(otpSchema), async (req, res, next) => {
  try {
    const requester = req.user!;
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (requester.role === "electrician") {
      return ensureVerified(req, res, async () => {
        const electricianId = await resolveElectricianId(requester.userId);
        const updated = await bookingService.completeWorkWithOtp({ bookingId: req.params.id, electricianId, otp: req.body.otp });
        res.json(updated);
      });
    }

    const updated = await bookingService.completeWorkWithOtp({ bookingId: req.params.id, electricianId: booking.electricianId.toString(), otp: req.body.otp });
    res.json(updated);
  } catch (err) { next(err); }
});

// REQUIRES VERIFICATION for electricians to accept/update status
router.patch("/:id/status", auth(["user", "electrician", "admin"]), async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const requester = req.user!;
    
    // If electrician is updating status, ensure they are verified
    if (requester.role === "electrician") {
      return ensureVerified(req, res, async () => {
        const updatedBooking = await bookingService.updateBookingStatus({ bookingId: req.params.id, status: req.body.status });
        res.json(updatedBooking);
      });
    }

    // Authorization: user can only complete their own booking
    if (requester.role === "user" && booking.userId.toString() !== requester.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedBooking = await bookingService.updateBookingStatus({ bookingId: req.params.id, status: req.body.status });
    res.json(updatedBooking);
  } catch (err) { next(err); }
});

export default router;
