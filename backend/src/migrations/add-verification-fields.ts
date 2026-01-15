/**
 * Migration script to add verification fields to existing electricians
 * Run this once after deploying the new schema
 * 
 * Usage: node dist/migrations/add-verification-fields.js
 */

import { ElectricianModel } from "../infra/db/models/electrician.model";
import { logger } from "../config/logger";
import mongoose from "mongoose";

const migrateElectricians = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/electrician-finder";
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB for migration");

    // Find all electricians that don't have the new verification fields
    const electricians = await ElectricianModel.find({
      $or: [
        { verificationStatus: { $exists: false } },
        { canGoOnline: { $exists: false } },
        { auditLog: { $exists: false } }
      ]
    });

    logger.info(`Found ${electricians.length} electricians to migrate`);

    let migrated = 0;
    let errors = 0;

    for (const electrician of electricians) {
      try {
        // Set safe defaults for new fields
        const updates: any = {};

        if (!electrician.verificationStatus) {
          // If already isVerified, set to approved; otherwise not_submitted
          updates.verificationStatus = electrician.isVerified ? "approved" : "not_submitted";
        }

        if (electrician.canGoOnline === undefined) {
          updates.canGoOnline = electrician.isVerified || false;
        }

        if (electrician.isOnline === undefined) {
          updates.isOnline = electrician.availabilityStatus === "online";
        }

        if (!electrician.verificationSubmissions) {
          updates.verificationSubmissions = [];
        }

        if (!electrician.auditLog) {
          updates.auditLog = [{
            action: "migration_initial",
            changedBy: "system",
            changedAt: new Date(),
            changes: { note: "Added verification fields via migration" }
          }];
        }

        // If already verified, set approval date and expiry
        if (electrician.isVerified && !electrician.verificationApprovedAt) {
          updates.verificationApprovedAt = new Date();
          updates.verificationExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        }

        await ElectricianModel.updateOne(
          { _id: electrician._id },
          { $set: updates }
        );

        migrated++;
        if (migrated % 10 === 0) {
          logger.info(`Migrated ${migrated}/${electricians.length} electricians`);
        }
      } catch (err) {
        errors++;
        logger.error({ err, electricianId: electrician._id }, "Error migrating electrician");
      }
    }

    logger.info(`Migration complete: ${migrated} migrated, ${errors} errors`);
    await mongoose.disconnect();
  } catch (err) {
    logger.error({ err }, "Migration failed");
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateElectricians()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

export { migrateElectricians };
