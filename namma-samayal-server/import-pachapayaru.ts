import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Green Moong Dal", ta: "பச்சை பயறு", quantity: "1/4", unit: "kg" },
  { name: "Parboiled Rice", ta: "புழுங்கல் அரிசி", quantity: "1", unit: "kg" },
  { name: "Water", ta: "தண்ணீர்", quantity: "2.5", unit: "Liters" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "4", unit: "ladles" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "1", unit: "handful" },
  { name: "Tomatoes", ta: "தக்காளி", quantity: "3", unit: "nos" },
  { name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "8-10", unit: "nos" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "1", unit: "tsp" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { name: "Coriander Leaves", ta: "கொத்தமல்லி இலை", quantity: "1", unit: "generous handful" },
  { name: "Salt", ta: "உப்பு", quantity: "to taste", unit: "" },
  { name: "Black Pepper", ta: "மிளகு", quantity: "1", unit: "tsp" },
  { name: "Cumin Seeds", ta: "சீரகம்", quantity: "2", unit: "tsp" },
  { name: "Garlic", ta: "பூண்டு", quantity: "5-6", unit: "cloves" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { name: "Urad Dal", ta: "உளுத்தம் பருப்பு", quantity: "1", unit: "tsp" },
  { name: "Chana Dal", ta: "கடலை பருப்பு", quantity: "1", unit: "tsp" }
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
      dishName: { en: "Pacha Payaru Satham", ta: "பச்சை பயறு சாதம்" },
      slug: "pacha-payaru-satham",
      description: {
        en: "A traditional and highly nutritious Erode recipe for Green Moong Dal Rice, straight from the Maanthoppu Virundhu restaurant.",
        ta: "ஈரோடு மாந்தோப்பு விருந்து உணவகத்தின் பாரம்பரிய பச்சை பயறு சாதம். இது மிகவும் சத்தான மற்றும் சுவையான கொங்கு நாட்டு உணவு."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 30,
      cookingTime: 30,
      totalTime: 60,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      tags: ["veg", "rice", "moong-dal", "erode", "kongu", "healthy"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "preparation",
          title: { en: "Preparing the Dal & Spices", ta: "பருப்பு மற்றும் மசாலா தயார் செய்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Dry roast the ¼ Kg of green moong dal in a pan on medium heat until it releases a good aroma and changes color slightly. Do not let it turn black.",
                ta: "கால் கிலோ பச்சை பயறை மிதமான தீயில் வாசம் வரும் வரை வறுக்கவும். கருப்பாக விடக்கூடாது."
              }
            },
            {
              step: 2,
              description: {
                en: "Once cooled, lightly crush the roasted dal to split the beans and remove the loose outer skin.",
                ta: "ஆறிய பின் லேசாக இடித்து தோலை நீக்கவும்."
              }
            },
            {
              step: 3,
              description: {
                en: "Winnow the dal to remove the loose husks. Wash it along with the 1 Kg of parboiled rice and let them soak together for 30 minutes.",
                ta: "தோலை புடைத்து நீக்கிவிட்டு, 1 கிலோ புழுங்கல் அரிசியுடன் சேர்த்து நன்கு கழுவி 30 நிமிடம் ஊறவைக்கவும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Coarsely crush the black pepper, cumin seeds, and garlic cloves into a rough paste.",
                ta: "மிளகு, சீரகம் மற்றும் பூண்டு ஆகியவற்றை ஒன்றிரண்டாக இடித்து வைத்துக்கொள்ளவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "The Sautéing Process", ta: "வதக்குதல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Heat a heavy-bottomed clay pot (Manchatti) and add 4 ladles of groundnut oil. Add mustard seeds, urad dal, and chana dal. Let the mustard splutter.",
                ta: "மண்சட்டியை சூடாக்கி கடலை எண்ணெய் ஊற்றவும். எண்ணெய் சூடானதும் கடுகு, உளுத்தம் பருப்பு, கடலை பருப்பு சேர்த்து தாளிக்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Add the small onions and sauté them until they turn translucent and slightly golden. Then add the slit green chillies, curry leaves, and chopped tomatoes. Sauté everything well.",
                ta: "சின்ன வெங்காயம் சேர்த்து பொன்னிறமாகும் வரை வதக்கவும். பின்னர் பச்சை மிளகாய், கருவேப்பிலை மற்றும் தக்காளி சேர்த்து வதக்கவும்."
              }
            },
            {
              step: 7,
              description: {
                en: "Once the tomatoes soften, add the crushed pepper-cumin-garlic paste. Sauté until the raw aroma completely disappears.",
                ta: "தக்காளி வதங்கியதும், இடித்து வைத்துள்ள மிளகு-சீரகம்-பூண்டு விழுதை சேர்த்து பச்சை வாசனை போகும் வரை வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Seasoning and Boiling", ta: "மசாலா சேர்த்து கொதிக்க வைத்தல்" },
          steps: [
            {
              step: 8,
              description: {
                en: "Add turmeric powder, chilli powder, salt to taste, and fresh coriander leaves. Mix well so the spices infuse into the oil.",
                ta: "மஞ்சள் தூள், மிளகாய் தூள், தேவையான அளவு உப்பு மற்றும் கொத்தமல்லி இலை சேர்த்து நன்கு கலக்கவும்."
              }
            },
            {
              step: 9,
              description: {
                en: "Pour in the 2.5 Liters of water. Check the salt level now—the water should taste slightly salty.",
                ta: "2.5 லிட்டர் தண்ணீர் சேர்க்கவும். இப்போது உப்பு சரிபார்க்கவும்—தண்ணீர் சற்று கரிக்க வேண்டும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Cooking the Rice", ta: "சாதம் சமைத்தல்" },
          steps: [
            {
              step: 10,
              description: {
                en: "Let the water come to a rolling boil. Drain the soaked rice and moong dal, and add them to the boiling water.",
                ta: "தண்ணீர் நன்கு கொதித்ததும், ஊறவைத்த அரிசி மற்றும் பயறை நீரை வடித்து சேர்க்கவும்."
              }
            },
            {
              step: 11,
              description: {
                en: "Cover the pot with a lid. Reduce the heat to a low simmer and let it cook undisturbed for about 15 minutes.",
                ta: "சட்டியை மூடி போட்டு மிதமான தீயில் 15 நிமிடங்கள் வேகவிடவும்."
              }
            },
            {
              step: 12,
              description: {
                en: "Once all the water is absorbed and the rice is perfectly cooked, fluffy, and separate, gently fluff it with a ladle and turn off the heat.",
                ta: "தண்ணீர் முழுவதும் வற்றி சாதம் உதிரியாக வெந்ததும், மெதுவாக கிளறி அடுப்பை அணைக்கவும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Pacha Payaru Satham recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
