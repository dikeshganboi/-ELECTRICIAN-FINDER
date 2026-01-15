import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: AnyZodObject, property: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) return res.status(400).json({ message: "Validation error", errors: result.error.flatten() });
    // overwrite with parsed data for type safety
    req[property] = result.data as typeof req[typeof property];
    next();
  };
