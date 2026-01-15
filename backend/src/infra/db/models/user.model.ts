import { Schema, model } from "mongoose";
import { Role } from "../../../domain/models/user";

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  phone: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "electrician", "admin"], default: "user" satisfies Role, index: true },
  ratingsAverage: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  currentLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }
  }
}, { timestamps: true });

export const UserModel = model("User", UserSchema);
