import { Router } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { validate } from "./validate";
import * as authService from "../../application/auth.service";
import { authLimiter } from "../../middleware/rateLimit";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (err) { next(err); }
});

router.post("/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
