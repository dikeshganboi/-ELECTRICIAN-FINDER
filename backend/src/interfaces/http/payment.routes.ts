import { Router } from "express";
import { auth } from "../../middleware/auth";
import { validate } from "./validate";
import { createOrderSchema, verifyPaymentSchema } from "../validators/payment.validator";
import * as paymentService from "../../application/payment.service";

const router = Router();

router.post("/create-order", auth(["user"]), validate(createOrderSchema), async (req, res, next) => {
  try {
    const order = await paymentService.createOrder(req.body.bookingId);
    res.json(order);
  } catch (err) { next(err); }
});

router.post("/verify", validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const payment = await paymentService.verifyPayment(req.body);
    res.json(payment);
  } catch (err) { next(err); }
});

export default router;
