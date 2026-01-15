import { Router } from "express";
import { auth } from "../../middleware/auth";
import * as reviewService from "../../application/review.service";

const router = Router();

router.post("/", auth(["user"]), async (req, res, next) => {
  try {
    const review = await reviewService.createReview({
      userId: req.user!.userId,
      bookingId: req.body.bookingId,
      rating: req.body.rating,
      comment: req.body.comment
    });
    res.json(review);
  } catch (err) { next(err); }
});

router.get("/electrician/:electricianId", async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviews(req.params.electricianId);
    res.json(reviews);
  } catch (err) { next(err); }
});

export default router;
