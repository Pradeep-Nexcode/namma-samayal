import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

/**
 * Sets a short, SEO-friendly, user-facing `title` on every recipe touched
 * this session, and updates the `slug` to match.
 *
 *   - `dishName` (bilingual, attributed/restaurant-style) is preserved → admin-only.
 *   - `title` (English, <= 100 chars) is the new user-facing display name.
 *   - `slug` is updated to be cleaner and SEO-friendly.
 *
 * Idempotent: re-running just re-applies the same values.
 * Collision-safe: before changing a slug, checks that no OTHER recipe holds it.
 */

interface Update {
  oldSlug: string;
  title: string;
  newSlug: string;
}

const updates: Update[] = [
  { oldSlug: "erode-aaya-sundakkai-chutney", title: "Sundakkai Chutney (Turkey Berry Chutney)", newSlug: "sundakkai-chutney" },
  { oldSlug: "erode-aaya-meen-kuzhambu", title: "Meen Kuzhambu (Tamil Fish Curry)", newSlug: "meen-kuzhambu" },
  { oldSlug: "erode-pachai-milagai-pallipalayam-chicken", title: "Pallipalayam Pachai Milagai Chicken", newSlug: "pallipalayam-pachai-milagai-chicken" },
  { oldSlug: "kongunattu-chola-paniyaram", title: "Chola Paniyaram (Sorghum Paniyaram)", newSlug: "chola-paniyaram" },
  { oldSlug: "kongu-pacha-payaru-kuzhambu", title: "Pacha Payaru Kuzhambu (Green Moong Curry)", newSlug: "pacha-payaru-kuzhambu" },
  { oldSlug: "erode-kongu-ennai-kathirikai-kuzhambu", title: "Ennai Kathirikai Kuzhambu", newSlug: "ennai-kathirikai-kuzhambu" },
  { oldSlug: "erode-mutton-uppu-kari", title: "Mutton Uppu Kari (Salted Mutton Roast)", newSlug: "mutton-uppu-kari" },
  { oldSlug: "erode-naatu-kozhi-biryani", title: "Home-Style Naatu Kozhi Biryani", newSlug: "home-style-naatu-kozhi-biryani" },
  { oldSlug: "muthu-mess-naattu-kozhi-kuzhambu", title: "Naatu Kozhi Kuzhambu (Country Chicken Gravy)", newSlug: "naatu-kozhi-kuzhambu" },
  { oldSlug: "bhai-veetu-biryani-muslim-wedding-style", title: "Bhai Veetu Biryani (Tamil Muslim Mutton Biryani)", newSlug: "bhai-veetu-biryani" },
  { oldSlug: "chinna-vengaya-kuzhambu", title: "Chinna Vengaya Kuzhambu (Shallot Tamarind Gravy)", newSlug: "chinna-vengaya-kuzhambu" },
  { oldSlug: "erode-aaya-paruppu-thuvayal", title: "Paruppu Thuvayal (Toor Dal Chutney)", newSlug: "paruppu-thuvayal" },
  { oldSlug: "thottathu-virundhu-vayirukku-idhama-biryani", title: "Vayirukku Idhama Naatu Kozhi Biryani", newSlug: "vayirukku-idhama-biryani" },
  { oldSlug: "sri-janani-catering-soya-sukka-varattu", title: "Soya Sukka (Soya Varattu)", newSlug: "soya-sukka" },
  { oldSlug: "maanthoppu-virundhu-mushroom-pallipalayam", title: "Mushroom Pallipalayam", newSlug: "mushroom-pallipalayam" },
  { oldSlug: "thottathu-virundhu-thengai-poondu-idicha-podi", title: "Thengai Poondu Podi (Coconut Garlic Podi)", newSlug: "thengai-poondu-podi" },
  { oldSlug: "maanthoppu-virundhu-pachai-milagai-chicken", title: "Pachai Milagai Chicken (Green Chilli Chicken)", newSlug: "pachai-milagai-chicken" },
  { oldSlug: "thottathu-virundhu-porichi-kotuna-paruppu-kuzhambu", title: "Porichi Kotuna Paruppu Kuzhambu", newSlug: "porichi-kotuna-paruppu-kuzhambu" },
  { oldSlug: "thottathu-virundhu-pottu-kadalai-kuzhambu", title: "Pottu Kadalai Kuzhambu (Roasted Gram Gravy)", newSlug: "pottu-kadalai-kuzhambu" },
  { oldSlug: "erode-aaya-karuveppilai-thokku", title: "Karuveppilai Thokku (Curry Leaves Chutney)", newSlug: "karuveppilai-thokku" },
  { oldSlug: "thottathu-virundhu-thakkali-mozhagu-aracha-kuzhambu", title: "Thakkali Mozhagu Aracha Kuzhambu", newSlug: "thakkali-mozhagu-aracha-kuzhambu" },
  { oldSlug: "erode-pichipotta-naatu-kozhi", title: "Pichipotta Naatu Kozhi (Shredded Country Chicken)", newSlug: "pichipotta-naatu-kozhi" },
];

async function run() {
  let fullUpdate = 0;
  let titleOnly = 0;
  let notFound = 0;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB. Processing ${updates.length} recipes...\n`);

    // Pre-flight: detect new-slug collisions
    const newSlugs = updates.map((u) => u.newSlug);
    const dupNew = newSlugs.filter((s, i) => newSlugs.indexOf(s) !== i);
    if (dupNew.length > 0) {
      console.log(`ABORT: duplicate new slugs in update list: ${dupNew.join(", ")}`);
      return;
    }

    for (const u of updates) {
      const recipe = await Recipe.findOne({ slug: u.oldSlug });
      if (!recipe) {
        console.log(`  [NOT FOUND]  ${u.oldSlug}`);
        notFound += 1;
        continue;
      }

      const oldSlugActual = recipe.slug;
      let slugChanged = false;

      if (u.newSlug !== recipe.slug) {
        const conflict = await Recipe.findOne({
          slug: u.newSlug,
          _id: { $ne: recipe._id },
        })
          .select("_id dishName")
          .lean();

        if (conflict) {
          const c: any = conflict;
          console.log(`  [TITLE ONLY - slug collision]  ${u.oldSlug}`);
          console.log(`     wanted slug "${u.newSlug}" already used by _id=${c._id} (${c.dishName?.en})`);
          recipe.title = u.title;
          await recipe.save();
          titleOnly += 1;
          continue;
        }

        recipe.slug = u.newSlug;
        slugChanged = true;
      }

      recipe.title = u.title;
      await recipe.save();

      if (slugChanged) {
        console.log(`  [UPDATED]  ${oldSlugActual}`);
        console.log(`     title: "${u.title}"`);
        console.log(`     slug:  "${oldSlugActual}" -> "${u.newSlug}"`);
        fullUpdate += 1;
      } else {
        console.log(`  [TITLE SET - slug unchanged]  ${u.oldSlug}`);
        console.log(`     title: "${u.title}"`);
        titleOnly += 1;
      }
    }

    console.log(`\nDone.`);
    console.log(`  Full update (title + slug):    ${fullUpdate}`);
    console.log(`  Title only (slug kept/skipped): ${titleOnly}`);
    console.log(`  Not found:                     ${notFound}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
