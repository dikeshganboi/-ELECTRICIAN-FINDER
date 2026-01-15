import { ElectricianModel } from "../infra/db/models/electrician.model";
import { logger } from "./logger";

export const createIndexes = async (): Promise<void> => {
  try {
    // Create geospatial index for location-based queries
    try {
      await ElectricianModel.collection.createIndex({ "currentLocation": "2dsphere" });
      logger.info("Geospatial index created for currentLocation");
    } catch (err: any) {
      if (err.codeName === "IndexKeySpecsConflict") {
        logger.info("Geospatial index already exists");
      } else {
        throw err;
      }
    }

    // Compound index for verified + online electricians
    try {
      await ElectricianModel.collection.createIndex({ isVerified: 1, isOnline: 1 });
      logger.info("Compound index created for isVerified + isOnline");
    } catch (err: any) {
      if (err.codeName === "IndexKeySpecsConflict") {
        logger.info("Compound index already exists");
      } else {
        throw err;
      }
    }

    // Index for verification queue (admin panel)
    try {
      await ElectricianModel.collection.createIndex({ verificationStatus: 1, createdAt: -1 });
      logger.info("Index created for verificationStatus + createdAt");
    } catch (err: any) {
      if (err.codeName === "IndexKeySpecsConflict") {
        logger.info("Verification index already exists");
      } else {
        throw err;
      }
    }

    // Index for userId lookups
    try {
      await ElectricianModel.collection.createIndex({ userId: 1 });
      logger.info("Index created for userId");
    } catch (err: any) {
      if (err.codeName === "IndexKeySpecsConflict") {
        logger.info("UserId index already exists");
      } else {
        throw err;
      }
    }

    // Index for audit log queries
    try {
      await ElectricianModel.collection.createIndex({ "auditLog.changedAt": -1 });
      logger.info("Index created for auditLog.changedAt");
    } catch (err: any) {
      if (err.codeName === "IndexKeySpecsConflict") {
        logger.info("Audit log index already exists");
      } else {
        throw err;
      }
    }

  } catch (error) {
    logger.error(error, "Error creating indexes");
  }
};
