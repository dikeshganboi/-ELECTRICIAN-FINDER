import { Router } from "express";
import { auth } from "../../../middleware/auth";
import { BookingModel } from "../../../infra/db/models/booking.model";
import { ElectricianModel } from "../../../infra/db/models/electrician.model";

const router = Router();

router.get("/:id/stats", auth(["electrician", "user"]), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to find by electrician ID first, then by userId
    let electrician = await ElectricianModel.findById(id).select("_id userId");
    
    if (!electrician) {
      electrician = await ElectricianModel.findOne({ userId: id }).select("_id userId");
    }
    
    if (!electrician) {
      return res.status(404).json({ message: "Not found" });
    }
    
    const completedJobs = await BookingModel.countDocuments({ 
      electricianId: electrician._id, 
      status: "completed" 
    });
    
    res.json({ 
      completedJobs,
      electricianId: electrician._id,
      userId: electrician.userId
    });
  } catch (err) {
    next(err);
  }
});

export default router;
