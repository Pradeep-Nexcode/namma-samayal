import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Coriander Seeds", ta: "கொத்தமல்லி விதை", quantity: "1", unit: "cup" },
  { name: "Cumin Seeds", ta: "சீரகம்", quantity: "1", unit: "tbsp" },
  { name: "Chana Dal", ta: "கடலை பருப்பு", quantity: "1", unit: "tbsp" },
  { name: "Urad Dal", ta: "உளுத்தம் பருப்பு", quantity: "1", unit: "tbsp" },
  { name: "Raw Rice", ta: "பச்சரிசி", quantity: "1", unit: "tbsp" },
  { name: "Black Pepper", ta: "மிளகு", quantity: "1", unit: "tbsp" },
  { name: "Cinnamon", ta: "பட்டை", quantity: "2-3", unit: "pieces" },
  { name: "Cloves", ta: "கிராம்பு", quantity: "3-4", unit: "pieces" },
  { name: "Fennel Seeds", ta: "சோம்பு", quantity: "1/2", unit: "tsp" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "15-20", unit: "nos" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "150", unit: "g" },
  { name: "Grated Coconut", ta: "துருவிய தேங்காய்", quantity: "1", unit: "cup" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "3-4", unit: "tbsp" },
  { name: "Country Chicken", ta: "நாட்டுக்கோழி", quantity: "1", unit: "kg" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { name: "Water", ta: "தண்ணீர்", quantity: "as required", unit: "" }
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Get User
    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const category = await Category.findOne({ type: "ingredient" }) || await Category.findOne();
    if (!category) throw new Error("No category found");

    // 2. Get/Create Ingredients
    const recipeIngredients = [];
    for (const item of ingredientsList) {
      let ingredient = await Ingredient.findOne({ "name.en": new RegExp(`^${item.name}$`, "i") });
      
      if (!ingredient) {
        ingredient = await Ingredient.create({
          name: { en: item.name, ta: item.ta },
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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

    // 3. Create Recipe
    const newRecipe = new Recipe({
      dishName: { en: "Erode Thanni Kulambu", ta: "ஈரோடு தண்ணீர் குழம்பு" },
      slug: "erode-thanni-kulambu",
      description: {
        en: "A traditional, rustic Country Chicken (Nattu Kozhi) gravy from Erode made entirely without tomatoes, giving it a unique, watery, and highly flavorful consistency.",
        ta: "ஈரோடு மாவட்டத்தின் பிரபலமான தக்காளி சேர்க்காத நாட்டுக்கோழி தண்ணீர் குழம்பு. இது நீர் போன்று மெலிதாகவும், மிகவும் சுவையாகவும் இருக்கும்."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 20,
      cookingTime: 30,
      totalTime: 50,
      servings: 4,
      difficulty: "medium",
      source: "youtube",
      tags: ["non-veg", "chicken", "nattu-kozhi", "erode", "kongu", "thanni-kulambu", "no-tomato"],
      createdBy: user._id,
      isPublic: true,
      isApproved: true,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "masala",
          title: { en: "Dry Masala Powder", ta: "மசாலாப் பொடி" },
          steps: [
            {
              step: 1,
              description: {
                en: "Heat a dry pan. Dry-roast the coriander seeds, cumin, chana dal, urad dal, raw rice, black pepper, cinnamon, cloves, and fennel seeds until fragrant.",
                ta: "ஒரு பாத்திரத்தை சூடாக்கி கொத்தமல்லி, சீரகம், கடலை பருப்பு, உளுத்தம் பருப்பு, பச்சரிசி, மிளகு, பட்டை, கிராம்பு, சோம்பு ஆகியவற்றை வறுக்கவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "In the same pan, dry roast the dry red chillies and curry leaves. Let all ingredients cool and grind them into a fine powder.",
                ta: "அதே பாத்திரத்தில் காய்ந்த மிளகாய் மற்றும் கருவேப்பிலை சேர்த்து வறுக்கவும். ஆறியதும் நன்கு பொடியாக அரைத்துக்கொள்ளவும்."
              }
            }
          ]
        },
        {
          type: "preparation",
          title: { en: "Wet Masala Paste", ta: "அரைத்த மசாலா" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat a little oil, add 150g of small onions, and sauté until translucent. Add grated coconut and sauté well to remove raw moisture.",
                ta: "சிறிது எண்ணெயில் 150 கிராம் சின்ன வெங்காயம் சேர்த்து வதக்கவும். துருவிய தேங்காய் சேர்த்து வதக்கவும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Add the prepared Dry Masala Powder, mix well, and turn off the heat. Grind this mixture into a semi-fine paste.",
                ta: "அரைத்து வைத்துள்ள மசாலாப் பொடியை சேர்த்து நன்கு கலந்து அடுப்பை அணைக்கவும். இதை லேசான பதத்தில் அரைத்துக் கொள்ளவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Cooking Thanni Kulambu", ta: "குழம்பு தயாரித்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Heat 3-4 tbsp of peanut oil in a large vessel. Toss in a handful of whole small onions, broken red chillies, and curry leaves. Sauté well.",
                ta: "ஒரு பெரிய பாத்திரத்தில் 3-4 தேக்கரண்டி கடலை எண்ணெய் ஊற்றி சூடாக்கவும். முழு சின்ன வெங்காயம், காய்ந்த மிளகாய், கருவேப்பிலை சேர்த்து வதக்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Add the cleaned Nattu Kozhi (country chicken) pieces. Sauté thoroughly in the oil so the meat firms up.",
                ta: "சுத்தம் செய்த நாட்டுக்கோழி துண்டுகளை சேர்க்கவும். எண்ணெயில் நன்கு வதக்கவும்."
              }
            },
            {
              step: 7,
              description: {
                en: "Add turmeric powder, crystal salt, and the ground Wet Masala Paste. Mix everything so the meat is coated.",
                ta: "மஞ்சள் தூள், கல் உப்பு மற்றும் அரைத்த மசாலா விழுது சேர்த்து கறியுடன் நன்கு கலக்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Pour in a generous amount of water for a thin, soupy consistency. Boil vigorously for 15-20 minutes until the chicken is tender.",
                ta: "அதிக அளவு தண்ணீர் சேர்த்து, 15-20 நிமிடம் நாட்டுக்கோழி நன்கு வேகும் வரை கொதிக்க விடவும்."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "Serving", ta: "பரிமாறுதல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Once oil floats to the top and meat is tender, serve hot poured generously over white rice, idli, dosa, or parotta.",
                ta: "எண்ணெய் பிரிந்து வந்ததும் சூடாக சாதம், இட்லி, தோசை அல்லது பரோட்டாவுடன் பரிமாறவும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
