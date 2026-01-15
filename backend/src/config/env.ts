import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET"
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing env var ${key}`);
  }
});

const rawCorsOrigin = process.env.CORS_ORIGIN;
const parsedCorsOrigin = rawCorsOrigin
  ? rawCorsOrigin.split(",").map((origin) => origin.trim())
  : ["*"];

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongodbUri: process.env.MONGODB_URI as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || "24h", // Increased from 15m to 24 hours
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || "30d", // Increased from 7d to 30 days
  corsOrigin: parsedCorsOrigin.length === 1 && parsedCorsOrigin[0] === "*" ? "*" : parsedCorsOrigin,
  razorpayKey: process.env.RAZORPAY_KEY || "",
  razorpaySecret: process.env.RAZORPAY_SECRET || "",
  paymentsEnabled: Boolean(process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET),
};
