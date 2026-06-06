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
  { slug: "mushroom", name: "Button Mushrooms (Kalaan, stems attached, large quarters)", ta: "காளான் (பட்டன் காளான், காம்புடன், பெரிய துண்டுகள்)", quantity: "400", unit: "g (~2 packs)", categorySlug: "vegetables" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, roughly chopped — NOT whole)", ta: "சின்ன வெங்காயம் (பெரிய துண்டாக நறுக்கியது — முழுதாக அல்ல)", quantity: "150-200", unit: "g" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies (halved + completely deseeded)", ta: "காய்ந்த மிளகாய் (பாதியாக்கி, விதை முற்றிலும் நீக்கியது)", quantity: "8-10", unit: "nos" },
  { slug: "coconut", name: "Fresh Coconut (small SQUARE chunks, not strips)", ta: "தேங்காய் (சிறிய சதுர துண்டுகள், நீள துண்டு அல்ல)", quantity: "1/4", unit: "cup" },
  { slug: "sambar-powder", name: "Homemade Sambar Powder (Kuzhambu Thool)", ta: "வீட்டு சாம்பார் தூள் (குழம்பு தூள்)", quantity: "1.5", unit: "tbsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves (for garnish)", ta: "கொத்தமல்லி (அலங்காரம்)", quantity: "1", unit: "handful" },
  { slug: "groundnut-oil", name: "Groundnut Oil (cold-pressed)", ta: "கடலை எண்ணெய் (மரச்செக்கு)", quantity: "3-4", unit: "tbsp" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "maanthoppu-virundhu-mushroom-pallipalayam";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "vegetables" }) || await Category.findOne();
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
        en: "Maanthoppu Virundhu Mushroom Pallipalayam (Vegetarian Pallipalayam)",
        ta: "மான்தோப்பு விருந்து காளான் பல்லிப்பாளையம் (சைவ பல்லிப்பாளையம்)",
      },
      slug,
      description: {
        en: "A 100% vegetarian reimagining of Erode's world-famous Chicken Pallipalayam, created by the chefs at Maanthoppu Virundhu so vegetarians don't miss out on the legendary Kongu experience. Inspired by an old village memory — during heavy Purattasi-month rains, wild mushrooms (kalaan) would sprout along the edges of agricultural fields (varappu); villagers plucked them fresh and tossed them in a pan with shallots and chillies. This dish recreates that exact rustic, earthy village flavor using modern button mushrooms. The standout move: traditional home-ground SAMBAR POWDER (kuzhambu thool) replaces the usual chicken masala — it perfectly complements the delicate earthy flavor of the mushroom and is the secret to making this taste like a Mushroom Pallipalayam, not a generic mushroom gravy. Mushroom-juice cooked (no water added), finished as a glossy semi-dry roast with juicy mushroom bites and crunchy oil-roasted coconut squares.",
        ta: "ஈரோடின் உலகப் புகழ் பெற்ற கோழி பல்லிப்பாளையத்தின் 100% சைவ பதிப்பு — மான்தோப்பு விருந்து சமையற்காரர்களால் உருவாக்கப்பட்டது, சைவம் சாப்பிடுபவர்களும் இந்த கொங்கு அனுபவத்தை அனுபவிக்க. பழைய கிராமத்து நினைவில் ஊக்கம்: புரட்டாசி மாதத்தின் கனமழையில், விவசாய நிலத்து வரம்பில் (வரப்பு) காட்டு காளான் தானாகவே வளரும்; கிராமத்தினர் புதிதாக பறித்து சின்ன வெங்காயம், மிளகாயுடன் கடாயில் சேர்த்து உடனே சாப்பிட்டனர். அதே கிராமத்து சுவையை நவீன பட்டன் காளானில் இந்த உணவு மீண்டும் உருவாக்குகிறது. தனிச்சிறப்பு: வழக்கமான சிக்கன் மசாலாவுக்கு பதிலாக, வீட்டு சாம்பார் தூள் (குழம்பு தூள்) பயன்படுத்தப்படுகிறது — காளானின் மென்மையான மண் வாசனை சுவைக்கு பொருந்தும் இந்த ரகசியமே, இதை சாதாரண காளான் குழம்பல்ல, உண்மையான காளான் பல்லிப்பாளையமாக ஆக்குகிறது. காளானின் சொந்த சாற்றிலேயே வேக வைக்கப்பட்டு (தண்ணீர் சேர்க்கப்படவில்லை), பளபளக்கும் அரை-உலர் வறுவலாக முடிக்கப்படுகிறது — சதைப்பற்றான காளான் கடிக்கும், எண்ணெய்-வறுத்த தேங்காய் சதுரங்களின் கொறுகொறுப்பும்.",
      },
      speciality: {
        en: "Five Maanthoppu Virundhu signatures define this dish: (1) The Vegetarian Champion — same dark, fiery, semi-dry Pallipalayam roast that the region is famous for, but 100% veg; mushrooms stand in for chicken without making it taste like a 'mushroom curry'. (2) The Sambar Powder Secret — using home-ground SAMBAR POWDER (kuzhambu thool) instead of chicken masala is the entire game; sambar powder's roasted coriander-cumin-dal profile complements mushrooms perfectly, where chicken masala overpowers them. (3) The Chopping Adjustments — chicken Pallipalayam uses whole shallots and long coconut strips because chicken cooks for an hour; mushrooms cook in minutes, so shallots are CHOPPED and coconut is in TINY SQUARE chunks for even cooking. (4) The 'No Water' Mushroom Rule — salt + mushroom = mushrooms release plenty of their own water within seconds; adding extra water would dilute the masala and the dish would turn into a soup. (5) The Rainy-Season Kalaan Nostalgia — during Purattasi rains, wild village mushrooms sprouted along field edges (varappu) and were eaten the same day; this recipe rebuilds that exact memory.",
        ta: "ஐந்து மான்தோப்பு விருந்து தனிச்சிறப்புகள்: (1) சைவ சாம்பியன் — பகுதியின் புகழ்பெற்ற அதே இருண்ட, காரமான, அரை-உலர் பல்லிப்பாளையம் வறுவல், ஆனால் 100% சைவம்; கோழிக்கு பதிலாக காளான், ஆனாலும் 'காளான் கறி' சுவை இல்லை. (2) சாம்பார் தூள் ரகசியம் — சிக்கன் மசாலாவுக்கு பதிலாக வீட்டு சாம்பார் தூள் (குழம்பு தூள்) பயன்படுத்துவதே முழு வேறுபாடு; சாம்பார் தூளில் வறுத்த கொத்தமல்லி-சீரகம்-பருப்பு கலவை காளானின் சுவையை சரியாக கூட்டும், ஆனால் சிக்கன் மசாலா அதை மறைத்துவிடும். (3) நறுக்கு சரிசெய்தல் — கோழி பல்லிப்பாளையத்தில் முழு சின்ன வெங்காயம் மற்றும் நீளமான தேங்காய் துண்டுகள் — ஏனெனில் கோழி ஒரு மணி நேரம் வேகும்; ஆனால் காளான் சில நிமிடங்களில் வேகும், எனவே சின்ன வெங்காயம் நறுக்கப்பட்டு, தேங்காய் சிறு சதுர துண்டுகளாக — சீராக வேக. (4) 'தண்ணீர் இல்லை' விதி — உப்பு + காளான் = காளான் சில விநாடிகளில் நிறைய சொந்த நீரை வெளியேற்றும்; தண்ணீர் சேர்த்தால் மசாலா நீர்த்து, உணவு சூப்பாக மாறும். (5) புரட்டாசி காளான் நினைவு — புரட்டாசி மழையில், கிராமத்து வயல் வரப்பில் காட்டு காளான் முளைத்து, அதே நாள் சாப்பிடப்பட்டது; இந்த உணவு அந்த நினைவை மீண்டும் கட்டமைக்கிறது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 15,
      cookingTime: 20,
      totalTime: 35,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "veg",
        "vegetarian",
        "vegan",
        "starter",
        "side-dish",
        "mushroom",
        "kalaan",
        "pallipalayam",
        "varuval",
        "dry-roast",
        "semi-dry",
        "no-water-cooking",
        "sambar-powder",
        "kuzhambu-thool",
        "erode",
        "kongu",
        "tamil-nadu",
        "maanthoppu-virundhu",
        "purattasi",
        "rainy-season",
        "traditional",
        "village-style",
      ],
      searchKeywords: [
        "mushroom pallipalayam",
        "kalaan pallipalayam",
        "vegetarian pallipalayam",
        "காளான் பல்லிப்பாளையம்",
        "மான்தோப்பு விருந்து காளான்",
        "mushroom varuval",
        "maanthoppu virundhu mushroom",
        "erode mushroom",
        "kongu mushroom",
        "purattasi kalaan",
        "wild mushroom recipe",
        "sambar powder mushroom",
        "chef deena mushroom pallipalayam",
        "veg pallipalayam",
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
          title: { en: "Prep (Chopping Adjustments)", ta: "முன் தயாரிப்பு (நறுக்கு சரிசெய்தல்)" },
          steps: [
            {
              step: 1,
              description: {
                en: "Wash the 400g (2 packs) of button mushrooms in cold water briefly and pat them dry on a towel — don't soak; mushrooms absorb water like sponges. Critical: KEEP THE STEMS ATTACHED and cut each mushroom into LARGE quarters or sixths (4 or 6 pieces per mushroom). Don't cut them small — they shrink dramatically during cooking.",
                ta: "400 கிராம் (2 பாக்) பட்டன் காளானை குளிர்ந்த தண்ணீரில் வேகமாக கழுவி, துண்டில் வைத்து ஈரத்தை துடைக்கவும் — ஊறவைக்க வேண்டாம்; காளான் ஸ்பாஞ்ச் போல தண்ணீரை உள்ளீர்க்கும். மிக முக்கியம்: காம்புகளை நீக்காமல் வைத்து, ஒவ்வொரு காளானையும் பெரிய பெரிய துண்டுகளாக (ஒன்றை 4 அல்லது 6 ஆக மட்டுமே) வெட்டவும். சிறியதாக நறுக்க வேண்டாம் — வேக்கும் போது நிறைய சுருங்கிவிடும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Peel the 150-200g of small onions and ROUGHLY CHOP them — do NOT keep them whole. (This is the chopping adjustment from chicken Pallipalayam, where shallots stay whole because chicken cooks for an hour. Mushrooms cook in minutes, so chopped shallots are needed for even cooking.)",
                ta: "150-200 கிராம் சின்ன வெங்காயத்தை தோல் சீவி, பெரிய துண்டுகளாக நறுக்கவும் — முழுதாக வைக்க வேண்டாம். (இது கோழி பல்லிப்பாளையத்திலிருந்து சரிசெய்தல்; அங்கு சின்ன வெங்காயம் முழுதாக இருக்கும் ஏனெனில் கோழி ஒரு மணி நேரம் வேகும். ஆனால் காளான் சில நிமிடங்களில் வேகும், எனவே சீராக வேக நறுக்கிய சின்ன வெங்காயம் தேவை.)",
              },
            },
            {
              step: 3,
              description: {
                en: "Cut the fresh coconut into TINY SQUARE chunks (about 5-7 mm cubes) — NOT long strips. The square shape ensures the coconut cooks at the same pace as the mushrooms; long strips would stay raw inside while the mushrooms finish.",
                ta: "புதிய தேங்காயை மிக சிறிய சதுர துண்டுகளாக (சுமார் 5-7 மிமீ கனசதுரம்) வெட்டவும் — நீளமான துண்டுகள் வேண்டாம். சதுர வடிவம் தேங்காய் காளானுடன் சம வேகத்தில் வேக உதவும்; நீளமான துண்டுகள் காளான் வெந்த பிறகும் உள்ளே பச்சையாக இருக்கும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Critical de-seeding step: take the 8-10 dry red chillies, tear each one open lengthwise, and shake out ALL the seeds. Discard the seeds completely — this lets you use a generous quantity of chillies for color and smoke without making the dish painfully spicy.",
                ta: "மிக முக்கியமான விதை நீக்கும் படி: 8-10 காய்ந்த மிளகாயை எடுத்து, ஒவ்வொன்றையும் நீளவாக்கில் கிழித்து, விதைகள் அனைத்தையும் தட்டி நீக்கவும். விதைகளை முற்றிலும் வீசிவிடவும் — இது நிறம் மற்றும் புகைக்கு போதிய மிளகாய் சேர்க்க உதவும், ஆனாலும் தாங்க முடியாத காரம் இருக்காது.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Aromatics", ta: "வாசனை வதக்கல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Heat a heavy-bottomed kadai or a traditional iron pan over medium-high heat. Pour in the 3-4 tablespoons of cold-pressed groundnut oil — the rustic flavor of this oil is integral to the dish.",
                ta: "ஒரு தடிமனான கடாய் அல்லது பாரம்பரிய இரும்பு கடாயை மிதமான-உயர் தீயில் சூடாக்கவும். 3-4 ஸ்பூன் மரச்செக்கு கடலை எண்ணெய் ஊற்றவும் — இந்த எண்ணெயின் கிராமத்து சுவை உணவின் முழு அடிப்படை.",
              },
            },
            {
              step: 6,
              description: {
                en: "Once the oil is hot, add the 1 tsp of mustard seeds and let them splutter completely. Immediately toss in the generous handful of curry leaves and let them crackle.",
                ta: "எண்ணெய் சூடாகும் போது, 1 ஸ்பூன் கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும். உடனே ஒரு கைப்பிடி கருவேப்பிலையை சேர்த்து சீறி வெடிக்க விடவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Add the deseeded dry red chillies and let them roast briefly in the hot oil for 30-45 seconds, until they puff up and release their smoky aroma. Don't burn them.",
                ta: "விதை நீக்கிய காய்ந்த மிளகாயை சேர்த்து, சூடான எண்ணெயில் 30-45 விநாடிகள் பருத்து, புகை வாசனை வீச விடவும். கருக விட வேண்டாம்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Toss in the roughly chopped small onions. Sauté patiently on a medium flame, stirring often, until they turn translucent and develop a light golden-brown color — about 5-7 minutes.",
                ta: "பெரிய துண்டுகளாக நறுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, பளபளப்பாகி, லேசான பொன்னிற பழுப்பு வரும் வரை — சுமார் 5-7 நிமிடம் — பொறுமையாக வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Roasting the Coconut (Before Mushrooms)", ta: "தேங்காய் வறுத்தல் (காளானுக்கு முன்)" },
          steps: [
            {
              step: 9,
              description: {
                en: "BEFORE adding the mushrooms, drop the small square coconut pieces directly into the oil with the onions and chillies.",
                ta: "காளானை சேர்க்கும் முன்பே, சிறிய சதுர தேங்காய் துண்டுகளை நேரடியாக வெங்காயம் மற்றும் மிளகாயுடன் சேர்க்கவும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Roast them for about 2 minutes, stirring continuously. Cooking the coconut in the spicy aromatic oil (BEFORE the mushrooms release their water) ensures the coconut absorbs the flavors and develops a beautiful, crunchy oil-roasted exterior. If you skip this and add coconut later, it'll just boil in mushroom-water and lose its crunch.",
                ta: "தொடர்ந்து கிளறி சுமார் 2 நிமிடம் வறுக்கவும். (காளான் தனது நீரை வெளியேற்றும் முன்பே) தேங்காயை காரமான வாசனை எண்ணெயில் வறுப்பது — தேங்காய் சுவையை உள்ளீர்த்து, அழகான கொறுகொறுப்பான எண்ணெய்-வறுத்த வெளிப்பகுதியை பெற உதவும். இந்த படியை தவிர்த்து தேங்காயை பின்னர் சேர்த்தால், காளான் நீரிலேயே வேகி கொறுகொறுப்பை இழக்கும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Mushrooms (No Water!)", ta: "காளான் வேக வைத்தல் (தண்ணீர் இல்லை!)" },
          steps: [
            {
              step: 11,
              description: {
                en: "Add the quartered mushrooms into the pan and give everything a good toss so each mushroom piece is coated in the spicy oil and surrounded by the onion-coconut mixture.",
                ta: "துண்டாக்கிய காளானை கடாயில் சேர்த்து, ஒவ்வொரு காளான் துண்டிலும் காரமான எண்ணெய் படியும்படியும், வெங்காயம்-தேங்காய் கலவை சூழும்படியும் நன்கு புரட்டி கலக்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add the ½ tsp turmeric powder, the 1½ tablespoons of homemade sambar powder (kuzhambu thool), and crystal salt to taste. Critical: do NOT add ANY water. As soon as the salt touches the mushrooms, they will naturally release a large amount of their own water — this becomes the entire cooking liquid.",
                ta: "½ ஸ்பூன் மஞ்சள் தூள், 1½ ஸ்பூன் வீட்டு சாம்பார் தூள் (குழம்பு தூள்) மற்றும் தேவையான கல் உப்பு சேர்க்கவும். மிக முக்கியம்: எந்த தண்ணீரும் சேர்க்க வேண்டாம். உப்பு காளானை தொட்டவுடன், அதுவே நிறைய சொந்த நீரை வெளியேற்றும் — அதே நீர்தான் முழு சமையல் சாறாகவும் மாறும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Pallipalayam Roast Finish", ta: "பல்லிப்பாளையம் வறுவல் முடிப்பு" },
          steps: [
            {
              step: 13,
              description: {
                en: "Keep the flame on medium-high. Let the mushrooms cook in their own released juices. Toss the mixture continuously — every 20-30 seconds — so the masala wraps every piece evenly and nothing sticks to the bottom.",
                ta: "தீயை மிதமான-உயர் நிலையில் வைக்கவும். காளானை அதன் சொந்த சாற்றிலேயே வேக விடவும். ஒவ்வொரு 20-30 விநாடிக்கும், கலவையை தொடர்ந்து புரட்டவும் — மசாலா ஒவ்வொரு துண்டிலும் சீராக சுற்றி, அடியில் ஒட்டாமல் இருக்க.",
              },
            },
            {
              step: 14,
              description: {
                en: "As the released water evaporates over 6-10 minutes, the sambar powder and the onion juices will tighten and wrap around the mushrooms and coconut pieces — the dish will transform from wet to a glossy semi-dry coated roast.",
                ta: "வெளியேற்றப்பட்ட நீர் 6-10 நிமிடத்தில் ஆவியாக ஆகும் போது, சாம்பார் தூள் மற்றும் வெங்காய சாறு இறுகி, காளான் மற்றும் தேங்காய் துண்டுகளை சுற்றி கட்டிக்கொள்ளும் — உணவு ஈரத்திலிருந்து பளபளக்கும் அரை-உலர் வறுவலாக மாறும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "The dish is perfectly done when the pan is COMPLETELY dry and you can see the groundnut oil glistening and separating at the EDGES of the pan — that's the visual signal. Don't over-roast past this point or the mushrooms will turn rubbery.",
                ta: "பாத்திரம் முற்றிலும் காய்ந்து, கடாயின் ஓரத்தில் கடலை எண்ணெய் தெளிவாக மிதந்து, பிரிய ஆரம்பிக்கும் போது உணவு தயார் — அதுவே அடையாளம். இதைத் தாண்டி அதிகம் வறுக்க வேண்டாம், காளான் ரப்பர் போல மாறிவிடும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Turn off the heat. Garnish with a generous handful of freshly chopped coriander leaves.",
                ta: "அடுப்பை அணைக்கவும். தாராளமான கைப்பிடி புதிதாக நறுக்கிய கொத்தமல்லியை தூவவும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Serve this brilliant vegetarian Mushroom Pallipalayam three ways: (a) steaming hot as a starter (the juicy mushroom + crunchy coconut texture-contrast shines here); (b) as a side with Pachai Puli Rasam and plain white rice — the classic Kongu pairing; (c) rolled into a hot chapathi or parotta.",
                ta: "இந்த அற்புதமான சைவ காளான் பல்லிப்பாளையத்தை மூன்று வழிகளில் பரிமாறவும்: (அ) ஸ்டார்ட்டராக சூடாக (சதைப்பற்றான காளான் + கொறுகொறுப்பான தேங்காய் சுவை வேறுபாடு பளிச்சிடும்); (ஆ) பச்சை புளி ரசம் மற்றும் வெள்ளை சாதத்துடன் சைடாக — கிளாசிக் கொங்கு சேர்க்கை; (இ) சூடான சப்பாத்தி அல்லது பரோட்டாவில் சுருட்டி.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Mushroom Pallipalayam recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
