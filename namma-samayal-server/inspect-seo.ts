import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const recipes = await Recipe.find({})
    .select("dishName title seo slug")
    .sort({ createdAt: 1 })
    .lean();

  console.log(`TOTAL RECIPES: ${recipes.length}\n`);

  const missing: any[] = [];
  const weak: any[] = [];
  const good: any[] = [];

  for (const r of recipes) {
    const seo: any = (r as any).seo;
    const hasFullSeo =
      seo &&
      seo.title?.en &&
      seo.title?.ta &&
      seo.description?.en &&
      seo.description?.ta &&
      Array.isArray(seo.keywords) &&
      seo.keywords.length > 0;

    if (!seo || !seo.title?.en) {
      missing.push(r);
    } else if (!hasFullSeo) {
      weak.push(r);
    } else {
      good.push(r);
    }
  }

  console.log(`MISSING SEO: ${missing.length}`);
  missing.forEach((r: any) =>
    console.log(`  ${r._id} | ${r.slug} | dishName=${r.dishName?.en} | title=${r.title?.en}`)
  );

  console.log(`\nWEAK SEO (partial): ${weak.length}`);
  weak.forEach((r: any) => {
    const seo = r.seo;
    const flags = [];
    if (!seo?.title?.ta) flags.push("no title.ta");
    if (!seo?.description?.en) flags.push("no desc.en");
    if (!seo?.description?.ta) flags.push("no desc.ta");
    if (!seo?.keywords?.length) flags.push("no keywords");
    console.log(`  ${r._id} | ${r.slug} | dishName=${r.dishName?.en}`);
    console.log(`    flags: ${flags.join(", ")}`);
    console.log(`    seo.title.en: ${seo?.title?.en || "(empty)"}`);
  });

  console.log(`\nGOOD SEO: ${good.length}`);

  // Now check for SEO that still contains "person/brand" attribution
  const BANNED = [
    "jaffer",
    "mujib",
    "chef deena",
    "chef deenas",
    "deena's",
    "professor",
    "yasin",
    "kongu kitchen",
    "amma samayal",
    "amma cooking",
    "selvi amma",
    "thottathu virundhu",
    "ayyas",
    "aaya",
    "thatha",
    "patti",
    "amma'",
    "annachi",
    "mama",
    "village cooking",
  ];

  console.log(`\n=== RECIPES WITH PERSON/BRAND ATTRIBUTION IN SEO ===`);
  const dirty: any[] = [];
  for (const r of recipes) {
    const seo: any = (r as any).seo;
    if (!seo?.title?.en) continue;
    const haystack = [
      seo.title?.en,
      seo.title?.ta,
      seo.description?.en,
      seo.description?.ta,
      (seo.keywords || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const hits = BANNED.filter((b) => haystack.includes(b));
    if (hits.length > 0) {
      dirty.push({ r, hits });
    }
  }

  console.log(`COUNT: ${dirty.length}`);
  dirty.forEach(({ r, hits }: any) => {
    console.log(`  ${r._id} | ${r.slug}`);
    console.log(`    hits: ${hits.join(", ")}`);
    console.log(`    seo.title.en: ${r.seo?.title?.en}`);
    console.log(`    seo.title.ta: ${r.seo?.title?.ta}`);
    console.log(`    seo.desc.en: ${(r.seo?.description?.en || "").slice(0, 120)}...`);
  });

  await mongoose.disconnect();
})();
