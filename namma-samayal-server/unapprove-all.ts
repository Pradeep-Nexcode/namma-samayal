import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const before = await Recipe.countDocuments({ isApproved: true });
  const total = await Recipe.countDocuments({});

  console.log(`BEFORE — total: ${total}, approved: ${before}`);

  const result = await Recipe.updateMany(
    { isApproved: true },
    { $set: { isApproved: false } }
  );

  const after = await Recipe.countDocuments({ isApproved: true });

  console.log(`UPDATED ${result.modifiedCount} recipes → isApproved: false`);
  console.log(`AFTER  — total: ${total}, approved: ${after}`);

  await mongoose.disconnect();
})();
