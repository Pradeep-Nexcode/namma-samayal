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
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "2", unit: "kg" },
  { slug: "country-chicken", name: "Country Chicken (Naattu Kozhi)", ta: "நாட்டு கோழி", quantity: "2", unit: "kg" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "400", unit: "g" },
  { slug: "tomato", name: "Tomato", ta: "தக்காளி", quantity: "300", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "15", unit: "nos (slit)" },
  { slug: "ginger", name: "Ginger (for fresh paste)", ta: "இஞ்சி", quantity: "100", unit: "g" },
  { slug: "garlic", name: "Garlic (for fresh paste)", ta: "பூண்டு", quantity: "100", unit: "g" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1", unit: "large bunch" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli)", ta: "கொத்தமல்லி", quantity: "1", unit: "large bunch" },
  { slug: "curd", name: "Curd (Thayir)", ta: "தயிர்", quantity: "200", unit: "ml" },
  { slug: "lemon", name: "Lemon", ta: "எலுமிச்சை", quantity: "1", unit: "no (juiced)" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "20", unit: "g (~2 tbsp)" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { slug: "cinnamon", name: "Cinnamon (Pattai)", ta: "இலவங்கப்பட்டை", quantity: "2-3", unit: "small pieces" },
  { slug: "cloves", name: "Cloves (Kirambu)", ta: "கிராம்பு", quantity: "5-6", unit: "nos" },
  { slug: "cardamom", name: "Cardamom (Yelakkai)", ta: "ஏலக்காய்", quantity: "4-5", unit: "nos" },
  { slug: "bay-leaf", name: "Bay Leaf (Briyani Leaf)", ta: "பிரியாணி இலை", quantity: "2-3", unit: "nos" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "400", unit: "ml" },
  { slug: "ghee", name: "Ghee", ta: "நெய்", quantity: "100", unit: "ml" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-naatu-kozhi-biryani";
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
        en: "Erode Home-Style Naatu Kozhi Biryani (Country Chicken Biryani)",
        ta: "ஈரோடு வீட்டு நாட்டு கோழி பிரியாணி",
      },
      slug,
      description: {
        en: "An authentic Erode home-style Kongu biryani made with aromatic Seeraga Samba rice cooked directly in country chicken (naattu kozhi) stock. No artificial colors, no ajinomoto, no overpowering essences — the dish gets its deep flavor from caramelized small onions, fresh ginger-garlic paste, mint, coriander, curd and a single squeeze of lemon. Light on the stomach, intensely fragrant, and famously praised as 'Unga veetla seirathu pola irukkum' (tastes exactly like home cooking). 1:2 rice-to-liquid ratio, finished on traditional dum.",
        ta: "வாசனை மிக்க சீரக சம்பா அரிசியை நாட்டு கோழி சாற்றில் நேரடியாக வேக வைத்து செய்யப்படும் பாரம்பரிய ஈரோடு வீட்டு பாணி கொங்கு பிரியாணி. செயற்கை நிறம், அஜினோமோட்டோ, கடுமையான மசாலா எசன்ஸ் எதுவும் இல்லை — கருகிய சின்ன வெங்காயம், புதிய இஞ்சி பூண்டு விழுது, புதினா, கொத்தமல்லி, தயிர் மற்றும் ஒரு எலுமிச்சை பிழிவில் இருந்தே ஆழமான சுவை. வயிற்றுக்கு இலகுவானது, தீவிர வாசனை. 'உங்க வீட்ல செய்யுறது போல இருக்கும்' என்று பாராட்டப்படுகிறது. அரிசி-சாறு விகிதம் 1:2, பாரம்பரிய தம் முறையில் முடிக்கப்படுகிறது.",
      },
      speciality: {
        en: "Three Kongu secrets define this biryani: (1) 100% small onions (shallots), no big Bellary onions — shallots bring natural sweetness and rustic aroma that big onions cannot match; the depth of brown they reach determines the final color. (2) Country chicken (naattu kozhi) stock — tougher meat and stronger bones release a far richer broth than broiler; the Seeraga Samba rice cooks directly in this stock and soaks up every drop of flavor. (3) No artificial additives — no food colors, no ajinomoto, no biryani essences; the entire flavor architecture is fresh herbs, curd, and slow-built masala. The broth-salt rule: taste it before adding rice; it should taste 'slightly seawater-salty' so the cooked rice tastes balanced.",
        ta: "மூன்று கொங்கு ரகசியங்கள்: (1) 100% சின்ன வெங்காயம் மட்டுமே — பெரிய பெல்லாரி வெங்காயம் கிடையாது; சின்ன வெங்காயத்தின் இனிமை மற்றும் கிராமத்து வாசனையை பெரிய வெங்காயம் தர முடியாது; அதை எவ்வளவு பழுப்பாக கருக வைக்கிறோமோ, அதுவே பிரியாணியின் இறுதி நிறம். (2) நாட்டு கோழி சாறு — கடினமான இறைச்சி, வலுவான எலும்புகள் கொண்ட நாட்டு கோழி, பாய்லர் கோழியை விட பல மடங்கு செழுமையான சாற்றை வெளியேற்றும்; அதே சாற்றில் சீரக சம்பா அரிசி வேகும் போது ஒவ்வொரு தானியமும் சுவையை உள்ளீர்க்கிறது. (3) எந்த செயற்கை சேர்க்கையும் இல்லை — நிறம், அஜினோமோட்டோ, பிரியாணி எசன்ஸ் எதுவும் இல்லை; புதிய இலைகள், தயிர் மற்றும் மெதுவாக கட்டப்பட்ட மசாலாதான் முழு சுவை அமைப்பு. சாறு உப்பு விதி: அரிசி சேர்ப்பதற்கு முன் சாற்றை சுவைக்கவும் — 'லேசான கடல்நீர் உப்பு' சுவை இருக்க வேண்டும், அப்போதுதான் அரிசி வெந்த பின் சரியான பதம் வரும்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 40,
      cookingTime: 75,
      totalTime: 115,
      servings: 15,
      difficulty: "hard",
      source: "youtube",
      tags: [
        "non-veg",
        "biryani",
        "naatu-kozhi",
        "country-chicken",
        "seeraga-samba",
        "dum-biryani",
        "rice",
        "feast",
        "virundhu",
        "erode",
        "kongu",
        "tamil-nadu",
        "home-style",
        "no-artificial-colors",
        "traditional",
        "shallots-biryani",
      ],
      searchKeywords: [
        "naatu kozhi biryani",
        "country chicken biryani",
        "நாட்டு கோழி பிரியாணி",
        "seeraga samba biryani",
        "erode biryani",
        "kongu biryani",
        "home style biryani",
        "veetla seirathu pola",
        "shallot biryani",
        "no color biryani",
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
                en: "Wash the 2 kg of Seeraga Samba rice gently 2-3 times until the water runs clear. Soak in fresh water for 20-30 minutes — don't soak longer or the small grains will break. Drain just before adding to the broth.",
                ta: "2 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவவும். 20-30 நிமிடம் சுத்தமான தண்ணீரில் ஊறவைக்கவும் — அதிக நேரம் ஊறவைத்தால் சிறிய தானியங்கள் உடையும். சாற்றில் சேர்ப்பதற்கு சற்று முன்பு வடிக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Clean the 2 kg of country chicken thoroughly. Cut into medium biryani pieces (with bones — they carry the stock flavor). Drain well.",
                ta: "2 கிலோ நாட்டு கோழியை நன்கு சுத்தம் செய்யவும். நடுத்தர பிரியாணி அளவு துண்டுகளாக வெட்டவும் (எலும்புகளுடன் — அவை சாற்றுக்கு சுவை தரும்). தண்ணீர் வடியவிடவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Peel and finely chop the 400g of small onions. Finely chop the 300g of tomatoes. Slit the 15 green chillies lengthwise.",
                ta: "400 கிராம் சின்ன வெங்காயத்தை தோல் சீவி நன்கு நறுக்கவும். 300 கிராம் தக்காளியை நன்கு நறுக்கவும். 15 பச்சை மிளகாயை நீளவாக்கில் கீறவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Make a FRESH ginger-garlic paste by grinding 100g ginger + 100g garlic to a smooth paste (no jarred shortcut — the freshness matters here).",
                ta: "100 கிராம் இஞ்சி + 100 கிராம் பூண்டை மிருதுவான விழுதாக புதிதாக அரைக்கவும் (கடையில் வாங்கிய பாட்டில் விழுது வேண்டாம் — புதிய அரைப்புதான் இங்கு முக்கியம்).",
              },
            },
            {
              step: 5,
              description: {
                en: "Pick mint leaves off their stems and roughly chop. Roughly chop the coriander leaves. Whisk the 200 ml of curd until smooth. Juice the lemon.",
                ta: "புதினா இலைகளை காம்பிலிருந்து பிரித்து பெரிய துண்டுகளாக நறுக்கவும். கொத்தமல்லியையும் பெரிய துண்டுகளாக நறுக்கவும். 200 மிலி தயிரை மிருதுவாக கடையவும். எலுமிச்சையை பிழியவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Aromatics", ta: "வாசனை மசாலா வதக்கல்" },
          steps: [
            {
              step: 6,
              description: {
                en: "Heat a large, heavy-bottomed biryani vessel (dekchi) over medium-high heat. Pour in the 400 ml of groundnut oil along with the 100 ml of ghee. The oil-ghee combo gives biryani its signature richness.",
                ta: "ஒரு பெரிய, தடிமனான பிரியாணி தேக்சி பாத்திரத்தை மிதமான-உயர் தீயில் சூடாக்கவும். 400 மிலி கடலை எண்ணெய் மற்றும் 100 மிலி நெய் ஊற்றவும். எண்ணெய்-நெய் கலவைதான் பிரியாணிக்கு உரிய செழுமையை தரும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Once hot, add the whole spices — cinnamon pieces, cloves, cardamom and bay leaves. Let them crackle and bloom in the fat for 30-60 seconds.",
                ta: "எண்ணெய் சூடாகும் போது, முழு மசாலாக்களை சேர்க்கவும் — இலவங்கப்பட்டை, கிராம்பு, ஏலக்காய் மற்றும் பிரியாணி இலை. 30-60 விநாடிகள் நெய்யில் வாசனை வீச விடவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the 400g of finely chopped small onions. Sauté patiently on medium-high heat, stirring often, until they turn a deep, caramelized golden-brown — typically 12-18 minutes. Don't rush this: the final color and depth of the biryani depends directly on how well these shallots brown.",
                ta: "400 கிராம் நறுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான-உயர் தீயில் தொடர்ந்து கிளறி, ஆழமான பழுப்பு பொன்னிறம் வரும் வரை — சுமார் 12-18 நிமிடம் — பொறுமையாக வதக்கவும். அவசரப்பட வேண்டாம்: இறுதி பிரியாணியின் நிறமும், சுவை ஆழமும் இந்த சின்ன வெங்காயம் எவ்வளவு நன்கு பழுப்பாகிறது என்பதையே சார்ந்து உள்ளது.",
              },
            },
            {
              step: 9,
              description: {
                en: "Toss in the slit green chillies and sauté for 30 seconds.",
                ta: "கீறிய பச்சை மிளகாயை சேர்த்து 30 விநாடிகள் வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Building the Masala Base", ta: "மசாலா அடிப்படை கட்டமைத்தல்" },
          steps: [
            {
              step: 10,
              description: {
                en: "Add the freshly ground ginger-garlic paste. Sauté vigorously for 2-3 minutes until the raw, pungent smell completely vanishes — this is critical, raw ginger-garlic in the final dish is a known biryani-killer.",
                ta: "புதிதாக அரைத்த இஞ்சி பூண்டு விழுதை சேர்க்கவும். பச்சை வாசனை முற்றிலும் போகும் வரை 2-3 நிமிடம் வேகமாக வதக்கவும் — இது மிக முக்கியம், பச்சை இஞ்சி பூண்டு பிரியாணியின் சுவையை கெடுக்கும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the chopped mint and coriander leaves. Give it a good stir for 30-60 seconds so the herbal oils release into the fat.",
                ta: "நறுக்கிய புதினா மற்றும் கொத்தமல்லியை சேர்க்கவும். 30-60 விநாடிகள் நன்கு கிளறி, இலைகளின் வாசனை எண்ணெயில் கலக்க விடவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add the finely chopped tomatoes, 1 tsp turmeric powder, 20g (~2 tbsp) red chilli powder, and a generous handful of crystal salt. Sauté continuously until the tomatoes break down completely into a soft mash and the oil starts floating up to the top — usually 6-8 minutes.",
                ta: "நறுக்கிய தக்காளி, 1 ஸ்பூன் மஞ்சள் தூள், 20 கிராம் (~2 ஸ்பூன்) மிளகாய் தூள் மற்றும் தாராளமான கல் உப்பு சேர்க்கவும். தக்காளி முற்றிலும் குழைந்து, மேலே எண்ணெய் தனியாக மிதக்க ஆரம்பிக்கும் வரை — சுமார் 6-8 நிமிடம் — தொடர்ந்து வதக்கவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Turn down the heat to low. Stir in the whisked 200 ml of curd gradually so it doesn't split. Mix until the masala is uniform.",
                ta: "தீயை குறைக்கவும். 200 மிலி கடைந்த தயிரை மெதுவாக சேர்க்கவும் — தயிர் பிரிந்து போகாமல் இருக்க, கொஞ்சம் கொஞ்சமாக சேர்க்கவும். மசாலா சீராக கலக்கும் வரை கலக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Naatu Kozhi", ta: "நாட்டு கோழி வேக வைத்தல்" },
          steps: [
            {
              step: 14,
              description: {
                en: "Add the 2 kg of cleaned country chicken pieces into the masala. Mix everything thoroughly so each piece is well coated with the masala.",
                ta: "2 கிலோ சுத்தம் செய்த நாட்டு கோழி துண்டுகளை மசாலாவில் சேர்க்கவும். ஒவ்வொரு துண்டிலும் மசாலா நன்கு படியும்படி முழுவதையும் கலக்கவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Because naattu kozhi takes much longer to cook than broiler chicken, pour in the measured 4 liters of water now (ratio: 1 kg rice : 2 liters liquid → for 2 kg rice, you need 4 liters). The chicken will boil tender in this masala broth and create the cooking stock for the rice.",
                ta: "பாய்லர் கோழியை விட நாட்டு கோழி வேக மிக அதிக நேரம் ஆகும் — எனவே இப்போதே 4 லிட்டர் தண்ணீர் ஊற்றவும் (விகிதம்: 1 கிலோ அரிசிக்கு 2 லிட்டர் சாறு → 2 கிலோ அரிசிக்கு 4 லிட்டர் தேவை). கோழி இந்த மசாலா சாற்றில் மிருதுவாக வேகும்; அதே சாறுதான் அரிசிக்கு வேக சாறாக மாறும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Cover the vessel and let the water come to a rolling boil. Then let the chicken cook vigorously for about 20 minutes — until the meat is perfectly tender and roughly 80% cooked. (Naattu kozhi will finish the last 20% during the rice cooking and dum stages.)",
                ta: "பாத்திரத்தை மூடி, தண்ணீர் நன்கு கொதிக்க விடவும். பின் கோழியை சுமார் 20 நிமிடம் நன்கு கொதிக்க விடவும் — இறைச்சி மிருதுவாகி சுமார் 80% மட்டுமே வேக வேண்டும். (மீதம் 20% அரிசி வேக வைக்கும் நிலையிலும், தம் நிலையிலும் முடிந்துவிடும்).",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Adding the Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி சேர்த்தல்" },
          steps: [
            {
              step: 17,
              description: {
                en: "Critical salt check: taste the boiling broth. It should taste 'slightly seawater-salty' — distinctly salty. The rice will absorb a lot of this salt as it cooks, so under-seasoning here will give you a bland biryani. Add more crystal salt if needed.",
                ta: "முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். 'லேசான கடல்நீர் உப்பு' சுவை வர வேண்டும் — தெளிவாக உப்பு சுவை இருக்க வேண்டும். அரிசி வேக வேக இந்த உப்பை அதிகம் உள்ளீர்க்கும், எனவே இங்கு குறைவான உப்பு இருந்தால் பிரியாணி உப்பு குறைந்து கெடும். தேவையானால் கல் உப்பு சேர்க்கவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice. Gently slide the rice into the rapidly boiling chicken broth — don't dump it in. Don't stir vigorously, you'll break the delicate grains.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுவதுமாக வடிக்கவும். கொதிக்கும் கோழி சாற்றில் அரிசியை மெதுவாக கொட்டவும் — வேகமாக போட வேண்டாம். வேகமாக கிளற வேண்டாம், மென்மையான தானியங்கள் உடைந்துவிடும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Squeeze the juice of 1 lemon evenly over the top — this keeps the grains separate and brightens the flavor. Give it one gentle, thorough mix from the bottom to bring chicken pieces up.",
                ta: "ஒரு எலுமிச்சையின் சாற்றை மேலே சீராக பிழியவும் — இது தானியங்கள் ஒட்டாமல் தனித்தனியாக இருக்கவும், சுவையை பிரகாசமாக்கவும் உதவும். அடியிலிருந்து கோழி துண்டுகளை மேலே கொண்டு வரும்படி ஒரு முறை மெதுவாக, முழுமையாக கிளறவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Dum Cooking Process", ta: "தம் சமையல் முறை" },
          steps: [
            {
              step: 20,
              description: {
                en: "Let the rice cook uncovered on a medium-high flame. Wait until about 75-80% of the water is absorbed — you'll know it's dum-ready when the rice grains are visible at the surface and the water level has dropped to exactly the level of the rice itself.",
                ta: "அரிசியை மூடாமல் மிதமான-உயர் தீயில் வேக விடவும். சுமார் 75-80% தண்ணீர் உள்ளீர்க்கப்படும் வரை காத்திருக்கவும் — அரிசி தானியங்கள் மேற்பரப்பில் தெரிய ஆரம்பித்து, தண்ணீர் மட்டம் சரியாக அரிசியின் மட்டத்துக்கு வரும் போது தம் வைக்க தயார்.",
              },
            },
            {
              step: 21,
              description: {
                en: "Lower the stove flame to the absolute minimum. Cover the vessel with a very tight-fitting lid. Place a heavy weight on top of the lid (or seal the edges with a roll of wheat dough; or use the traditional method of placing hot coals on the lid if cooking on firewood) — the goal is to trap all steam completely.",
                ta: "அடுப்பின் தீயை மிகவும் குறைந்த அளவுக்கு குறைக்கவும். பாத்திரத்தை மிக இறுக்கமான மூடியால் மூடவும். மூடியின் மேல் ஒரு கனமான பாரம் வைக்கவும் (அல்லது கோதுமை மாவு பிசைந்து ஓரத்தில் ஒட்டி காற்று வெளியேறாமல் முத்திரை இடவும்; விறகு அடுப்பில் சமைத்தால் மூடியின் மேல் சூடான கரிகளை வைக்கலாம்) — நோக்கம்: எந்த ஆவியும் வெளியேற கூடாது.",
              },
            },
            {
              step: 22,
              description: {
                en: "Leave it on dum for 15 to 20 minutes undisturbed. Do not open the lid, do not stir, do not peek — every escaping wisp of steam is lost flavor.",
                ta: "15 முதல் 20 நிமிடம் தம்மில் தொடாமல் வைக்கவும். மூடியை திறக்க வேண்டாம், கிளற வேண்டாம், எட்டிப்பார்க்க வேண்டாம் — வெளியேறும் ஒவ்வொரு ஆவி குமிழும் இழந்த சுவையே.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Fluffing and Serving", ta: "புரட்டி பரிமாறுதல்" },
          steps: [
            {
              step: 23,
              description: {
                en: "Turn off the heat. Open the lid — the aroma will instantly fill the kitchen. Let the biryani rest for another 5 minutes before fluffing; this helps the steam settle and grains firm up.",
                ta: "அடுப்பை அணைக்கவும். மூடியை திறக்கவும் — வாசனை உடனே சமையலறை முழுவதும் பரவும். புரட்டுவதற்கு முன் இன்னும் 5 நிமிடம் ஓய்வு கொடுக்கவும்; ஆவி நிலையாகி, தானியங்கள் இறுகி வரும்.",
              },
            },
            {
              step: 24,
              description: {
                en: "Using a flat ladle (not a spoon), gently fluff the biryani from the edges inward toward the center — lift and turn, don't stir. This protects the delicate Seeraga Samba grains from breaking and distributes the chicken pieces evenly.",
                ta: "தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். இது மென்மையான சீரக சம்பா தானியங்கள் உடையாமல் காப்பாற்றும், கோழி துண்டுகளும் சமமாக கலக்கும்.",
              },
            },
            {
              step: 25,
              description: {
                en: "Serve this incredibly comforting Naatu Kozhi Biryani hot, with onion-cucumber raita, a spicy non-veg gravy (chicken chettinad or mutton kola urundai work brilliantly), and a wedge of lemon on the side.",
                ta: "இந்த அற்புதமான நாட்டு கோழி பிரியாணியை வெங்காய-வெள்ளரிக்காய் ரெய்தா, காரமான மற்றொரு அசைவ குழம்பு (செட்டிநாடு சிக்கன் அல்லது ஆட்டிறைச்சி கொள உருண்டை சிறந்த சேர்க்கை) மற்றும் ஒரு துண்டு எலுமிச்சையுடன் சூடாக பரிமாறவும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Naatu Kozhi Biryani recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
