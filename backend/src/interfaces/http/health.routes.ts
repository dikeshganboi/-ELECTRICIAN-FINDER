import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", async (_req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  res.json({ ok: true, db: dbState });
});

export default router;
