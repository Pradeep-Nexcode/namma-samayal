import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

// Each entry maps to an existing ingredient by `slug` (from DB) when possible.
// If `slug` doesn't exist, the script creates the ingredient using `name`, `ta`, and `categorySlug`.
const ingredientsList: Array<{
  slug: string;
  name: string;
  ta: string;
  quantity: string;
  unit: string;
  categorySlug?: string;
}> = [
  { slug: "sundakkai", name: "Sundakkai (Turkey Berry)", ta: "சுண்டக்காய்", quantity: "1", unit: "cup", categorySlug: "vegetables" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "3-4", unit: "tbsp" },
  { slug: "chana-dal", name: "Chana Dal", ta: "கடலை பருப்பு", quantity: "2", unit: "tbsp" },
  { slug: "urad-dal", name: "Urad Dal", ta: "உளுந்து", quantity: "2", unit: "tbsp" },
  { slug: "coriander-seeds", name: "Coriander Seeds", ta: "கொத்தமல்லி விதை", quantity: "1", unit: "tbsp" },
  { slug: "cumin-seeds", name: "Cumin Seeds", ta: "சீரகம்", quantity: "1", unit: "tsp" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "6-8", unit: "nos" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "150-200", unit: "g" },
  { slug: "tomato", name: "Tomato", ta: "தக்காளி", quantity: "2", unit: "nos" },
  { slug: "tamarind", name: "Tamarind", ta: "புளி", quantity: "1", unit: "small lemon-sized piece" },
  { slug: "grated-coconut", name: "Grated Coconut", ta: "துருவிய தேங்காய்", quantity: "1/4", unit: "cup" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves", ta: "கொத்தமல்லி", quantity: "1", unit: "handful" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-aaya-sundakkai-chutney";
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
      dishName: { en: "Erode Aaya's Sundakkai Chutney", ta: "ஈரோடு ஆயா சுண்டக்காய் சட்னி" },
      slug,
      description: {
        en: "An authentic Erode-style chutney that transforms bitter turkey berries (Sundakkai) into a deliciously balanced side dish. Famous as a traditional Tamil 'tasty medicine' for mouth and stomach ulcers, this recipe uses a classic crushing-and-washing technique to flush out the bitterness before slow sautéing the berries with shallots, tomatoes, tamarind, roasted dals and coconut.",
        ta: "ஈரோடு பகுதியின் பாரம்பரிய சுண்டக்காய் சட்னி. கசப்பான சுண்டக்காயை இடித்து, கழுவி, சின்ன வெங்காயம், தக்காளி, புளி, வறுத்த பருப்புகள் மற்றும் தேங்காயுடன் சேர்த்து அரைக்கும் இந்த சட்னி, வாய்ப்புண் மற்றும் வயிற்றுப்புண்ணுக்கு ருசியான மருந்தாக கருதப்படுகிறது.",
      },
      speciality: {
        en: "Traditional Tamil remedy for mouth and stomach ulcers — neutralizes Sundakkai's bitterness through the crushing-and-washing technique and a full color-change sauté in groundnut oil. Balances all six tastes (arusuvai).",
        ta: "வாய்ப்புண் மற்றும் வயிற்றுப்புண்ணை குணப்படுத்தும் பாரம்பரிய தமிழ் மருத்துவம். சுண்டக்காயை இடித்து கழுவுவதன் மூலமும், கடலை எண்ணெயில் முழுமையாக நிறம் மாறும் வரை வதக்குவதன் மூலமும் கசப்பு நீக்கப்படுகிறது. அறுசுவை சமச்சீர் கொண்டது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 15,
      cookingTime: 25,
      totalTime: 40,
      servings: 4,
      difficulty: "medium",
      source: "youtube",
      tags: [
        "chutney",
        "thogayal",
        "sundakkai",
        "turkey-berry",
        "erode",
        "kongu",
        "tamil-nadu",
        "veg",
        "medicinal",
        "ulcer-remedy",
        "side-dish",
        "traditional",
      ],
      searchKeywords: [
        "sundakkai",
        "turkey berry",
        "சுண்டக்காய்",
        "sundakkai chutney",
        "sundakkai thogayal",
        "erode aaya",
        "ulcer remedy",
        "vaay pun",
        "kongu chutney",
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
          title: { en: "Preparing the Turkey Berries", ta: "சுண்டக்காய் தயாரித்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Place the fresh Sundakkai on a clean surface and lightly pound them with a crushing stone (ammikkal) or pestle just until each berry cracks open. Do not mash them.",
                ta: "புதிய சுண்டக்காயை சுத்தமான மேற்பரப்பில் வைத்து, அம்மிக்கல் அல்லது உலக்கையால் வெடிக்கும் வரை மட்டும் மெதுவாக இடிக்கவும். முற்றிலும் நசுக்க வேண்டாம்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Drop the cracked berries into a bowl of water, swirl them vigorously to release and remove the loose inner seeds (which hold most of the bitterness), then drain the water completely.",
                ta: "வெடித்த சுண்டக்காயை ஒரு பாத்திரத்தில் தண்ணீரில் போட்டு நன்கு கலக்கி, கசப்பு கொண்ட உள் விதைகளை நீக்கவும். தண்ணீரை முழுவதுமாக வடிக்கவும்.",
              },
            },
          ],
        },
        {
          type: "roasting",
          title: { en: "Roasting the Spices and Dals", ta: "பருப்பு மற்றும் மசாலா வறுத்தல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat a heavy-bottomed clay pot (manchatti) or kadai and add 1 tablespoon of groundnut oil.",
                ta: "ஒரு தடிமனான மண்சட்டி அல்லது கடாயை சூடுபடுத்தி 1 ஸ்பூன் கடலை எண்ணெய் சேர்க்கவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Add chana dal, urad dal, coriander seeds, cumin seeds and dry red chillies. Roast on a medium-low flame, stirring constantly, until the dals turn a deep golden brown and release a nutty aroma. Remove and set aside on a plate to cool.",
                ta: "கடலை பருப்பு, உளுந்து, கொத்தமல்லி விதை, சீரகம் மற்றும் காய்ந்த மிளகாய் சேர்த்து, மிதமான தீயில் தொடர்ந்து கிளறி, பருப்புகள் பொன்னிற பழுப்பாகும் வரை வறுக்கவும். எடுத்து தனியாக ஆற வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Base", ta: "அடிக்கூட்டு வதக்கல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "In the same pan, add another tablespoon of groundnut oil. Add the peeled small onions (shallots) and sauté on medium heat until they turn translucent and aromatic.",
                ta: "அதே கடாயில் மற்றொரு ஸ்பூன் கடலை எண்ணெய் சேர்த்து, தோல் சீவிய சின்ன வெங்காயத்தை போட்டு, பளபளப்பாகும் வரை மிதமான தீயில் வதக்கவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Add the roughly chopped tomatoes, the lemon-sized piece of tamarind, and crystal salt to taste. Sauté until the tomatoes break down completely and become mushy.",
                ta: "நறுக்கிய தக்காளி, எலுமிச்சை அளவு புளி மற்றும் தேவையான கல் உப்பு சேர்த்து, தக்காளி நன்கு குழைந்து மிருதுவாகும் வரை வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Crucial Sundakkai Sauté", ta: "சுண்டக்காய் வதக்கும் முக்கிய படி" },
          steps: [
            {
              step: 7,
              description: {
                en: "Add the crushed and washed Sundakkai directly into the onion-tomato-tamarind mixture and stir to coat.",
                ta: "இடித்து கழுவிய சுண்டக்காயை வெங்காயம்-தக்காளி-புளி கலவையில் சேர்த்து நன்கு கலக்கவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Pour in a little more groundnut oil if the pan looks dry. Keep sautéing the berries continuously on a medium flame, stirring often so they cook evenly.",
                ta: "கடாய் வரண்டால் சிறிது கடலை எண்ணெய் சேர்க்கவும். சுண்டக்காயை மிதமான தீயில் சமமாக வேக, தொடர்ந்து கிளறி வதக்கவும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Critical step — watch the color: cook until the berries shrink and their bright green color completely fades to a dull, pale, yellowish-olive green. Skipping this step will leave the chutney bitter and inedible.",
                ta: "மிக முக்கியமான படி — நிறத்தை கவனிக்கவும்: சுண்டக்காய் சுருங்கி, பளபளப்பான பச்சை நிறம் முற்றிலுமாக மங்கி, மங்கலான வெளிர் ஆலிவ் பச்சை நிறமாக மாறும் வரை வதக்கவும். இந்த படியை தவிர்த்தால் சட்னி கசப்பாகிவிடும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Final Mix and Grind", ta: "இறுதி கலவை மற்றும் அரைத்தல்" },
          steps: [
            {
              step: 10,
              description: {
                en: "Once the berries are perfectly roasted and the color has fully changed, add the grated coconut, curry leaves and fresh coriander leaves to the hot pan.",
                ta: "சுண்டக்காய் நன்கு வதங்கி நிறம் முழுமையாக மாறியதும், துருவிய தேங்காய், கருவேப்பிலை மற்றும் கொத்தமல்லியை சேர்க்கவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Stir for about 30 seconds just to wilt the leaves and release their aroma, then turn off the heat. Do not over-roast the coconut.",
                ta: "இலைகள் வாடி வாசனை வரும் வரை சுமார் 30 வினாடிகள் கிளறி அடுப்பை அணைக்கவும். தேங்காயை அதிகமாக வறுக்க வேண்டாம்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Let the entire mixture cool completely. Transfer the roasted dal-chilli mixture and the cooked Sundakkai base into a mixer jar and grind into a thick, slightly coarse paste (thogayal consistency). Add a splash of water only if absolutely needed.",
                ta: "முழு கலவையும் முழுவதுமாக ஆற வைக்கவும். வறுத்த பருப்பு-மிளகாய் கலவை மற்றும் வேக வைத்த சுண்டக்காய் அடிக்கூட்டை மிக்ஸியில் சேர்த்து, கெட்டியான கொஞ்சம் கரகரப்பான தொகையல் பதத்துக்கு அரைக்கவும். தேவைப்பட்டால் மட்டும் சிறிது தண்ணீர் சேர்க்கவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Taste and adjust salt. Serve this medicinal yet delicious chutney with hot idlies, dosa, or mix it directly into steaming white rice with a generous dollop of ghee.",
                ta: "உப்பு சரிபார்த்து சரிசெய்யவும். சூடான இட்லி, தோசையுடன் அல்லது சூடான வெள்ளை சாதத்தில் நெய் சேர்த்து கலந்து பரிமாறவும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Sundakkai Chutney recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
