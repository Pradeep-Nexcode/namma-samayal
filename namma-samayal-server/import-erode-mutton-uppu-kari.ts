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
  { slug: "mutton", name: "Mutton (with bones, bite-sized)", ta: "ஆட்டிறைச்சி", quantity: "1", unit: "kg" },
  { slug: "groundnut-oil", name: "Groundnut Oil (or Gingelly Oil)", ta: "கடலை எண்ணெய் (அல்லது எள்ளெண்ணெய்)", quantity: "100", unit: "ml" },
  { slug: "fennel-seeds", name: "Fennel Seeds", ta: "சோம்பு", quantity: "1", unit: "tsp" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "400-500", unit: "g" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies (Halved & Deseeded)", ta: "காய்ந்த மிளகாய் (பாதியாக்கி, விதை நீக்கி)", quantity: "15-20", unit: "nos" },
  { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste", ta: "இஞ்சி பூண்டு விழுது", quantity: "2", unit: "tbsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-mutton-uppu-kari";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "red-meat" }) || await Category.findOne({ slug: "meat" }) || await Category.findOne();
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
        en: "Erode Mutton Uppu Kari (Salted Mutton Roast)",
        ta: "ஈரோடு ஆட்டிறைச்சி உப்பு கறி",
      },
      slug,
      description: {
        en: "An ancient Kongu-style mutton roast where 1 kg of bone-in mutton is cooked using only two real preservative-flavors — salt (uppu) and deseeded dry red chillies — with absolutely no masala powders, no garam masala, no tomatoes. The mutton boils tender in its own juices, then 500g of whole shallots and ginger-garlic paste slowly caramelize down and wrap each piece in a glossy, dark, oil-glazed roast. The ultimate Kongu 'Virundhu' (feast) dish.",
        ta: "வெறும் இரண்டு பாரம்பரிய உணவு பாதுகாப்பிகள் — உப்பு மற்றும் விதை நீக்கிய காய்ந்த மிளகாய் — பயன்படுத்தி செய்யப்படும் பழமையான கொங்கு பாரம்பரிய ஆட்டிறைச்சி வறுவல். எந்த விதமான மசாலா தூளும், கரம் மசாலாவும், தக்காளியும் இல்லை. ஆட்டிறைச்சி தனது சாற்றிலேயே மிருதுவாக வேகும். பின் அரை கிலோ சின்ன வெங்காயம் மற்றும் இஞ்சி பூண்டு விழுது மெதுவாக உருகி கருகி, ஒவ்வொரு துண்டையும் இறுக்கமாக, பளபளப்பாக, இருண்ட வண்ணத்தில் சுற்றி கட்டிக்கொள்ளும். கொங்கு விருந்தின் முடிசூட்டப்பட்ட உணவு.",
      },
      speciality: {
        en: "Four Kongu rules define true Uppu Kari: (1) Zero masala powders — no coriander powder, chilli powder, garam masala, or tomatoes; the entire smoky-red color and depth comes from dry red chillies blooming in cold-pressed oil. (2) The de-seeding rule — every dry red chilli must be torn open and ALL its seeds shaken out, or the dish becomes painfully spicy. 15-20 deseeded chillies give color + smoke without burning the palate. (3) Massive shallot + ginger-garlic ratio — 400-500g of small onions for 1 kg meat; they slowly caramelize at the end and become the glossy coating. (4) The 'separating oil' visual cue — the dish is done only when the oil floats clearly around the edges and the meat wears a dark glaze. This is the historical 'Virundhu' meat — pre-refrigeration, pre-spice-blend Kongu cooking.",
        ta: "உண்மையான உப்பு கறிக்கு நான்கு கொங்கு விதிகள்: (1) எந்த மசாலா தூளும் இல்லை — கொத்தமல்லி தூள், மிளகாய் தூள், கரம் மசாலா, தக்காளி எதுவும் சேர்க்கக்கூடாது; மரச்செக்கு எண்ணெயில் காய்ந்த மிளகாய் வாசம் வீசுவதே நிறம், புகை, ஆழ்ந்த சுவையின் மூலம். (2) விதை நீக்கும் விதி — ஒவ்வொரு காய்ந்த மிளகாயையும் கிழித்து, உள்ளே உள்ள விதைகள் அனைத்தையும் தட்டி நீக்க வேண்டும்; இல்லையென்றால் தாங்க முடியாத காரமாக மாறும். விதை நீக்கிய 15-20 மிளகாய் — நிறமும் புகையும் தரும், காரம் தாக்காது. (3) அதிக சின்ன வெங்காயம் + இஞ்சி பூண்டு — 1 கிலோ இறைச்சிக்கு 400-500 கிராம் சின்ன வெங்காயம்; கடைசியில் மெதுவாக கருகி, பளபளக்கும் கோட்டிங்காக மாறும். (4) 'எண்ணெய் பிரியும்' அடையாளம் — பாத்திரத்தின் ஓரத்தில் எண்ணெய் தனியாக மிதந்து, இறைச்சி இருண்ட நிறத்தில் பளபளக்கும் போதே உணவு தயார். குளிர்சாதனம் இல்லாத, ஆயத்த மசாலா இல்லாத காலத்தின் கொங்கு விருந்து இறைச்சி.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 20,
      cookingTime: 70,
      totalTime: 90,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=LO8QHefAw_U",
      },
      tags: [
        "non-veg",
        "mutton",
        "uppu-kari",
        "roast",
        "varuval",
        "kari",
        "erode",
        "kongu",
        "tamil-nadu",
        "traditional",
        "virundhu",
        "feast",
        "no-masala-powder",
        "rustic",
        "ancient-recipe",
      ],
      searchKeywords: [
        "mutton uppu kari",
        "ஆட்டிறைச்சி உப்பு கறி",
        "salted mutton roast",
        "uppu kari",
        "erode mutton",
        "kongu mutton roast",
        "mutton varuval",
        "virundhu mutton",
        "chef deena mutton",
        "no masala mutton",
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
                en: "Clean the 1 kg of bone-in mutton thoroughly under running water. Cut into small, bite-sized pieces (with bones for flavor). Drain well.",
                ta: "1 கிலோ எலும்பு கொண்ட ஆட்டிறைச்சியை ஓடும் தண்ணீரில் நன்கு கழுவவும். (சுவைக்காக எலும்புகளுடன்) சிறிய, கடிக்கும் அளவு துண்டுகளாக வெட்டவும். தண்ணீர் வடியவிடவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Peel the 400-500g of small onions and keep them whole — do not chop. Whole shallots slowly melt during the final roast and create the glossy coating.",
                ta: "400-500 கிராம் சின்ன வெங்காயத்தை தோல் சீவி, முழுதாக வைக்கவும் — நறுக்க வேண்டாம். முழு சின்ன வெங்காயம் இறுதி வறுவல் நிலையில் மெதுவாக உருகி பளபளக்கும் கோட்டிங் கொடுக்கும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Critical de-seeding step: take the 15-20 dry red chillies, tear each one open lengthwise, and shake/scrape out ALL the seeds. Discard the seeds completely. Without this step, the dish will be painfully spicy.",
                ta: "மிக முக்கியமான விதை நீக்கும் படி: 15-20 காய்ந்த மிளகாயை எடுத்து, ஒவ்வொன்றையும் நீளவாக்கில் கிழித்து, உள்ளே உள்ள விதைகள் அனைத்தையும் தட்டி நீக்கவும். விதைகளை முற்றிலும் வீசிவிடவும். இந்த படியை செய்யவில்லை என்றால், உணவு தாங்க முடியாத காரமாக மாறிவிடும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Base Aromatics", ta: "அடிக்கூட்டு வாசனை வதக்கல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Heat a heavy-bottomed cast-iron kadai or a traditional clay pot (manchatti) over medium heat. Pour in the full 100 ml of cold-pressed groundnut oil (or gingelly oil) — this is a generous amount on purpose, the oil carries everything.",
                ta: "ஒரு தடிமனான இரும்பு கடாய் அல்லது பாரம்பரிய மண்சட்டியை மிதமான தீயில் சூடாக்கவும். 100 மிலி மரச்செக்கு கடலை எண்ணெய் (அல்லது எள்ளெண்ணெய்) ஊற்றவும் — இது வேண்டுமென்றே தாராளமான அளவு, இந்த எண்ணெய்தான் முழு சுவையையும் தாங்கி நிற்கிறது.",
              },
            },
            {
              step: 5,
              description: {
                en: "Once the oil is properly hot, add the 1 tsp of fennel seeds and let them splutter, releasing their sweet aroma.",
                ta: "எண்ணெய் நன்கு சூடாகும் போது, 1 ஸ்பூன் சோம்பு சேர்த்து வெடிக்க விடவும் — இனிய வாசனை வெளிப்படும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Toss in the generous handful of fresh curry leaves and let them crackle for a few seconds.",
                ta: "ஒரு கைப்பிடி கருவேப்பிலை சேர்த்து சில விநாடிகள் சீறி வெடிக்க விடவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Add the 400-500g of whole peeled small onions. Sauté patiently on a medium flame until they turn translucent and develop a light golden-brown color on the outside — typically 6-8 minutes. Don't rush this.",
                ta: "தோல் சீவிய முழு 400-500 கிராம் சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் பொறுமையாக வதக்கவும் — பளபளப்பாகி, வெளியே லேசான பொன்னிற பழுப்பு வரும் வரை, சுமார் 6-8 நிமிடம். அவசரப்பட வேண்டாம்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the deseeded dry red chillies. Sauté for 30-60 seconds — just enough for their smoky red color and aroma to bloom into the oil. Don't burn them.",
                ta: "விதை நீக்கிய காய்ந்த மிளகாயை சேர்க்கவும். 30-60 விநாடிகள் மட்டும் வதக்கவும் — புகை வாசனை மற்றும் சிவப்பு நிறம் எண்ணெயில் பரவ போதும். கருக விட வேண்டாம்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Searing the Meat", ta: "இறைச்சியை வறுத்தல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Add the 2 tablespoons of ginger-garlic paste directly into the hot oil. Sauté vigorously until the raw, pungent smell completely disappears — usually 1-2 minutes.",
                ta: "2 ஸ்பூன் இஞ்சி பூண்டு விழுதை சூடான எண்ணெயில் நேரடியாக சேர்க்கவும். பச்சை வாசனை முற்றிலும் போகும் வரை வேகமாக வதக்கவும் — சுமார் 1-2 நிமிடம்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Drop the cleaned bone-in mutton pieces directly into the pan.",
                ta: "சுத்தம் செய்த எலும்பு கொண்ட ஆட்டிறைச்சி துண்டுகளை நேரடியாக கடாயில் சேர்க்கவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the 1 tsp turmeric powder and crystal salt to taste. Stir everything thoroughly so each piece gets coated, and let the mutton sear in the hot oil. Keep sautéing on medium-high heat until the meat firms up, changes color from pink to brown, and releases its own juices — about 5-7 minutes.",
                ta: "1 ஸ்பூன் மஞ்சள் தூள் மற்றும் தேவையான கல் உப்பு சேர்க்கவும். ஒவ்வொரு துண்டிலும் மசாலா பூசும் அளவுக்கு நன்கு கலந்து, சூடான எண்ணெயில் இறைச்சியை வறுபட விடவும். மிதமான-உயர் தீயில், இறைச்சி இறுகி, இளஞ்சிவப்பு நிறத்திலிருந்து பழுப்பாக மாறி, தனது சாற்றை வெளியேற்ற ஆரம்பிக்கும் வரை — சுமார் 5-7 நிமிடம் — தொடர்ந்து வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Boiling the Mutton", ta: "ஆட்டிறைச்சி வேக வைத்தல்" },
          steps: [
            {
              step: 12,
              description: {
                en: "Pour in enough water to completely submerge the mutton, with a couple of inches above. Mutton takes significantly longer to cook than chicken, and there must be enough water that the pot doesn't dry out and burn during the long boil.",
                ta: "ஆட்டிறைச்சி முழுவதுமாக மூழ்கும் அளவு, மேலே சில அங்குலம் இருக்கும் அளவு தண்ணீர் ஊற்றவும். கோழியை விட ஆட்டிறைச்சி வேக மிக அதிக நேரம் ஆகும் — நீண்ட நேர வேக நிலையில் பாத்திரம் வரண்டு கருகாமல் இருக்க போதிய தண்ணீர் அவசியம்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Cover the pan and let it cook on a medium-high flame, boiling vigorously, until the meat is completely tender and soft — typically 35-50 minutes depending on the age of the goat. Check occasionally and add a splash of hot water if it starts running too dry too early.",
                ta: "பாத்திரத்தை மூடி வைத்து மிதமான-உயர் தீயில் நன்கு கொதிக்க விடவும். ஆட்டின் வயதைப் பொறுத்து, இறைச்சி முற்றிலும் மிருதுவாகி மென்மையாகும் வரை — சுமார் 35-50 நிமிடம். அவ்வப்போது சரிபார்த்து, அதிக சீக்கிரம் வரண்டு போனால் சிறிது சூடான தண்ணீர் சேர்க்கவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final 'Uppu Kari' Roast", ta: "இறுதி உப்பு கறி வறுவல்" },
          steps: [
            {
              step: 14,
              description: {
                en: "Once the mutton is fully cooked and tender, remove the lid. You will now reduce the gravy to a tight glaze.",
                ta: "ஆட்டிறைச்சி முற்றிலும் வெந்து மிருதுவாகும் போது, மூடியை எடுக்கவும். இப்போது குழம்பை இறுக்கமான பளபளப்பாக சுருக்க வேண்டும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Increase the heat slightly and let the remaining water evaporate. Stir continuously — this stage is hands-on, don't walk away.",
                ta: "தீயை லேசாக அதிகரித்து, மீதமுள்ள தண்ணீரை ஆவியாக விடவும். தொடர்ந்து கிளறவும் — இந்த நிலை கையோடு செய்ய வேண்டியது, விட்டுவிட்டு போக வேண்டாம்.",
              },
            },
            {
              step: 16,
              description: {
                en: "As the water dries up, the dissolved small onions and ginger-garlic paste will start sticking to the meat, forming a thick, tight, glossy varuval coating. Keep stirring and roasting so it caramelizes evenly without burning at the bottom.",
                ta: "தண்ணீர் வற்றும் போது, கரைந்த சின்ன வெங்காயம் மற்றும் இஞ்சி பூண்டு விழுது இறைச்சியில் ஒட்டிக்கொண்டு, கெட்டியான, இறுக்கமான, பளபளக்கும் வறுவல் கோட்டிங்காக மாறும். அடி கருகாமல், சமமாக கருக, தொடர்ந்து கிளறி வறுக்கவும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "The dish is perfectly done when the oil beautifully separates and floats around the edges of the pan, and the mutton pieces are wearing a dark, rich, spicy glaze — that's the 'Uppu Kari' signature. Turn off the heat.",
                ta: "பாத்திரத்தின் ஓரத்தில் எண்ணெய் அழகாக தனியாக மிதந்து, ஆட்டிறைச்சி துண்டுகள் இருண்ட, செழுமையான, காரமான பளபளக்கும் கோட்டில் இருக்கும் போது — அதுவே 'உப்பு கறி'யின் அடையாளம். அடுப்பை அணைக்கவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Taste and adjust salt. Serve the legendary Kongu Mutton Uppu Kari piping hot with rasam rice, plain steamed white rice with ghee, soft idlies, or hot parottas. The classic Virundhu pairing is white rice + rasam + uppu kari.",
                ta: "உப்பு சரிபார்த்து சரிசெய்யவும். புகழ்பெற்ற கொங்கு ஆட்டிறைச்சி உப்பு கறியை, ரசம் சாதம், நெய் சேர்த்த சூடான வெள்ளை சாதம், மென்மையான இட்லி அல்லது சூடான பரோட்டாவுடன் சூடாக பரிமாறவும். கிளாசிக் விருந்து சேர்க்கை: வெள்ளை சாதம் + ரசம் + உப்பு கறி.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Mutton Uppu Kari recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
