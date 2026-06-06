import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Gingelly Oil", ta: "நல்லெண்ணெய்", quantity: "generous amount", unit: "" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "150-200", unit: "g" },
  { name: "Country Chicken", ta: "நாட்டுக்கோழி", quantity: "1", unit: "kg" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "10-15", unit: "nos" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1.5", unit: "tsp" },
  { name: "Salt", ta: "உப்பு", quantity: "to taste", unit: "" },
  { name: "Hot Water", ta: "சுடு தண்ணீர்", quantity: "as required", unit: "" },
  { name: "Coriander Leaves", ta: "கொத்தமல்லி இலை", quantity: "1", unit: "handful" }
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
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let ingredient = await Ingredient.findOne({ slug });
      
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
      dishName: { en: "Erode Chinthamani Chicken", ta: "ஈரோடு சிந்தாமணி சிக்கன்" },
      slug: "erode-chinthamani-chicken",
      description: {
        en: "A traditional Erode Chinthamani Chicken recipe made entirely without tomatoes, ginger-garlic paste, or ground masala powders. It relies entirely on dry red chillies and small onions for its unique flavor.",
        ta: "ஈரோட்டின் பாரம்பரிய சிந்தாமணி சிக்கன். தக்காளி, இஞ்சி-பூண்டு விழுது, மற்றும் மசாலாப் பொடிகள் ஏதுமின்றி, காய்ந்த மிளகாய் மற்றும் சின்ன வெங்காயத்தின் சுவையில் மட்டுமே தயாராகும் ஒரு தனித்துவமான உணவு."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 15,
      cookingTime: 90,
      totalTime: 105,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      tags: ["non-veg", "chicken", "nattu-kozhi", "erode", "kongu", "chinthamani", "dry-roast"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false, // Explicitly set to false as requested
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "tempering",
          title: { en: "Tempering", ta: "தாளித்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Heat a traditional clay pot (Manchatti) and add a generous amount of cold-pressed gingelly oil (Nallennai).",
                ta: "ஒரு மண்சட்டியை சூடாக்கி, தேவையான அளவு சுத்தமான நல்லெண்ணெய் ஊற்றவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Add the mustard seeds and let them splutter.",
                ta: "கடுகு சேர்த்து வெடிக்க விடவும்."
              }
            },
            {
              step: 3,
              description: {
                en: "Add the small onions and sauté them thoroughly until they turn a deep golden brown. This forms the base of the dish.",
                ta: "சின்ன வெங்காயத்தை சேர்த்து பொன்னிறமாகும் வரை நன்கு வதக்கவும். இதுவே உணவிற்கு அடிப்படை சுவையை தரும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Cooking the Chicken", ta: "சிக்கனை சமைத்தல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Add the small pieces of country chicken directly to the pan. Mix well and let the chicken cook in the oil until it changes color and starts releasing its own natural juices.",
                ta: "சிறிய துண்டுகளாக நறுக்கிய நாட்டுக்கோழியை சேர்க்கவும். கறி நிறம் மாறி தண்ணீர் விடும் வரை எண்ணெயிலேயே நன்கு வதக்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Toss in the fresh curry leaves, the deseeded dry red chillies, turmeric powder, and salt to taste. Give everything a thorough mix.",
                ta: "கருவேப்பிலை, விதை நீக்கப்பட்ட காய்ந்த மிளகாய், மஞ்சள் தூள் மற்றும் தேவையான அளவு உப்பு சேர்க்கவும். அனைத்தையும் நன்கு கலக்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Let the chicken cook and reduce in its own juices for a while until the liquid starts to dry up.",
                ta: "கறியிலிருந்து வெளிவரும் தண்ணீரிலேயே சிறிது நேரம் வேகவிடவும்."
              }
            },
            {
              step: 7,
              description: {
                en: "Once the natural juices have reduced, pour in hot/boiling water. Never add cold water at this stage, as it will make the country chicken tough.",
                ta: "தண்ணீர் வற்றியதும், சுடு தண்ணீர் சேர்க்கவும். (குளிர்ந்த நீரை பயன்படுத்தக் கூடாது, கறி கடினமாகிவிடும்)."
              }
            },
            {
              step: 8,
              description: {
                en: "Allow the chicken to cook on a low, slow flame. Since it is country chicken, it can take anywhere from 1.5 to 2 hours to become completely tender. Let it cook until all the water has evaporated and the dish turns into a thick, dry roast.",
                ta: "மிதமான தீயில் கறியை வேகவிடவும். நாட்டுக்கோழி என்பதால் வேக 1.5 முதல் 2 மணி நேரம் ஆகலாம். தண்ணீர் முழுவதும் வற்றி ட்ரை ரோஸ்ட் ஆகும் வரை சமைக்கவும்."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "Final Touch", ta: "இறுதி நிலை" },
          steps: [
            {
              step: 9,
              description: {
                en: "Once the chicken is fully roasted and the oil separates, turn off the heat. Drizzle a tiny bit of raw gingelly oil over the top for an extra punch of aroma, and garnish with fresh coriander leaves.",
                ta: "கறி நன்கு வெந்து எண்ணெய் பிரிந்து வந்ததும் அடுப்பை அணைக்கவும். சிறிது பச்சை நல்லெண்ணெய் மற்றும் கொத்தமல்லி இலை தூவி பரிமாறவும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Chinthamani Chicken recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
