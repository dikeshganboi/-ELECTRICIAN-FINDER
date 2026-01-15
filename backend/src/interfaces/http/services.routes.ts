import { Router } from "express";
import { ServiceModel } from "../../infra/db/models/service.model";

const router = Router();

// List active services with optional category filter
router.get("/", async (req, res, next) => {
  try {
    const { category } = req.query;
    const query: Record<string, any> = { isActive: true };
    if (category) query.category = category;
    const services = await ServiceModel.find(query).sort({ title: 1 }).lean();
    res.json(services);
  } catch (err) {
    next(err);
  }
});

export default router;
