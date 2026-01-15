import { Router } from "express";
import { auth } from "../../middleware/auth";
import { ElectricianModel } from "../../infra/db/models/electrician.model";

const router = Router();

// Admin Login Route (public, for initial auth)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { signAccess } = require("../../utils/jwt");

    // Demo credentials for testing
    if (email === "admin@electricianfinder.com" && password === "admin@123") {
      // Use proper JWT signing with consistent format
      const token = signAccess({
        userId: "admin-001",
        role: "admin",
      });

      return res.json({
        token,
        admin: {
          id: "admin-001",
          name: "Admin User",
          email,
          role: "admin",
        },
      });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) { next(err); }
});

// Get Dashboard Stats
router.get("/stats", auth(["admin"]), async (_req, res, next) => {
  try {
    const [users, electricians, bookings] = await Promise.all([
      ElectricianModel.db.collection("users").countDocuments(),
      ElectricianModel.countDocuments(),
      ElectricianModel.db.collection("bookings").countDocuments()
    ]);

    // Get today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = await ElectricianModel.db.collection("bookings").countDocuments({
      createdAt: { $gte: today }
    });

    const completedBookings = await ElectricianModel.db.collection("bookings").find({
      createdAt: { $gte: today },
      status: "completed"
    }).toArray();

    const revenueToday = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    const activeBookings = await ElectricianModel.db.collection("bookings").countDocuments({
      status: { $in: ["accepted", "in_progress"] }
    });

    const onlineElectricians = await ElectricianModel.countDocuments({ isOnline: true });

    res.json({
      totalUsers: users,
      totalElectricians: electricians,
      onlineElectricians,
      todayBookings,
      revenueToday,
      activeBookings,
    });
  } catch (err) { next(err); }
});

// Get Electricians for Verification
router.get("/electricians", auth(["admin"]), async (req, res, next) => {
  try {
    const { status = "pending" } = req.query;

    const query: any = {};
    if (status === "pending") {
      query.verificationStatus = "pending";
    } else if (status === "approved") {
      query.verificationStatus = "approved";
    } else if (status === "rejected") {
      query.verificationStatus = "rejected";
    } else if (status === "needs_info") {
      query.verificationStatus = "needs_info";
    }
    // If status is "all", don't filter

    const electricians = await ElectricianModel.find(query)
      .populate("userId", "name phone email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Map database fields to frontend format
    const mapped = electricians.map((elec: any) => ({
      _id: elec._id,
      name: elec.userId?.name || "Unknown",
      phone: elec.userId?.phone || "Unknown",
      email: elec.userId?.email || "Unknown",
      skills: elec.skills || [],
      rating: elec.rating || 0,
      documents: elec.documents || [],
      verificationStatus: elec.verificationStatus,
      currentVerification: elec.currentVerification,
      verificationSubmissions: elec.verificationSubmissions || [],
      createdAt: elec.createdAt,
      rejectionReason: elec.rejectionReason
    }));

    res.json(mapped);
  } catch (err) { next(err); }
});

// Verify Electrician (legacy endpoint - kept for compatibility)
router.patch("/electricians/:id/verify", auth(["admin"]), async (req, res, next) => {
  try {
    const updated = await ElectricianModel.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verificationStatus: "approved",
        canGoOnline: true,
        verificationApprovedAt: new Date(),
        verificationExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) { next(err); }
});

// Approve Electrician (legacy endpoint - kept for compatibility)
router.patch("/electricians/:electricianId/approve", auth(["admin"]), async (req, res, next) => {
  try {
    const updated = await ElectricianModel.findByIdAndUpdate(
      req.params.electricianId,
      {
        isVerified: true,
        verificationStatus: "approved",
        canGoOnline: true,
        verificationApprovedAt: new Date(),
        verificationExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      { new: true }
    );
    res.json({ message: "Electrician approved", data: updated });
  } catch (err) { next(err); }
});

// Reject Electrician (legacy endpoint - kept for compatibility)
router.patch("/electricians/:electricianId/reject", auth(["admin"]), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const updated = await ElectricianModel.findByIdAndUpdate(
      req.params.electricianId,
      {
        verificationStatus: "rejected",
        rejectionReason: reason,
        isVerified: false,
        canGoOnline: false
      },
      { new: true }
    );
    res.json({ message: "Electrician rejected", data: updated });
  } catch (err) { next(err); }
});

// Get Analytics Overview
router.get("/analytics/overview", auth(["admin"]), async (_req, res, next) => {
  try {
    const [users, electricians, bookings] = await Promise.all([
      ElectricianModel.db.collection("users").countDocuments(),
      ElectricianModel.countDocuments(),
      ElectricianModel.db.collection("bookings").countDocuments()
    ]);
    res.json({ users, electricians, bookings });
  } catch (err) { next(err); }
});

// Get All Users
router.get("/users", auth(["admin"]), async (_req, res, next) => {
  try {
    const users = await ElectricianModel.db.collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    res.json(users);
  } catch (err) { next(err); }
});

// Get All Bookings
router.get("/bookings", auth(["admin"]), async (_req, res, next) => {
  try {
    const bookings = await ElectricianModel.db.collection("bookings")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    res.json(bookings);
  } catch (err) { next(err); }
});

export default router;
