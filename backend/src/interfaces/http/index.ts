import { Router } from "express";
import authRoutes from "./auth.routes";
import bookingRoutes from "./booking.routes";
import paymentRoutes from "./payment.routes";
import adminRoutes from "./admin.routes";
import electricianRoutes from "./electrician.routes";
import setupRoutes from "./setup.routes";
import searchRoutes from "./routes/search.routes";
import reviewRoutes from "./review.routes";
import servicesRoutes from "./services.routes";
import electricianStatsRoutes from "./routes/electrician.stats.routes";
import verificationRoutes from "./verification.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/electricians", electricianRoutes);
router.use("/electricians", electricianStatsRoutes);
router.use("/setup", setupRoutes);
router.use("/search", searchRoutes);
router.use("/reviews", reviewRoutes);
router.use("/services", servicesRoutes);
router.use("/verification", verificationRoutes);
router.use("/health", healthRoutes);

export default router;
