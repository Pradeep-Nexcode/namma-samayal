import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Toor Dal", ta: "துவரம் பருப்பு", quantity: "200", unit: "g" },
  { name: "Tamarind", ta: "புளி", quantity: "1", unit: "lemon-sized ball" },
  { name: "Mixed Country Vegetables", ta: "நாட்டு காய்கறிகள்", quantity: "3-4", unit: "cups" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { name: "Salt", ta: "உப்பு", quantity: "to taste", unit: "" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "2", unit: "tbsp" },
  { name: "Coriander Seeds", ta: "கொத்தமல்லி விதை", quantity: "2", unit: "tbsp" },
  { name: "Cumin Seeds", ta: "சீரகம்", quantity: "1", unit: "tsp" },
  { name: "Black Pepper", ta: "மிளகு", quantity: "1/2", unit: "tsp" },
  { name: "Fenugreek Seeds", ta: "வெந்தயம்", quantity: "1/4", unit: "tsp" },
  { name: "Chana Dal", ta: "கடலை பருப்பு", quantity: "1", unit: "tsp" },
  { name: "Raw Rice", ta: "பச்சரிசி", quantity: "1", unit: "tsp" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "10-12", unit: "nos" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "2", unit: "handfuls" },
  { name: "Grated Coconut", ta: "துруவிய தேங்காய்", quantity: "1/2", unit: "cup" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { name: "Urad Dal", ta: "உளுத்தம் பருப்பு", quantity: "1/2", unit: "tsp" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "sprig" },
  { name: "Asafoetida", ta: "பெருங்காயம்", quantity: "1", unit: "pinch" }
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const category = await Category.findOne({ type: "ingredient" }) || await Category.findOne();
    if (!category) throw new Error("No category found");

    const recipeIngredients = [];
    for (const item of ingredientsList) {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let ingredient = await Ingredient.findOne({ slug });
      
      if (!ingredient) {
        ingredient = await Ingredient.create({
          name: { en: item.name, ta: item.ta },
          slug,
          category: category._id,
          isActive: true
        });
        console.log(`Created ingredient: ${item.name}`);
      }

      recipeIngredients.push({
        ingredient: ingredient._id,
        quantity: item.quantity,
        unit: item.unit
      });
    }

    const newRecipe = new Recipe({
      dishName: { en: "Erode Koottangulambu", ta: "ஈரோடு கூட்டாங்குழம்பு" },
      slug: "erode-koottangulambu",
      description: {
        en: "An authentic Kongu-style mixed vegetable gravy that serves as a unique, heavily flavorful alternative to standard sambar. It brings together a variety of native country vegetables and freshly roasted spices.",
        ta: "கொங்கு நாட்டு பாரம்பரிய கூட்டாங்குழம்பு. பல்வேறு நாட்டு காய்கறிகள் மற்றும் வறுத்த அரைத்த மசாலா சேர்த்து செய்யப்படும் சுவையான குழம்பு."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 20,
      cookingTime: 40,
      totalTime: 60,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      tags: ["veg", "gravy", "koottangulambu", "erode", "kongu", "healthy", "mixed-veg"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "preparation",
          title: { en: "Preparing the Dal", ta: "பருப்பு வேகவைத்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Wash the Toor Dal thoroughly.",
                ta: "துவரம் பருப்பை நன்கு கழுவிக் கொள்ளவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Pressure cook the dal with a pinch of turmeric and a few drops of castor oil or groundnut oil until completely soft and mushy (about 3-4 whistles).",
                ta: "பருப்புடன் சிறிது மஞ்சள் தூள் மற்றும் ஓரிரு சொட்டு எண்ணெய் சேர்த்து குக்கரில் குழைய வேகவைக்கவும் (3-4 விசில்)."
              }
            },
            {
              step: 3,
              description: {
                en: "Mash the cooked dal well and set it aside.",
                ta: "வெந்த பருப்பை நன்கு மசித்து தனியாக வைக்கவும்."
              }
            }
          ]
        },
        {
          type: "masala",
          title: { en: "Making the Fresh Masala Paste", ta: "மசாலா அரைத்தல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Heat 1 teaspoon of oil in a pan. Add coriander seeds, cumin, black pepper, fenugreek, chana dal, raw rice, and dry red chillies. Roast them gently on a low flame until they release a nutty aroma.",
                ta: "கடாயில் 1 ஸ்பூன் எண்ணெய் ஊற்றி கொத்தமல்லி, சீரகம், மிளகு, வெந்தயம், கடலை பருப்பு, பச்சரிசி மற்றும் காய்ந்த மிளகாய் சேர்த்து மிதமான தீயில் வறுக்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Add the handful of small onions and sauté until they turn translucent. Then add the grated coconut, give it a quick stir for about 30 seconds, and turn off the heat.",
                ta: "சின்ன வெங்காயம் சேர்த்து வதக்கவும். பின் தேங்காய் துருவல் சேர்த்து 30 வினாடிகள் வதக்கி அடுப்பை அணைக்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Let this mixture cool entirely, then transfer it to a blender. Add a little water and grind it into a smooth, fine paste.",
                ta: "ஆறிய பின் சிறிதளவு தண்ணீர் சேர்த்து விழுதாக அரைத்துக் கொள்ளவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Cooking the Vegetables", ta: "காய்கறிகளை வேகவைத்தல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "In a large, heavy-bottomed vessel (preferably a mud pot/manchatti for authentic flavor), add the chopped mixed vegetables.",
                ta: "ஒரு பெரிய மண்சட்டியில் நறுக்கிய காய்கறிகளை சேர்க்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Add enough water to submerge them, along with turmeric powder and a little salt. Let the vegetables boil until they are 70% cooked.",
                ta: "காய்கறிகள் மூழ்கும் அளவு தண்ணீர், மஞ்சள் தூள் மற்றும் உப்பு சேர்த்து காய்கறிகள் முக்கால் பதம் வேகும் வரை கொதிக்க விடவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Building the Kulambu", ta: "குழம்பு கொதிக்க வைத்தல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Once the vegetables are mostly cooked, pour in the extracted tamarind water. Let it boil for 5-7 minutes until the raw smell of the tamarind disappears.",
                ta: "காய்கறிகள் வெந்ததும், புளித்தண்ணீர் சேர்த்து பச்சை வாசனை போகும் வரை 5-7 நிமிடம் கொதிக்க விடவும்."
              }
            },
            {
              step: 10,
              description: {
                en: "Now, add the freshly ground masala paste to the boiling vegetables. Mix well and let it cook for another 5 minutes so the spices infuse into the vegetables.",
                ta: "இப்போது அரைத்து வைத்துள்ள மசாலா விழுதை சேர்த்து நன்கு கலந்து மேலும் 5 நிமிடம் கொதிக்க விடவும்."
              }
            },
            {
              step: 11,
              description: {
                en: "Pour the mashed Toor Dal into the pot. Stir well to combine everything. Adjust the consistency by adding a little water if it's too thick.",
                ta: "மசித்து வைத்துள்ள துவரம் பருப்பை சேர்த்து நன்கு கலக்கவும். குழம்பு கெட்டியாக இருந்தால் சிறிது தண்ணீர் சேர்க்கவும்."
              }
            },
            {
              step: 12,
              description: {
                en: "Let the entire gravy simmer together for about 5-8 minutes until the aroma fills the kitchen and it reaches a rich, thick consistency. Turn off the heat.",
                ta: "அனைத்தும் சேர்ந்து 5-8 நிமிடம் நன்கு கொதித்த பின் அடுப்பை அணைக்கவும்."
              }
            }
          ]
        },
        {
          type: "tempering",
          title: { en: "Tempering (Thalippu)", ta: "தாளித்தல்" },
          steps: [
            {
              step: 13,
              description: {
                en: "Heat groundnut oil in a small pan. Add mustard seeds and let them splutter.",
                ta: "சிறிய கடாயில் கடலை எண்ணெய் ஊற்றி கடுகு தாளிக்கவும்."
              }
            },
            {
              step: 14,
              description: {
                en: "Add the urad dal, chopped small onions, and curry leaves. Sauté until the onions turn golden brown.",
                ta: "உளுத்தம் பருப்பு, நறுக்கிய சின்ன வெங்காயம் மற்றும் கருவேப்பிலை சேர்த்து பொன்னிறமாகும் வரை வதக்கவும்."
              }
            },
            {
              step: 15,
              description: {
                en: "Add a pinch of asafoetida, then immediately pour this sizzling tempering over the hot Koottangulambu.",
                ta: "சிறிது பெருங்காயத் தூள் சேர்த்து, இந்த தாளிப்பை சூடான கூட்டாங்குழம்பில் சேர்க்கவும்."
              }
            },
            {
              step: 16,
              description: {
                en: "Garnish with a handful of fresh coriander leaves. Serve piping hot over steamed white rice with a dollop of ghee!",
                ta: "கொத்தமல்லி இலை தூவி, சூடான சாதம் மற்றும் நெய்யுடன் பரிமாறவும்!"
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Koottangulambu recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
