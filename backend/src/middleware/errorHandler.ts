import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ message: err.message || "Internal Server Error" });
};
