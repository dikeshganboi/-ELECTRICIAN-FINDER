import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt";

export const auth = (roles?: Array<"user" | "electrician" | "admin">) =>
  (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const payload = verifyAccess(token);
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
