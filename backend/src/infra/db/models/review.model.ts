import { Schema, model } from "mongoose";

const ReviewSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", unique: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  electricianId: { type: Schema.Types.ObjectId, ref: "Electrician", required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String
}, { timestamps: true });

export const ReviewModel = model("Review", ReviewSchema);
