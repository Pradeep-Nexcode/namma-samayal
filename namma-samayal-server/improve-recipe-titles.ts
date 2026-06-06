import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

/**
 * Adds a short user-facing `title` to each of the 21 recipes added this session,
 * and re-slugs them based on the new title.
 *
 * - The full descriptive `dishName.en` / `dishName.ta` stays untouched (admin reference).
 * - User app will read `title` (short, SEO-friendly, dish-first).
 * - Slug is regenerated from the new title.
 *
 * The improved live Pichipotta recipe (admin-approved) is intentionally NOT touched.
 */

interface Update {
  currentSlug: string;
  newTitle: string;
  newSlug: string;
}

const updates: Update[] = [
  // 1
  { currentSlug: "erode-aaya-sundakkai-chutney", newTitle: "Sundakkai Chutney (Turkey Berry Side)", newSlug: "sundakkai-chutney" },
  // 2
  { currentSlug: "erode-aaya-meen-kuzhambu", newTitle: "Kongu Meen Kuzhambu (Tamil Fish Curry)", newSlug: "kongu-meen-kuzhambu" },
  // 3
  { currentSlug: "erode-pachai-milagai-pallipalayam-chicken", newTitle: "Green Chilli Pallipalayam Chicken", newSlug: "green-chilli-pallipalayam-chicken" },
  // 4
  { currentSlug: "kongunattu-chola-paniyaram", newTitle: "Cholam Paniyaram (Sorghum Millet)", newSlug: "cholam-paniyaram" },
  // 5
  { currentSlug: "kongu-pacha-payaru-kuzhambu", newTitle: "Pacha Payaru Kuzhambu (Green Moong Curry)", newSlug: "pacha-payaru-kuzhambu" },
  // 6
  { currentSlug: "erode-kongu-ennai-kathirikai-kuzhambu", newTitle: "Ennai Kathirikai Kuzhambu (Oil Brinjal Gravy)", newSlug: "ennai-kathirikai-kuzhambu" },
  // 7
  { currentSlug: "erode-mutton-uppu-kari", newTitle: "Mutton Uppu Kari (Salted Mutton Roast)", newSlug: "mutton-uppu-kari" },
  // 8
  { currentSlug: "erode-naatu-kozhi-biryani", newTitle: "Home-Style Naatu Kozhi Biryani", newSlug: "home-style-naatu-kozhi-biryani" },
  // 9
  { currentSlug: "muthu-mess-naattu-kozhi-kuzhambu", newTitle: "Naattu Kozhi Thanni Kuzhambu (Smoky Chicken Curry)", newSlug: "naattu-kozhi-thanni-kuzhambu" },
  // 10
  { currentSlug: "bhai-veetu-biryani-muslim-wedding-style", newTitle: "Bhai Veetu Mutton Biryani", newSlug: "bhai-veetu-mutton-biryani" },
  // 11
  { currentSlug: "chinna-vengaya-kuzhambu", newTitle: "Chinna Vengaya Kuzhambu (Shallot Tamarind Gravy)", newSlug: "chinna-vengaya-kuzhambu" },
  // 12
  { currentSlug: "erode-aaya-paruppu-thuvayal", newTitle: "Paruppu Thuvayal (Toor Dal Chutney)", newSlug: "paruppu-thuvayal" },
  // 13
  { currentSlug: "thottathu-virundhu-vayirukku-idhama-biryani", newTitle: "Stomach-Friendly Naatu Kozhi Biryani", newSlug: "stomach-friendly-naatu-kozhi-biryani" },
  // 14
  { currentSlug: "sri-janani-catering-soya-sukka-varattu", newTitle: "Soya Sukka Varattu (Veg Mutton-Style)", newSlug: "soya-sukka-varattu" },
  // 15
  { currentSlug: "maanthoppu-virundhu-mushroom-pallipalayam", newTitle: "Mushroom Pallipalayam (Vegetarian)", newSlug: "mushroom-pallipalayam" },
  // 16
  { currentSlug: "thottathu-virundhu-thengai-poondu-idicha-podi", newTitle: "Thengai Poondu Podi (Fireless Coconut Garlic Podi)", newSlug: "thengai-poondu-podi" },
  // 17
  { currentSlug: "maanthoppu-virundhu-pachai-milagai-chicken", newTitle: "Pachai Milagai Chicken (Kongu Green Chilli Chicken)", newSlug: "pachai-milagai-chicken" },
  // 18
  { currentSlug: "thottathu-virundhu-porichi-kotuna-paruppu-kuzhambu", newTitle: "Porichi Kotuna Paruppu (Quick Dal Gravy)", newSlug: "porichi-kotuna-paruppu" },
  // 19
  { currentSlug: "thottathu-virundhu-pottu-kadalai-kuzhambu", newTitle: "Pottu Kadalai Kuzhambu (Roasted Gram Gravy)", newSlug: "pottu-kadalai-kuzhambu" },
  // 20
  { currentSlug: "erode-aaya-karuveppilai-thokku", newTitle: "Karuveppilai Thokku (Curry Leaves Chutney)", newSlug: "karuveppilai-thokku" },
  // 21
  { currentSlug: "thottathu-virundhu-thakkali-mozhagu-aracha-kuzhambu", newTitle: "Thakkali Aracha Kuzhambu (Tomato Kuruma Gravy)", newSlug: "thakkali-aracha-kuzhambu" },
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Pre-flight: warn if any of the new slugs collide with EXISTING DB entries
    // that aren't part of this update batch.
    console.log("=== Pre-flight: slug-collision check ===");
    let collisions = 0;
    for (const u of updates) {
      if (u.newSlug === u.currentSlug) continue;
      const conflict = await Recipe.findOne({ slug: u.newSlug }).select("_id slug dishName.en").lean();
      if (conflict && (conflict as any).slug !== u.currentSlug) {
        console.log(`  COLLISION: newSlug "${u.newSlug}" already used by _id=${(conflict as any)._id} (${(conflict as any).dishName?.en})`);
        collisions++;
      }
    }
    if (collisions > 0) {
      console.log(`\nAborting — ${collisions} slug collision(s) found. Resolve and rerun.`);
      return;
    }
    console.log("  All slugs clear ✓\n");

    // Apply updates
    console.log("=== Applying updates ===");
    let success = 0;
    let missing = 0;
    let titleLenWarning = 0;
    for (const u of updates) {
      const recipe = await Recipe.findOne({ slug: u.currentSlug });
      if (!recipe) {
        console.log(`  MISSING: ${u.currentSlug} (no recipe found, skipped)`);
        missing++;
        continue;
      }

      if (u.newTitle.length > 100) {
        console.log(`  WARN: title for ${u.currentSlug} exceeds 100 chars (${u.newTitle.length}) — will fail validation`);
        titleLenWarning++;
        continue;
      }

      const oldSlug = recipe.slug;
      const oldTitle = recipe.title || "(none)";
      recipe.title = u.newTitle;
      recipe.slug = u.newSlug;

      await recipe.save();

      const slugChanged = oldSlug !== u.newSlug ? `[slug: ${oldSlug} → ${u.newSlug}]` : `[slug unchanged: ${u.newSlug}]`;
      console.log(`  ✓ ${recipe._id} | title: "${oldTitle}" → "${u.newTitle}" ${slugChanged}`);
      success++;
    }

    console.log(`\n=== Done: ${success} updated, ${missing} missing, ${titleLenWarning} title-too-long ===`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

run();
