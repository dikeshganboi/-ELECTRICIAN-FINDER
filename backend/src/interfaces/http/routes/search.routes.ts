import { Router } from "express";
import { searchNearbyElectricians } from "../../../application/search.service";

const router = Router();

router.get("/nearby", async (req, res, next) => {
  try {
    const { lat, lng, radiusKm, skill, status } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    // IMPORTANT: Always search for verified electricians only
    // Users should NEVER see unverified electricians
    const electricians = await searchNearbyElectricians({
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string),
      radiusKm: radiusKm ? parseFloat(radiusKm as string) : 5,
      skill: skill as string | undefined,
      status: status as any,
      verified: true // ALWAYS true for regular users
    });

    res.json({ electricians });
  } catch (error) {
    next(error);
  }
});

export default router;
