import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = { userId: string; role: "user" | "electrician" | "admin" } & jwt.JwtPayload;

export const signAccess = (payload: Omit<JwtPayload, keyof jwt.JwtPayload>): string =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl } as SignOptions);

export const signRefresh = (payload: Omit<JwtPayload, keyof jwt.JwtPayload>): string =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshTtl } as SignOptions);

export const verifyAccess = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtAccessSecret) as JwtPayload;

export const verifyRefresh = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
