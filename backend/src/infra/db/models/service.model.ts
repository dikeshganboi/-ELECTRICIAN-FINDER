import { Schema, model } from "mongoose";

const ServiceSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  basePrice: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

export const ServiceModel = model("Service", ServiceSchema);
