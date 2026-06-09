import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

const SLUGS = [
  // missing SEO
  "salem-windsor-castle-biryani",
  "organic-chola-santhagai",
  "dindigul-jaffer-nei-soru",
  "dindigul-mujib-chicken-biryani",
  "dindigul-mujib-mutton-dalcha",
  "dindigul-jaffer-kalyana-veetu-mutton-biryani",
  "dindigul-jaffer-veg-dum-biryani",
  "dindigul-kola-urundai",
  // dirty SEO (person/brand attribution)
  "erode-malli-poo-idly-with-tomato-chutney",
  "erode-aaya-murungaikeerai-chutney",
  "sundakkai-chutney",
  "paruppu-thuvayal",
  "vayirukku-idhama-biryani",
  "thengai-poondu-podi",
  "porichi-kotuna-paruppu-kuzhambu",
  "pottu-kadalai-kuzhambu",
  "karuveppilai-thokku",
  "thakkali-mozhagu-aracha-kuzhambu",
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  for (const slug of SLUGS) {
    const r: any = await Recipe.findOne({ slug })
      .select("dishName title seo slug description tags")
      .lean();
    if (!r) {
      console.log(`MISSING IN DB: ${slug}`);
      continue;
    }
    console.log(`==== ${r.slug} ====`);
    console.log(`dishName.en: ${r.dishName?.en}`);
    console.log(`dishName.ta: ${r.dishName?.ta}`);
    console.log(`title.en   : ${r.title?.en || "(none)"}`);
    console.log(`title.ta   : ${r.title?.ta || "(none)"}`);
    console.log(`desc.en    : ${(r.description?.en || "").slice(0, 200)}`);
    console.log(`seo.title.en: ${r.seo?.title?.en || "(none)"}`);
    console.log(`seo.title.ta: ${r.seo?.title?.ta || "(none)"}`);
    console.log(`seo.desc.en : ${r.seo?.description?.en || "(none)"}`);
    console.log(`seo.desc.ta : ${r.seo?.description?.ta || "(none)"}`);
    console.log(`seo.keys    : ${(r.seo?.keywords || []).slice(0, 12).join(", ")}`);
    console.log("");
  }

  await mongoose.disconnect();
})();
