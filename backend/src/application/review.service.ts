import { ReviewModel } from "../infra/db/models/review.model";
import { BookingModel } from "../infra/db/models/booking.model";
import { UserModel } from "../infra/db/models/user.model";

export const createReview = async (payload: {
  userId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}) => {
  const booking = await BookingModel.findById(payload.bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.userId.toString() !== payload.userId) {
    throw new Error("Not authorized to review this booking");
  }

  // Create review
  const review = await ReviewModel.create({
    userId: payload.userId,
    electricianId: booking.electricianId,
    bookingId: payload.bookingId,
    rating: payload.rating,
    comment: payload.comment
  });

  // Update electrician rating
  const electricianReviews = await ReviewModel.find({ electricianId: booking.electricianId });
  const avgRating = electricianReviews.reduce((sum, r) => sum + r.rating, 0) / electricianReviews.length;
  
  await UserModel.findByIdAndUpdate(booking.electricianId, {
    ratingsAverage: avgRating,
    ratingsCount: electricianReviews.length
  });

  return review;
};

export const getReviews = async (electricianId: string) => {
  return ReviewModel.find({ electricianId })
    .populate("userId", "name phone")
    .sort({ createdAt: -1 });
};
