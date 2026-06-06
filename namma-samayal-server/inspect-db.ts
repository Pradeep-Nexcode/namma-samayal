import mongoose from "mongoose";
import dotenv from "dotenv";
import Ingredient from "./src/models/Ingredient";
import Category from "./src/models/Category";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const similar = await Recipe.find({
    $or: [
      { slug: /kola.*urundai/i },
      { slug: /meatball/i },
      { slug: /kola/i },
      { "dishName.en": /kola urundai/i },
      { "dishName.en": /meatball/i }
    ]
  }).select("dishName slug source isApproved").lean();
  console.log("EXISTING KOLA URUNDAI / MEATBALL RECIPES:");
  if (similar.length === 0) console.log("  (none)");
  else similar.forEach((r: any) => console.log(`  ${r._id} | ${r.slug} | ${r.dishName?.en}`));
  console.log("");

  const ings = await Ingredient.find({
    $or: [
      { slug: /mutton.*mince/i },
      { slug: /keema/i },
      { slug: /minced.*mutton/i },
      { slug: /ground.*mutton/i },
      { "name.en": /mutton mince/i },
      { "name.en": /keema/i },
      { "name.en": /minced mutton/i }
    ]
  }).select("name slug").lean();
  console.log("\nMATCHING INGREDIENTS:");
  ings.forEach((i: any) => console.log(`  ${i.slug} | en=${i.name?.en} | ta=${i.name?.ta}`));

  await mongoose.disconnect();
})();
