import mongoose from "mongoose";

import config from "../config/config.js";
import User from "../models/User.js";

/**
 * One-time backfill: mark all pre-existing users as verified so the new login
 * `isVerified` gate doesn't lock out accounts created before email
 * verification existed. Run once after deploying the verification feature:
 *   npm run backfill:verified
 */
async function backfillVerified() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB...");

    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } },
    );

    console.log("-----------------------------------------");
    console.log("✅ Backfill complete");
    console.log(`Users updated: ${result.modifiedCount}`);
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("❌ Error backfilling verified users:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

backfillVerified();
