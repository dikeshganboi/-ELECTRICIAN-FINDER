import { Router } from "express";
import { auth } from "../../middleware/auth";
import { ensureVerified } from "../../middleware/ensureVerified";
import { ElectricianModel } from "../../infra/db/models/electrician.model";

const router = Router();

// Get current electrician profile (authenticated)
router.get("/me", auth(["electrician"]), async (req, res, next) => {
  try {
    const electrician = await ElectricianModel.findOne({ userId: req.user!.userId });
    if (!electrician) {
      return res.status(404).json({ message: "Electrician profile not found" });
    }
    res.json(electrician);
  } catch (err) { next(err); }
});

// Get electrician by userId or electricianId
router.get("/:id", auth(["electrician", "user"]), async (req, res, next) => {
  try {
    let electrician = await ElectricianModel.findOne({ userId: req.params.id });
    
    if (!electrician) {
      electrician = await ElectricianModel.findById(req.params.id);
    }
    
    if (!electrician) {
      return res.status(404).json({ message: "Electrician not found" });
    }
    res.json(electrician);
  } catch (err) { next(err); }
});

// Update availability status (online/offline) - REQUIRES VERIFICATION
router.patch("/availability", auth(["electrician"]), ensureVerified, async (req, res, next) => {
  try {
    const { status } = req.body; // "online" | "offline" | "busy"
    // TODO: Update availability status in database
    res.json({ 
      message: "Availability updated",
      status,
      userId: req.user!.userId 
    });
  } catch (err) { next(err); }
});

// Electrician health check
router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

export default router;
