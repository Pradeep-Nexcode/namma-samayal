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
  // Main base
  { slug: "country-chicken", name: "Country Chicken (Naattu Kozhi, fire-charred)", ta: "நாட்டு கோழி (தீயில் வாட்டியது)", quantity: "1", unit: "kg" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots) — half for grinding, half for sauté", ta: "சின்ன வெங்காயம் (பாதி அரைக்க, பாதி வதக்க)", quantity: "450", unit: "g" },
  { slug: "tomato", name: "Tomato", ta: "தக்காளி", quantity: "2", unit: "nos" },
  { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste (slightly more garlic)", ta: "இஞ்சி பூண்டு விழுது (பூண்டு சற்று அதிகம்)", quantity: "2", unit: "tbsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "1.5", unit: "tsp" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "generous", unit: "(for cooking)" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful (+ extra for masala)" },
  { slug: "coriander-leaves", name: "Coriander Leaves (for garnish)", ta: "கொத்தமல்லி (அலங்காரம்)", quantity: "1", unit: "generous handful" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },

  // Dry-roast masala
  { slug: "coriander-seeds", name: "Coriander Seeds (for fresh masala)", ta: "கொத்தமல்லி விதை (மசாலாவுக்கு)", quantity: "250", unit: "g" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies (for fresh masala)", ta: "காய்ந்த மிளகாய் (மசாலாவுக்கு)", quantity: "12", unit: "nos" },
  { slug: "fennel-seeds", name: "Fennel Seeds (for fresh masala)", ta: "சோம்பு (மசாலாவுக்கு)", quantity: "20", unit: "g" },
  { slug: "cumin-seeds", name: "Cumin Seeds (for fresh masala)", ta: "சீரகம் (மசாலாவுக்கு)", quantity: "20", unit: "g" },
  { slug: "black-pepper", name: "Black Pepper (for fresh masala)", ta: "மிளகு (மசாலாவுக்கு)", quantity: "10", unit: "g" },
  { slug: "cinnamon", name: "Cinnamon (for fresh masala)", ta: "இலவங்கப்பட்டை (மசாலாவுக்கு)", quantity: "3-4", unit: "small pieces" },
  { slug: "cloves", name: "Cloves (for fresh masala)", ta: "கிராம்பு (மசாலாவுக்கு)", quantity: "10", unit: "nos" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "muthu-mess-naattu-kozhi-kuzhambu";
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
        en: "Muthu Mess Naattu Kozhi Kuzhambu (Chithode-Erode Country Chicken Gravy)",
        ta: "முத்து மெஸ் நாட்டு கோழி குழம்பு (சித்தோடு, ஈரோடு)",
      },
      slug,
      description: {
        en: "The legendary 49-year-old country chicken gravy from Muthu Mess in Chithode, Erode — a small establishment that focuses on doing exactly one dish to perfection: naattu kozhi. The whole bird is fire-charred (theeyila vaatti) over open wood flame before being chopped, locking in a deep, rustic, smoky aroma. The gravy is built on a freshly hand-roasted spice blend — a full ¼ kg of coriander seeds, whole cumin, fennel, black pepper, cinnamon and cloves — ground together with sautéed shallots into a thick wet masala. Cooked the traditional way on wood-fire stoves into a thin, comforting Thanni Kuzhambu (soupy gravy) that pairs perfectly with idlies, dosas, or white rice.",
        ta: "சித்தோடு, ஈரோடு பகுதியில் 49 ஆண்டுகளாக ஓடி வரும் முத்து மெஸ் கடையின் புகழ்பெற்ற நாட்டு கோழி குழம்பு — அவர்கள் ஒரே ஒரு உணவை — நாட்டு கோழியை — மட்டுமே சிறப்பாக செய்கிறார்கள். முழு கோழியை திறந்த விறகு தீயில் 'தீயில வாட்டி' பின்பு சிறு துண்டுகளாக நறுக்குகிறார்கள் — இது தோலை இறுக்கி, ஆழமான கிராமத்து புகை வாசனையை இறைச்சிக்குள் பதிய வைக்கிறது. கால் கிலோ கொத்தமல்லி விதை, முழு சீரகம், சோம்பு, மிளகு, இலவங்கப்பட்டை மற்றும் கிராம்பு ஆகியவற்றை புதிதாக வறுத்து, வதங்கிய சின்ன வெங்காயத்துடன் சேர்த்து அரைத்த மசாலா அடிப்படை. பாரம்பரிய விறகு அடுப்பில் வேக வைக்கப்பட்ட மெல்லிய, ஆறுதலான 'தண்ணி குழம்பு' — இட்லி, தோசை, வெள்ளை சாதத்துடன் சிறப்பாக பொருந்தும்.",
      },
      speciality: {
        en: "Four signature Muthu Mess techniques: (1) 49 years of single-focus mastery — only naattu kozhi, perfected over decades. (2) Fire-charring the whole bird (theeyila vaatti) over open wood flame BEFORE chopping — locks the skin, infuses smoke directly into the meat; impossible to replicate by simply marinating or grilling pieces. (3) 100% wood-fire cooking (viragu aduppu) — the slow even heat tenderizes naattu kozhi in a way gas stoves cannot. (4) Hand-roasted fresh masala with an unusually heavy ¼ kg of coriander seeds (the dominant flavor) and only 1.5 tsp of chilli powder — making it a comforting Thanni Kuzhambu that is highly flavorful but intentionally not aggressive on heat. Garlic in the ginger-garlic paste is slightly higher than ginger for character.",
        ta: "முத்து மெஸ்ஸின் நான்கு தனிச்சிறப்பு நுட்பங்கள்: (1) 49 ஆண்டுகளின் ஒற்றை குறிக்கோள் — நாட்டு கோழி மட்டும், பல தசாப்தங்களாக நிபுணத்துவம். (2) கோழியை நறுக்கும் முன்பு முழு பறவையாக திறந்த விறகு தீயில் 'தீயில வாட்டுவது' — தோலை இறுக்கி, புகை வாசனை இறைச்சிக்குள் நேரடியாக படியும்; வெறும் மசாலா தேய்த்து சுட்டால் இந்த சுவை வராது. (3) 100% விறகு அடுப்பு சமையல் — மெதுவான சீரான வெப்பம் நாட்டு கோழியை எரிவாயு அடுப்பு செய்ய முடியாத விதத்தில் மிருதுவாக்கும். (4) புதிதாக வறுக்கப்பட்ட மசாலா — வழக்கத்துக்கு மாறான கால் கிலோ கொத்தமல்லி விதை (மேலாதிக்க சுவை) மற்றும் வெறும் 1.5 ஸ்பூன் மிளகாய் தூள் மட்டும் — அதிக காரம் இல்லாமல், சுவை மிக்க, ஆறுதலான தண்ணி குழம்பாக மாறுகிறது. இஞ்சி-பூண்டில் பூண்டு சற்று அதிகமாக இருக்க வேண்டும்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Chithode, Erode",
      },
      prepTime: 30,
      cookingTime: 75,
      totalTime: 105,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://youtu.be/qhHU9QzueOE",
      },
      tags: [
        "non-veg",
        "chicken",
        "country-chicken",
        "naatu-kozhi",
        "kuzhambu",
        "thanni-kuzhambu",
        "gravy",
        "soupy",
        "smoky",
        "fire-charred",
        "wood-fire",
        "muthu-mess",
        "chithode",
        "erode",
        "kongu",
        "tamil-nadu",
        "no-packet-masala",
        "fresh-roasted-masala",
        "traditional",
        "comfort-food",
      ],
      searchKeywords: [
        "muthu mess",
        "muthu mess chithode",
        "muthu mess naattu kozhi",
        "naattu kozhi kuzhambu",
        "country chicken gravy",
        "thanni kuzhambu",
        "நாட்டு கோழி குழம்பு",
        "முத்து மெஸ்",
        "சித்தோடு",
        "fire charred chicken",
        "theeyila vaatti kozhi",
        "wood fire chicken",
        "erode chicken gravy",
        "chef deena muthu mess",
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
          title: { en: "Fire-Charring & Prep", ta: "தீயில வாட்டுதல் மற்றும் முன் தயாரிப்பு" },
          steps: [
            {
              step: 1,
              description: {
                en: "Clean the whole country chicken (1 kg) thoroughly. Before chopping it, char the WHOLE bird directly over an open wood-fire flame (theeyila vaatti) — turning continuously — until the outer skin is lightly blackened and the bird carries a smoky aroma. If you don't have a wood fire, do the same over a gas stove flame holding the bird with tongs. This step locks the skin and infuses smoke into the meat, and is the Muthu Mess signature.",
                ta: "முழு நாட்டு கோழியையும் (1 கிலோ) நன்கு சுத்தம் செய்யவும். துண்டு போடும் முன்பு, முழு பறவையாக திறந்த விறகு தீயில் 'தீயில வாட்ட'வும் — தொடர்ந்து புரட்டி, வெளியே தோல் லேசாக கருகி, புகை வாசனை வரும் வரை. விறகு அடுப்பு இல்லையென்றால், எரிவாயு அடுப்பு தீயில் இடுக்கியால் பிடித்து வாட்டலாம். இந்த படிதான் தோலை இறுக்கி, இறைச்சிக்குள் புகை வாசனையை படிய வைக்கும் — முத்து மெஸ்ஸின் அடையாள நுட்பம்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Once charred, cut the chicken into small bite-sized pieces with bones. Wash quickly under water and drain.",
                ta: "வாட்டிய பிறகு, கோழியை எலும்புகளுடன் சிறிய கடிக்கும் அளவு துண்டுகளாக வெட்டவும். வேகமாக தண்ணீரில் கழுவி வடிக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Peel the 450g small onions and DIVIDE them into two equal piles of ~225g each — one pile will be sautéed and ground into the wet masala paste, the other pile will go raw into the chicken sauté.",
                ta: "450 கிராம் சின்ன வெங்காயத்தை தோல் சீவி, இரண்டு சம பகுதிகளாக (சுமார் 225 கிராம் வீதம்) பிரிக்கவும் — ஒரு பகுதி வதங்கி மசாலா விழுதில் சேர்க்க, மற்றொரு பகுதி கோழி வதக்கும் போது பச்சையாக சேர்க்க.",
              },
            },
            {
              step: 4,
              description: {
                en: "Roughly chop the 2 tomatoes. Keep the curry leaves and coriander leaves washed and ready in two piles — one handful of curry leaves goes into the dry-roast masala, the rest is for the chicken sauté and final garnish.",
                ta: "2 தக்காளியை பெரிய துண்டுகளாக நறுக்கவும். கருவேப்பிலை மற்றும் கொத்தமல்லியை கழுவி தயாராக வைக்கவும் — ஒரு கைப்பிடி கருவேப்பிலை மசாலா வறுக்க, மீதி கோழி வதக்கவும், கடைசி அலங்காரத்துக்கும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Preparing the Fresh Masala Powder", ta: "புதிய மசாலா தூள் தயாரித்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Heat a dry, heavy-bottomed pan on a MEDIUM-LOW flame. No oil — this is a dry roast.",
                ta: "ஒரு தடிமனான வரண்ட கடாயை மிதமான-குறைந்த தீயில் சூடாக்கவும். எண்ணெய் இல்லாமல் — இது வரண்ட வறுவல்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Add the cinnamon pieces, 10 cloves, 20g cumin seeds, 20g fennel seeds, 10g black pepper, the FULL 250g of coriander seeds, 12 dry red chillies, and a handful of curry leaves into the pan.",
                ta: "இலவங்கப்பட்டை, 10 கிராம்பு, 20 கிராம் சீரகம், 20 கிராம் சோம்பு, 10 கிராம் மிளகு, முழு 250 கிராம் கொத்தமல்லி விதை, 12 காய்ந்த மிளகாய் மற்றும் ஒரு கைப்பிடி கருவேப்பிலையை கடாயில் சேர்க்கவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Dry-roast patiently on a low flame, stirring continuously, until the spices turn a uniform golden color and release a deep nutty aroma — typically 8-12 minutes for this large quantity. Critical warning: do NOT roast on high heat. Burnt spices will turn the entire gravy bitter and ruin the dish.",
                ta: "குறைந்த தீயில் தொடர்ந்து கிளறி, மசாலாக்கள் ஒரே மாதிரியான பொன்னிறமாக மாறி ஆழமான இனிய வாசனை வரும் வரை — இந்த பெரிய அளவுக்கு சுமார் 8-12 நிமிடம் — பொறுமையாக வறுக்கவும். மிக முக்கிய எச்சரிக்கை: அதிக தீயில் வறுக்க வேண்டாம். கருகிய மசாலா முழு குழம்பையும் கசக்க வைத்து கெடுத்துவிடும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Spread the roasted spices on a wide plate and let them cool down COMPLETELY to room temperature. Hot spices ground straight away will turn into an oily paste, not a fine powder.",
                ta: "வறுத்த மசாலாவை ஒரு பெரிய தட்டில் பரப்பி, அறை வெப்பநிலை வரும் வரை முழுமையாக ஆற விடவும். சூடாக இருக்கும் போது அரைத்தால் தூளாக மாறாமல், எண்ணெய் கலந்த விழுதாக மாறிவிடும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Once fully cooled, grind everything together in a dry mixer jar to a fine, fragrant powder. Set this masala powder aside.",
                ta: "முழுமையாக ஆறிய பின், அனைத்தையும் வரண்ட மிக்ஸியில் சேர்த்து மிருதுவான, வாசனை மிக்க தூளாக அரைக்கவும். இந்த மசாலா தூளை தனியாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Making the Wet Masala Paste", ta: "ஈர மசாலா விழுது தயாரித்தல்" },
          steps: [
            {
              step: 10,
              description: {
                en: "In a separate small pan, heat a little groundnut oil. Add the FIRST half (~225g) of the peeled small onions and sauté on medium flame until they soften and turn translucent — don't brown them, just cook through.",
                ta: "ஒரு சிறிய கடாயில் சிறிதளவு கடலை எண்ணெய் சூடாக்கவும். தோல் சீவிய சின்ன வெங்காயத்தின் முதல் பகுதியை (~225 கிராம்) சேர்த்து, மிதமான தீயில் மிருதுவாகி பளபளக்கும் வரை வதக்கவும் — பழுப்பாக்க வேண்டாம், வேகம் மட்டுமே போதும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Transfer these sautéed onions into a mixer jar along with the freshly ground dry masala powder. Add a little water and grind everything together into a smooth, thick wet masala paste. Set aside.",
                ta: "இந்த வதங்கிய சின்ன வெங்காயத்தை மிக்ஸியில் சேர்க்கவும், உடன் வறுத்து அரைத்து வைத்துள்ள வரண்ட மசாலா தூளையும் சேர்க்கவும். சிறிதளவு தண்ணீர் சேர்த்து மிருதுவான, கெட்டியான ஈர மசாலா விழுதாக அரைக்கவும். தனியாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Chicken Base", ta: "கோழி வதக்கல்" },
          steps: [
            {
              step: 12,
              description: {
                en: "Heat a large traditional clay pot (manchatti) or heavy-bottomed vessel — wood fire if possible — and pour in a generous amount of groundnut oil.",
                ta: "ஒரு பெரிய பாரம்பரிய மண்சட்டி அல்லது தடிமனான பாத்திரத்தை — முடிந்தால் விறகு அடுப்பில் — சூடாக்கி, தாராளமான கடலை எண்ணெய் ஊற்றவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Add the 2 tbsp ginger-garlic paste (with slightly more garlic than ginger) and sauté vigorously on medium-high heat until the raw, pungent smell completely vanishes — typically 1-2 minutes.",
                ta: "2 ஸ்பூன் இஞ்சி-பூண்டு விழுதை (இஞ்சியை விட பூண்டு சற்று அதிகமாக) சேர்த்து, பச்சை வாசனை முற்றிலும் போகும் வரை — சுமார் 1-2 நிமிடம் — மிதமான-உயர் தீயில் வேகமாக வதக்கவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Toss in a generous handful of fresh curry leaves followed by the SECOND (raw) half of the small onions. Sauté until the onions soften and turn translucent.",
                ta: "ஒரு கைப்பிடி புதிய கருவேப்பிலை சேர்க்கவும், உடன் மற்றொரு பகுதி (பச்சை) சின்ன வெங்காயத்தை சேர்க்கவும். வெங்காயம் மிருதுவாகி பளபளக்கும் வரை வதக்கவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Add the fire-charred, small-cut naattu kozhi pieces directly into the pot. Sauté the meat thoroughly on medium-high heat — turning frequently — until the pieces firm up, change color, and lock in their juices. About 6-8 minutes.",
                ta: "தீயில் வாட்டிய, சிறு துண்டாக்கிய நாட்டு கோழி பகுதிகளை நேரடியாக பாத்திரத்தில் சேர்க்கவும். மிதமான-உயர் தீயில், அடிக்கடி புரட்டி, கோழி இறுகி, நிறம் மாறி, தனது சாற்றை உள்ளே பூட்டிக்கொள்ளும் வரை — சுமார் 6-8 நிமிடம் — நன்கு வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Building the Thanni Kuzhambu", ta: "தண்ணி குழம்பு கட்டமைத்தல்" },
          steps: [
            {
              step: 16,
              description: {
                en: "Once the chicken is seared, add the freshly ground wet masala paste into the pot. Mix it thoroughly so every piece of chicken is fully coated.",
                ta: "கோழி வறுபட்டதும், புதிதாக அரைத்த ஈர மசாலா விழுதை பாத்திரத்தில் சேர்க்கவும். ஒவ்வொரு கோழி துண்டிலும் மசாலா முழுமையாக படியும்படி நன்கு கலக்கவும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Add the chopped tomatoes, 1 tsp turmeric powder, 1½ tsp red chilli powder, and crystal salt to taste. Sauté for 2-3 minutes until the tomatoes start breaking down and the masala thickens around the meat.",
                ta: "நறுக்கிய தக்காளி, 1 ஸ்பூன் மஞ்சள் தூள், 1½ ஸ்பூன் மிளகாய் தூள் மற்றும் தேவையான கல் உப்பு சேர்க்கவும். தக்காளி குழைய ஆரம்பித்து, இறைச்சியை சுற்றி மசாலா கெட்டியாகும் வரை 2-3 நிமிடம் வதக்கவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Pour in plenty of water. Critical: this is a traditional THANNI KUZHAMBU (thin, soupy gravy), not a thick masala curry. The consistency should remain thin and broth-like — generous water that pours easily, not a thick coating.",
                ta: "தாராளமான தண்ணீர் ஊற்றவும். மிக முக்கியம்: இது பாரம்பரிய 'தண்ணி குழம்பு' — மெல்லிய, சாறு போன்ற குழம்பு; கெட்டியான மசாலா குழம்பு அல்ல. பதம் மெல்லியதாகவே இருக்க வேண்டும் — சுலபமாக ஊற்றக்கூடிய சாறு போல, அடர்த்தியாக இல்லாமல்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Cover the pot and let it come to a rolling boil on medium-high heat. Let it boil vigorously until the country chicken is perfectly tender — usually 30-45 minutes depending on the age of the bird. Check occasionally; add a splash of hot water if it reduces too fast.",
                ta: "பாத்திரத்தை மூடி, மிதமான-உயர் தீயில் நன்கு கொதிக்க விடவும். கோழியின் வயதைப் பொறுத்து, நாட்டு கோழி முற்றிலும் மிருதுவாகும் வரை — சுமார் 30-45 நிமிடம் — நன்கு கொதிக்க விடவும். அவ்வப்போது சரிபார்க்கவும்; அதிகமாக வற்றினால் சிறிது சூடான தண்ணீர் சேர்க்கவும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "The gravy is done when the chicken is fall-off-the-bone tender and a clear layer of groundnut oil floats beautifully on the surface — this is the visual signal that the masala has cooked through and the dish is ready.",
                ta: "கோழி எலும்பிலிருந்து தானாக பிரியும் அளவுக்கு மிருதுவாகி, மேற்பரப்பில் தெளிவான கடலை எண்ணெய் அடுக்கு அழகாக மிதக்கும் போது குழம்பு தயார் — அதுவே மசாலா முழுமையாக வெந்துவிட்டது என்பதற்கான அடையாளம்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final Touch & Serving", ta: "இறுதி பணி மற்றும் பரிமாறுதல்" },
          steps: [
            {
              step: 21,
              description: {
                en: "Turn off the heat. Taste and adjust salt one last time. Garnish generously with freshly chopped coriander leaves.",
                ta: "அடுப்பை அணைக்கவும். உப்பை கடைசியாக ஒருமுறை சுவைத்து சரிபார்க்கவும். புதிதாக நறுக்கிய கொத்தமல்லியை தாராளமாக தூவவும்.",
              },
            },
            {
              step: 22,
              description: {
                en: "Let it rest for 10-15 minutes covered — the flavors deepen significantly during this rest, and the smoke from the fire-charred chicken integrates fully into the broth.",
                ta: "10-15 நிமிடம் மூடி வைத்து ஓய்வு கொடுக்கவும் — இந்த ஓய்வில் சுவை பல மடங்கு ஆழமாக மாறும், தீயில் வாட்டிய கோழியின் புகை வாசனை சாற்றில் முழுமையாக கலக்கும்.",
              },
            },
            {
              step: 23,
              description: {
                en: "Serve this soupy, smoky Muthu Mess Thanni Kuzhambu piping hot — pour generously over soft hot idlies, crispy dosas, or steamed white rice with a side of raw onion and lemon wedge. This is the original Chithode Erode comfort meal.",
                ta: "இந்த சாறு போன்ற, புகை மணம் கொண்ட முத்து மெஸ் தண்ணி குழம்பை சூடாக — மென்மையான சூடான இட்லி, மொறுமொறுப்பான தோசை, அல்லது சூடான வெள்ளை சாதத்தின் மேல் தாராளமாக ஊற்றி, பச்சை வெங்காயம் மற்றும் ஒரு துண்டு எலுமிச்சையுடன் பரிமாறவும். இதுவே சித்தோடு, ஈரோட்டின் அசலான ஆறுதல் உணவு.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Muthu Mess Naattu Kozhi Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
