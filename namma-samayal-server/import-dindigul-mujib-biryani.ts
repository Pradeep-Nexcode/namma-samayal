import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList: Array<{
  slug: string;
  name: string;
  ta: string;
  quantity: string;
  unit: string;
  categorySlug?: string;
}> = [
  // Main components
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "3", unit: "kg" },
  { slug: "chicken", name: "Chicken (biryani pieces)", ta: "கோழி (பிரியாணி துண்டுகள்)", quantity: "4", unit: "kg" },
  { slug: "mutton-fat", name: "Mutton Fat (Kozhuppu) — SECRET commercial flavor", ta: "ஆட்டு கொழுப்பு — ரகசிய சுவை", quantity: "100", unit: "g", categorySlug: "red-meat" },

  // Aromatic masala base
  { slug: "big-onion", name: "Big Onion (Pallari, thinly sliced)", ta: "பெரிய வெங்காயம் (மெல்லியதாக நறுக்கியது)", quantity: "400", unit: "g" },
  { slug: "garlic", name: "Garlic Paste (freshly ground) — 2:1 ratio vs ginger", ta: "பூண்டு விழுது (புதிய) — இஞ்சியை விட இரட்டை", quantity: "400", unit: "g" },
  { slug: "ginger", name: "Ginger Paste (freshly ground)", ta: "இஞ்சி விழுது (புதிய)", quantity: "200", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli (slit — ALL the heat)", ta: "பச்சை மிளகாய் (கீறியது — முழு காரம்)", quantity: "25-30", unit: "nos" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1", unit: "large handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli)", ta: "கொத்தமல்லி", quantity: "1", unit: "large handful" },
  { slug: "curd", name: "Curd (Thayir)", ta: "தயிர்", quantity: "200", unit: "g" },
  { slug: "lemon", name: "Lemon (juiced)", ta: "எலுமிச்சை (சாறு)", quantity: "1", unit: "no" },

  // Fats & spices
  { slug: "groundnut-oil", name: "Oil + Ghee Mix (50/50)", ta: "எண்ணெய் + நெய் கலவை (50/50)", quantity: "800", unit: "g total" },
  { slug: "ghee", name: "Ghee (part of the 800g oil+ghee mix)", ta: "நெய் (800 கிராம் கலவையின் ஒரு பகுதி)", quantity: "400", unit: "g" },
  { slug: "cinnamon", name: "Cinnamon (Pattai)", ta: "இலவங்கப்பட்டை", quantity: "30", unit: "g" },
  { slug: "cardamom", name: "Cardamom (Yelakkai)", ta: "ஏலக்காய்", quantity: "20", unit: "g" },
  { slug: "cloves", name: "Cloves (Kirambu)", ta: "கிராம்பு", quantity: "10", unit: "g" },
  { slug: "star-anise", name: "Star Anise (Annachi Poo)", ta: "அன்னாசிப்பூ", quantity: "10", unit: "g" },
  { slug: "crystal-salt", name: "Crystal Salt (Kalluppu)", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "dindigul-mujib-chicken-biryani";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "poultry" }) || await Category.findOne();
    if (!fallbackCategory) throw new Error("No category found");

    const recipeIngredients = [];
    for (const item of ingredientsList) {
      let ingredient = await Ingredient.findOne({ slug: item.slug });

      if (!ingredient) {
        const cat = item.categorySlug
          ? (await Category.findOne({ slug: item.categorySlug })) || fallbackCategory
          : fallbackCategory;

        ingredient = await Ingredient.create({
          name: { en: item.name, ta: item.ta },
          slug: item.slug,
          category: cat._id,
          isActive: true,
        });
        console.log(`Created ingredient: ${item.name} (${item.slug})`);
      } else {
        console.log(`Reused ingredient: ${ingredient.name.en} (${ingredient.slug})`);
      }

      recipeIngredients.push({
        ingredient: ingredient._id,
        quantity: item.quantity,
        unit: item.unit,
        ingredientSnapshot: { en: item.name, ta: item.ta },
      });
    }

    const newRecipe = new Recipe({
      dishName: {
        en: "Dindigul Mujib Chicken Biryani (Commercial-Scale Masterclass)",
        ta: "திண்டுக்கல் முஜிப் சிக்கன் பிரியாணி (வணிக அளவு மாஸ்டர் கிளாஸ்)",
      },
      title: "Dindigul Mujib Chicken Biryani",
      slug,
      description: {
        en: "The legendary commercial-scale chicken biryani from Mujib Biryani in Dindigul — the recipe that can literally open a biryani shop. Built on four uncompromising Dindigul commercial rules: (1) the secret 100g of pure mutton fat (kozhuppu) added to the base to give chicken biryani the heavy, complex flavor that usually only comes from mutton, (2) a generous 4:3 meat-to-rice ratio (4 kg chicken : 3 kg Seeraga Samba) so every bite has a piece of meat, (3) the strict 2:1 garlic-to-ginger formula (400g garlic + 200g ginger) that prevents the huge batch from turning sharp and bitter, and (4) the 'Zero Powder' purity — NO red chilli powder, NO coriander powder, NO biryani masala; the heat comes entirely from 25-30 green chillies, the depth from whole spices and the mutton fat infusion.",
        ta: "திண்டுக்கல் முஜிப் பிரியாணியின் புகழ்பெற்ற வணிக-அளவு கோழி பிரியாணி — பார்த்தாலே ஒரு பிரியாணி கடை திறக்கக்கூடிய செய்முறை. நான்கு கட்டாய திண்டுக்கல் வணிக விதிகளில் கட்டப்பட்டது: (1) ஆட்டிறைச்சி பிரியாணியில் வரும் கனமான, சிக்கலான சுவையை கோழி பிரியாணிக்கு தர, அடிப்படையில் சேர்க்கப்படும் ரகசிய 100 கிராம் தூய ஆட்டு கொழுப்பு, (2) ஒவ்வொரு கடியிலும் இறைச்சி இருக்க, தாராளமான 4:3 இறைச்சி-அரிசி விகிதம் (4 கிலோ கோழி : 3 கிலோ சீரக சம்பா), (3) பெரிய அளவு பிரியாணி கூரிய, கசப்பான சுவை கொள்ளாமல் இருக்க, கட்டாய 2:1 பூண்டு-இஞ்சி சூத்திரம் (400 கிராம் பூண்டு + 200 கிராம் இஞ்சி), மற்றும் (4) 'மசாலா தூள் இல்லை' தூய்மை — மிளகாய் தூள் இல்லை, கொத்தமல்லி தூள் இல்லை, பிரியாணி மசாலா இல்லை; காரம் முற்றிலும் 25-30 பச்சை மிளகாயிலிருந்தே, ஆழம் முழு மசாலா மற்றும் ஆட்டு கொழுப்பு வாசனையிலிருந்தே வருகிறது.",
      },
      speciality: {
        en: "Four uncompromising commercial Dindigul rules define Mujib Biryani: (1) The Mutton-Fat Trade Secret — 100g of pure kozhuppu rendered into the base. This is THE big shop secret most home cooks never learn. The mutton fat gives a chicken biryani the heavy, complex, almost-mutton mouthfeel that customers can't quite place but always crave. Skip it and you have a regular chicken biryani. (2) The 4:3 Meat-to-Rice Ratio — most home biryanis use 1:1 chicken to rice; Mujib uses 4 kg chicken to 3 kg rice. Customers expect a chicken piece in every spoonful, and the bigger meat ratio also leaves more chicken stock to flavor the rice. (3) The 2:1 Garlic-to-Ginger Formula — Dindigul commercial wisdom: at huge batch scale, equal ginger produces a sharp, bitter, almost-medicinal note that ruins the whole pot. The double-garlic ratio (400g garlic + 200g ginger) keeps the base mellow, savoury and shop-grade. (4) Zero Masala Powders — no chilli powder, no coriander powder, no garam masala. Heat comes purely from 25-30 green chillies; depth comes from whole spices in commercial quantities (30g cinnamon, 20g cardamom, 10g cloves, 10g star anise). The result is a clean, raw Dindigul flavor profile that you cannot fake with packet masala.",
        ta: "முஜிப் பிரியாணியின் நான்கு கட்டாய திண்டுக்கல் வணிக விதிகள்: (1) ஆட்டு-கொழுப்பு வர்த்தக ரகசியம் — அடிப்படையில் கரைக்கப்படும் 100 கிராம் தூய கொழுப்பு. இதுவே பெரும்பாலான வீட்டு சமையற்காரர்கள் அறியாத பெரிய கடை ரகசியம். ஆட்டு கொழுப்பு கோழி பிரியாணிக்கு கனமான, சிக்கலான, கிட்டத்தட்ட-ஆட்டிறைச்சி போன்ற வாய் உணர்வை தருகிறது — வாடிக்கையாளர்களால் அடையாளம் காண முடியாது, ஆனால் எப்போதும் வேண்டும். இதை தவிர்த்தால் சாதாரண கோழி பிரியாணி. (2) 4:3 இறைச்சி-அரிசி விகிதம் — பெரும்பாலான வீட்டு பிரியாணிகள் 1:1 விகிதம்; முஜிப் 4 கிலோ கோழி : 3 கிலோ அரிசி பயன்படுத்துகிறது. ஒவ்வொரு ஸ்பூனிலும் ஒரு கோழி துண்டை வாடிக்கையாளர்கள் எதிர்பார்க்கின்றனர், அதிக இறைச்சி விகிதம் அரிசிக்கு சுவைக்க அதிக கோழி சாற்றையும் விட்டுச் செல்கிறது. (3) 2:1 பூண்டு-இஞ்சி சூத்திரம் — திண்டுக்கல் வணிக ஞானம்: பெரிய தொகை அளவில், சம இஞ்சி கூரிய, கசப்பான, கிட்டத்தட்ட மருந்து போன்ற சுவையை தந்து முழு பானையையும் கெடுக்கிறது. இரட்டை-பூண்டு விகிதம் (400 கிராம் பூண்டு + 200 கிராம் இஞ்சி) அடிப்படையை மென்மையாக, சுவையாக, கடை-தரத்தில் வைக்கிறது. (4) மசாலா தூள்கள் இல்லை — மிளகாய் தூள் இல்லை, கொத்தமல்லி தூள் இல்லை, கரம் மசாலா இல்லை. காரம் முற்றிலும் 25-30 பச்சை மிளகாயிலிருந்தே; ஆழம் வணிக அளவில் முழு மசாலாக்களிலிருந்தே (30 கிராம் இலவங்கப்பட்டை, 20 கிராம் ஏலக்காய், 10 கிராம் கிராம்பு, 10 கிராம் அன்னாசிப்பூ) வருகிறது. முடிவு: பாக்கெட் மசாலாவால் போலி செய்ய முடியாத, தூய, கச்சா திண்டுக்கல் சுவை சுயவிவரம்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        city: "Dindigul",
      },
      prepTime: 45,
      cookingTime: 90,
      totalTime: 135,
      servings: 30,
      difficulty: "hard",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=91hyX0x8K9w",
      },
      tags: [
        "non-veg",
        "biryani",
        "chicken-biryani",
        "dindigul",
        "dindigul-biryani",
        "mujib-biryani",
        "seeraga-samba",
        "dum-biryani",
        "commercial-scale",
        "shop-recipe",
        "masterclass",
        "mutton-fat",
        "kozhuppu",
        "high-meat-ratio",
        "double-garlic",
        "no-masala-powder",
        "zero-powder",
        "wedding-biryani",
        "feast",
        "virundhu",
        "tamil-nadu",
        "iconic",
        "traditional",
      ],
      searchKeywords: [
        "dindigul biryani",
        "dindigul mujib biryani",
        "mujib chicken biryani",
        "திண்டுக்கல் பிரியாணி",
        "முஜிப் பிரியாணி",
        "dindigul chicken biryani",
        "commercial biryani recipe",
        "shop biryani recipe",
        "seeraga samba chicken biryani",
        "mutton fat biryani",
        "kozhuppu biryani",
        "chef deena dindigul biryani",
        "dindigul biryani masterclass",
        "no masala chicken biryani",
        "feast chicken biryani",
        "wedding chicken biryani",
      ],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      steps: [],
      sections: [
        {
          type: "preparation",
          title: { en: "Prep", ta: "முன் தயாரிப்பு" },
          steps: [
            {
              step: 1,
              description: {
                en: "Wash the 3 kg of Seeraga Samba rice gently 2-3 times until the water runs clear. Soak in fresh water for 20-30 minutes. Drain just before adding to the broth.",
                ta: "3 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவவும். 20-30 நிமிடம் சுத்தமான தண்ணீரில் ஊறவைக்கவும். சாற்றில் சேர்ப்பதற்கு சற்று முன்பு வடிக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Clean the 4 kg of chicken thoroughly and cut into LARGE biryani pieces (not small ones — commercial biryani wants big chunks of meat in every spoon).",
                ta: "4 கிலோ கோழியை நன்கு சுத்தம் செய்து, பெரிய பிரியாணி துண்டுகளாக வெட்டவும் (சிறிய துண்டுகள் வேண்டாம் — வணிக பிரியாணியில் ஒவ்வொரு ஸ்பூனிலும் பெரிய இறைச்சி துண்டுகள் தேவை).",
              },
            },
            {
              step: 3,
              description: {
                en: "Cut the 100g of mutton fat into small dice — this helps it render down quickly into the hot oil.",
                ta: "100 கிராம் ஆட்டு கொழுப்பை சிறிய துண்டுகளாக நறுக்கவும் — இது சூடான எண்ணெயில் விரைவாக கரைய உதவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Peel and thinly slice the 400g of big onions (Pallari). Slit the 25-30 green chillies lengthwise. Pick the mint and coriander leaves off their stems and roughly chop. Whisk the 200g of curd until smooth. Juice the lemon.",
                ta: "400 கிராம் பெரிய வெங்காயத்தை தோல் சீவி, மெல்லியதாக நீளமாக நறுக்கவும். 25-30 பச்சை மிளகாயை நீளவாக்கில் கீறவும். புதினா மற்றும் கொத்தமல்லியை காம்பிலிருந்து பிரித்து பெரிய துண்டுகளாக நறுக்கவும். 200 கிராம் தயிரை மிருதுவாக கடையவும். எலுமிச்சையை பிழியவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Grind a FRESH garlic paste from 400g of garlic. Grind a SEPARATE fresh ginger paste from 200g of ginger. Critical: the 2:1 garlic-to-ginger ratio is the Dindigul commercial signature — equal ginger at this scale produces a sharp, bitter note that destroys the whole pot.",
                ta: "400 கிராம் பூண்டை புதிதாக விழுதாக அரைக்கவும். 200 கிராம் இஞ்சியை தனியாக புதிதாக விழுதாக அரைக்கவும். மிக முக்கியம்: 2:1 பூண்டு-இஞ்சி விகிதம் திண்டுக்கல் வணிக தனிச்சிறப்பு — இந்த அளவில் சம இஞ்சி கூரிய, கசப்பான சுவையை தந்து முழு பானையையும் அழிக்கும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Fat & Spice Infusion (THE Mujib Secret)", ta: "கொழுப்பு + மசாலா இணைப்பு (முஜிப் ரகசியம்)" },
          steps: [
            {
              step: 6,
              description: {
                en: "Place a massive biryani dekchi over a high-flame wood fire or a heavy commercial stove. Pour in the FULL 800g of oil + ghee mix (roughly 400 ml oil + 400 g ghee). The oil prevents the ghee from burning during the long sauté.",
                ta: "ஒரு பெரிய பிரியாணி தேக்சியை விறகு அடுப்பு அல்லது தடிமனான வணிக அடுப்பில் வைக்கவும். முழு 800 கிராம் எண்ணெய் + நெய் கலவை (சுமார் 400 மிலி எண்ணெய் + 400 கிராம் நெய்) ஊற்றவும். எண்ணெய் நீண்ட வதக்குதலில் நெய் கருகாமல் தடுக்கிறது.",
              },
            },
            {
              step: 7,
              description: {
                en: "THE TRADE SECRET: drop in the 100g of diced MUTTON FAT (kozhuppu) into the hot oil. Render it down for 2-3 minutes, stirring — the fat will slowly melt and dissolve into the oil-ghee, releasing a deep meaty aroma. This is what gives Mujib's chicken biryani its almost-mutton complexity. Discard any solid bits left behind.",
                ta: "வர்த்தக ரகசியம்: நறுக்கிய 100 கிராம் ஆட்டு கொழுப்பை சூடான எண்ணெயில் சேர்க்கவும். 2-3 நிமிடம் கிளறி கரைக்கவும் — கொழுப்பு மெதுவாக உருகி எண்ணெய்-நெய்யில் கலந்து, ஆழமான இறைச்சி வாசனையை வெளியேற்றும். இதுவே முஜிப் கோழி பிரியாணிக்கு கிட்டத்தட்ட-ஆட்டிறைச்சி சிக்கல் சுவையை தருகிறது. மீதமுள்ள திட பகுதிகளை எடுத்து வீசவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the massive whole spice quantities all at once: 30g cinnamon, 20g cardamom, 10g cloves, and 10g star anise. Let them crackle and bloom in the now mutton-fat-infused oil for 60-90 seconds — the kitchen will fill with a regal aroma.",
                ta: "பெரிய அளவு முழு மசாலாக்களை அனைத்தையும் ஒன்றாக சேர்க்கவும்: 30 கிராம் இலவங்கப்பட்டை, 20 கிராம் ஏலக்காய், 10 கிராம் கிராம்பு, மற்றும் 10 கிராம் அன்னாசிப்பூ. ஆட்டு கொழுப்பு இணைந்த எண்ணெயில் 60-90 விநாடிகள் வாசனை வெளிப்பட விடவும் — சமையலறை அரசியல் வாசனையால் நிறையும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Base", ta: "அடிப்படை வதக்கல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Add the 400g of sliced big onions. Sauté patiently on medium-high heat, stirring often, until they turn TRANSLUCENT and LIGHTLY GOLDEN — about 10-12 minutes. Note: do NOT darken them like a typical biryani — Dindigul style keeps onions light so the final color stays clean.",
                ta: "400 கிராம் நறுக்கிய பெரிய வெங்காயத்தை சேர்க்கவும். மிதமான-உயர் தீயில் தொடர்ந்து கிளறி, பளபளப்பாகி, லேசான பொன்னிறம் வரும் வரை — சுமார் 10-12 நிமிடம் — பொறுமையாக வதக்கவும். குறிப்பு: சாதாரண பிரியாணியை போல கருக்க வேண்டாம் — திண்டுக்கல் பாணி வெங்காயத்தை லேசாக வைக்கிறது, இதனால் இறுதி நிறம் தூய்மையாக இருக்கும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Toss in the 25-30 slit green chillies. Sauté for 30-60 seconds — they'll sizzle and release their fresh heat into the fat. This is the dish's ONLY heat source, so don't reduce the count.",
                ta: "25-30 கீறிய பச்சை மிளகாயை சேர்க்கவும். 30-60 விநாடிகள் வதக்கவும் — அவை சீறி புதிய காரத்தை எண்ணெயில் வெளியிடும். இதுவே உணவின் ஒரே காரத் தடம், எனவே எண்ணிக்கையை குறைக்க வேண்டாம்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the freshly ground GARLIC paste FIRST (the full 400g). Sauté vigorously for 3-4 minutes, stirring constantly so it doesn't catch at the bottom — the raw garlic smell must completely vanish. Garlic-first is the Dindigul technique.",
                ta: "புதிய பூண்டு விழுதை முதலில் சேர்க்கவும் (முழு 400 கிராம்). 3-4 நிமிடம் வேகமாக, அடியில் ஒட்டாமல் இருக்க தொடர்ந்து கிளறி வதக்கவும் — பச்சை பூண்டு வாசனை முற்றிலும் போக வேண்டும். முதலில் பூண்டு என்பது திண்டுக்கல் நுட்பம்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Now add the freshly ground GINGER paste (200g). Sauté another 2-3 minutes until the raw ginger smell also disappears completely. The base will look glossy with the fat layer floating on top.",
                ta: "இப்போது புதிய இஞ்சி விழுதை (200 கிராம்) சேர்க்கவும். பச்சை இஞ்சி வாசனையும் முற்றிலும் போகும் வரை மேலும் 2-3 நிமிடம் வதக்கவும். அடிப்படை பளபளப்பாக இருக்க வேண்டும், மேலே கொழுப்பு அடுக்கு மிதக்க வேண்டும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Herbs & Acidity (Curd + Lemon Cuts the Fat)", ta: "மூலிகைகள் + புளிப்பு (கொழுப்பை வெட்டும்)" },
          steps: [
            {
              step: 13,
              description: {
                en: "Drop in the full handfuls of fresh mint and coriander leaves. Let them WILT into the hot ghee — about 30-60 seconds. The herbal oils release directly into the fat layer.",
                ta: "முழு கைப்பிடி புதிய புதினா மற்றும் கொத்தமல்லியை சேர்க்கவும். சூடான நெய்யில் வாட விடவும் — சுமார் 30-60 விநாடிகள். மூலிகை எண்ணெய்கள் நேரடியாக கொழுப்பில் வெளியேறும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Pour in the 200g of whisked curd GRADUALLY (so it doesn't split) and immediately squeeze in the juice of 1 lemon. The acidity from curd + lemon CUTS THROUGH the heavy mutton-fat-ghee base and keeps the biryani from feeling oily on the palate. Mix thoroughly until the oil separates and floats as a clear glossy layer.",
                ta: "200 கிராம் கடைந்த தயிரை மெதுவாக ஊற்றவும் (பிரியாமல் இருக்க) மற்றும் உடனே 1 எலுமிச்சையின் சாற்றை பிழியவும். தயிர் + எலுமிச்சை புளிப்பு கனமான ஆட்டு-கொழுப்பு-நெய் அடிப்படையை வெட்டி, பிரியாணி நாக்கில் எண்ணெய்த்தனமாக உணரப்படாமல் வைக்கிறது. எண்ணெய் பிரிந்து தெளிவான பளபளக்கும் அடுக்காக மிதக்கும் வரை நன்கு கலக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Meat (4 kg Chicken)", ta: "இறைச்சி வேக வைத்தல் (4 கிலோ கோழி)" },
          steps: [
            {
              step: 15,
              description: {
                en: "Drop the FULL 4 kg of chicken pieces directly into this intensely fat-rich, fragrant base. Add the required crystal salt (start with a generous handful for this volume).",
                ta: "முழு 4 கிலோ கோழி துண்டுகளை நேரடியாக இந்த தீவிர கொழுப்பு-நிறைந்த, வாசனை மிக்க அடிப்படையில் சேர்க்கவும். தேவையான கல் உப்பு சேர்க்கவும் (இந்த அளவுக்கு ஒரு தாராளமான கைப்பிடியில் ஆரம்பிக்கவும்).",
              },
            },
            {
              step: 16,
              description: {
                en: "Mix thoroughly so every chicken piece is coated. Let the meat sear and roast in the spices on medium-high heat for about 10 minutes, turning often — the chicken will absorb the mutton fat aroma and change color from pink to golden-brown. Don't add water yet.",
                ta: "ஒவ்வொரு கோழி துண்டிலும் மசாலா படியும் வரை நன்கு கலக்கவும். மிதமான-உயர் தீயில், அடிக்கடி புரட்டி, கோழி மசாலாவில் வறுபட விடவும் சுமார் 10 நிமிடம் — கோழி ஆட்டு கொழுப்பு வாசனையை உள்ளீர்த்து, இளஞ்சிவப்பிலிருந்து பொன்னிற பழுப்பாக மாறும். இன்னும் தண்ணீர் சேர்க்க வேண்டாம்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Boiling Broth", ta: "கொதிக்கும் சாறு" },
          steps: [
            {
              step: 17,
              description: {
                en: "Pour in the measured water for 3 kg of Seeraga Samba rice — approximately 4.5-6 liters (newer rice needs less; drier older rice needs more). Cover the vessel and let the broth come to a rolling, vigorous boil.",
                ta: "3 கிலோ சீரக சம்பா அரிசிக்கு அளவீடு செய்த தண்ணீர் ஊற்றவும் — சுமார் 4.5-6 லிட்டர் (புதிய அரிசிக்கு குறைவாக; பழைய காய்ந்த அரிசிக்கு அதிகமாக). பாத்திரத்தை மூடி, சாறு நன்கு கொதிக்க விடவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Critical salt check: taste the boiling broth. It MUST be slightly saltier than a normal soup — distinctly seawater-salty. The rice will absorb a lot of this salt as it cooks. Adjust crystal salt now before adding rice.",
                ta: "மிக முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். சாதாரண சூப்பை விட சற்று அதிக உப்பு — தெளிவாக கடல்நீர் உப்பு — இருக்க வேண்டும். அரிசி வேக வேக இந்த உப்பை நிறைய உள்ளீர்க்கும். அரிசி சேர்ப்பதற்கு முன் கல் உப்பை இப்போது சரிசெய்யவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Dum", ta: "தம்" },
          steps: [
            {
              step: 19,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice. Gently slide the rice into the boiling chicken broth — don't dump it in. Mix once very gently from the bottom; the tiny Seeraga Samba grains break easily.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுமையாக வடிக்கவும். கொதிக்கும் கோழி சாற்றில் அரிசியை மெதுவாக சேர்க்கவும் — வேகமாக போட வேண்டாம். அடியிலிருந்து மிக மெதுவாக ஒரு முறை கலக்கவும்; சீரக சம்பாவின் சிறிய தானியங்கள் எளிதில் உடையும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Cook on medium-high flame, uncovered, until about 75% of the water has evaporated and the rice begins to surface — usually 12-18 minutes for 3 kg of rice. This is the dum-ready signal.",
                ta: "மிதமான-உயர் தீயில் மூடாமல், சுமார் 75% தண்ணீர் ஆவியாகி, அரிசி மேற்பரப்பில் தெரிய ஆரம்பிக்கும் வரை — 3 கிலோ அரிசிக்கு வழக்கமாக 12-18 நிமிடம் — வேக விடவும். இதுவே தம் வைக்க தயார் என்பதற்கான அடையாளம்.",
              },
            },
            {
              step: 21,
              description: {
                en: "Lower the flame to the absolute minimum. Seal the vessel tightly with a banana leaf placed under a heavy lid (traditional Dindigul method) or with a tight lid + heavy weight + wheat-dough seal around the edges. The goal: trap ALL the steam.",
                ta: "தீயை மிக குறைந்த அளவுக்கு குறைக்கவும். கனமான மூடியின் கீழ் வாழை இலையை வைத்து பாத்திரத்தை இறுக்கமாக மூடவும் (பாரம்பரிய திண்டுக்கல் முறை) அல்லது இறுக்கமான மூடி + கனமான பாரம் + ஓரத்தில் கோதுமை மாவு முத்திரையால் மூடவும். நோக்கம்: எல்லா ஆவியையும் அடைக்கவும்.",
              },
            },
            {
              step: 22,
              description: {
                en: "Leave it on dum for EXACTLY 20 minutes — undisturbed. No peeking; every escaping wisp of steam is lost flavour. This 20-minute dum is what locks in the authentic Dindigul aroma.",
                ta: "சரியாக 20 நிமிடம் தம்மில் தொடாமல் வைக்கவும். எட்டிப்பார்க்க வேண்டாம்; வெளியேறும் ஒவ்வொரு ஆவி குமிழும் இழந்த சுவையே. இந்த 20-நிமிட தம்தான் அசலான திண்டுக்கல் வாசனையை அடைத்து வைக்கிறது.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Resting & Serving", ta: "ஓய்வு + பரிமாறுதல்" },
          steps: [
            {
              step: 23,
              description: {
                en: "Turn off the heat. Let the vessel rest with the seal still intact for another 10 minutes — the trapped mutton-fat-and-ghee aroma settles into every grain.",
                ta: "அடுப்பை அணைக்கவும். முத்திரையை அப்படியே வைத்து இன்னும் 10 நிமிடம் ஓய்வு கொடுக்கவும் — அடைபட்ட ஆட்டு-கொழுப்பு + நெய் வாசனை ஒவ்வொரு தானியத்திலும் நிலையாகும்.",
              },
            },
            {
              step: 24,
              description: {
                en: "Open the lid — the unmistakable Mujib biryani aroma will fill the room (mutton-fat richness + green chilli heat + whole spice depth + Seeraga Samba fragrance). Using a flat ladle (not a spoon), gently fluff the biryani from the edges inward toward the center — lift and turn, don't stir. The tiny grains break if stirred.",
                ta: "மூடியை திறக்கவும் — தனிச்சிறப்பான முஜிப் பிரியாணி வாசனை அறை முழுவதும் பரவும் (ஆட்டு கொழுப்பு செழுமை + பச்சை மிளகாய் காரம் + முழு மசாலா ஆழம் + சீரக சம்பா வாசனை). தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். கிளறினால் சிறிய தானியங்கள் உடையும்.",
              },
            },
            {
              step: 25,
              description: {
                en: "Serve this iconic Dindigul Mujib biryani steaming hot. The classic shop pairings: cool onion-mint raita, a spicy chicken side gravy, brinjal kurma, and a wedge of lemon. Place 1-2 big chicken pieces visibly on top of each plate — that's the Mujib presentation signature.",
                ta: "இந்த புகழ்பெற்ற திண்டுக்கல் முஜிப் பிரியாணியை சூடாக பரிமாறவும். கிளாசிக் கடை சேர்க்கைகள்: குளிர்ந்த வெங்காய-புதினா ரெய்தா, காரமான கோழி குழம்பு, கத்திரிக்காய் குருமா, மற்றும் ஒரு துண்டு எலுமிச்சை. ஒவ்வொரு தட்டின் மேலும் 1-2 பெரிய கோழி துண்டுகளை தெரியும்படி வைக்கவும் — அதுவே முஜிப் வழங்கல் தனிச்சிறப்பு.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Dindigul Mujib Chicken Biryani recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
