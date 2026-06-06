import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Tamarind", ta: "புளி", quantity: "1", unit: "large lemon-sized ball" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "10-15", unit: "nos" },
  { name: "Country Tomatoes", ta: "நாட்டுத் தக்காளி", quantity: "1-2", unit: "nos" },
  { name: "Garlic", ta: "பூண்டு", quantity: "4-5", unit: "cloves" },
  { name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "2-3", unit: "nos" },
  { name: "Cumin Seeds", ta: "சீரகம்", quantity: "1", unit: "tsp" },
  { name: "Black Pepper", ta: "மிளகு", quantity: "1/2", unit: "tsp" },
  { name: "Coriander Leaves", ta: "கொத்தமல்லி இலை", quantity: "1", unit: "handful" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "sprig" },
  { name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { name: "Jaggery", ta: "வெல்லம்", quantity: "1", unit: "pinch" }
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
      dishName: { en: "Kongu-Style Pachai Puli Rasam", ta: "கொங்கு நாட்டு பச்சை புளி ரசம்" },
      slug: "kongu-style-pachai-puli-rasam",
      description: {
        en: "An incredibly unique South Indian recipe that requires absolutely no cooking. Made entirely by mixing raw, fresh ingredients by hand in a mud pot, it serves as a powerful digestive aid.",
        ta: "கொங்கு நாட்டில் அடுப்பில் சமைக்காமல், பச்சை பொருட்களை கைகளால் பிசைந்து செய்யப்படும் மிகவும் சுவையான மற்றும் செரிமானத்திற்கு உதவும் ஒரு தனித்துவமான ரசம்."
      },
      speciality: {
        en: "The Story: A Kongu Nadu Staple\n\nIf you go to the Kongu region, you won't find a single home that doesn't make Pachai Puli Rasam. Here is what makes this rustic dish so incredibly special:\n\n* The Zero-Fire Recipe: This is arguably one of the most unique recipes in South Indian cuisine because it requires absolutely no cooking! There is no oil, no tempering, and no boiling on a stove.\n* Childhood Nostalgia: Grandmothers in the villages of Erode and Coimbatore would quickly mix this up in a mud pot for a fast, comforting lunch.\n* The Ultimate Digester: Because it uses raw shallots, garlic, and freshly crushed cumin and pepper, it acts as a powerful digestive aid. It is the mandatory, perfect pairing after eating heavy, spicy, oil-rich meats like Nallampatti Chicken or Pallipalayam Chicken!",
        ta: "பச்சை புளி ரசத்தின் சிறப்பம்சங்கள்:\n\n* அடுப்பில்லா சமையல்: இந்த ரசத்தின் மிகப் பெரிய சிறப்பு, இதை அடுப்பில் கொதிக்க வைக்கவோ, தாளிக்கவோ தேவையில்லை! முற்றிலும் கைகளாலேயே பிசைந்து செய்யப்படும் உணவு.\n* இளமை நினைவுகள்: ஈரோடு, கோயம்புத்தூர் கிராமங்களில் பாட்டிகள் சட்டென ஒரு மண்சட்டியில் கைகளால் பிசைந்து செய்யும் இந்த ரசம், பலருக்கும் தங்கள் குழந்தை பருவ நினைவுகளை மீட்டித்தரும்.\n* சிறந்த செரிமானம்: இதில் சேர்க்கப்படும் பச்சை சின்ன வெங்காயம், பூண்டு, சீரகம் மற்றும் மிளகு செரிமானத்திற்கு மிகவும் நல்லது. நல்லாம்பட்டி சிக்கன், பள்ளிபாளையம் சிக்கன் போன்ற காரமான மற்றும் கொழுப்பு நிறைந்த உணவுகளை சாப்பிட்ட பின் இந்த ரசம் குடிப்பது வழக்கம்."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 10,
      cookingTime: 0,
      totalTime: 10,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      tags: ["veg", "rasam", "no-cook", "raw", "tamarind", "puli", "erode", "kongu", "digestive"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "preparation",
          title: { en: "The Tamarind Extract", ta: "புளி கரைசல் தயார் செய்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Soak the tamarind in about 2 to 3 cups of water for 30 minutes.",
                ta: "புளியை 2-3 டம்ளர் தண்ணீரில் 30 நிமிடம் ஊறவைக்கவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Squeeze it well using your hands and extract the tangy juice. Discard the pulp and fibers. Pour this tamarind water into a wide vessel (preferably a traditional mud pot).",
                ta: "புளியை கைகளால் நன்கு கரைத்து, சக்கையை நீக்கிவிட்டு புளித்தண்ணீரை ஒரு அகலமான பாத்திரத்தில் (மண்சட்டியில்) ஊற்றவும்."
              }
            }
          ]
        },
        {
          type: "preparation",
          title: { en: "Hand-Mashing the Base", ta: "கைகளால் பிசைதல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Into the tamarind water, drop the ripe tomatoes. Use your hands to completely crush and mash the tomatoes directly into the liquid until only the skin is left.",
                ta: "புளித்தண்ணீரில் பழுத்த தக்காளியை போட்டு கைகளாலேயே நன்கு மசிக்கவும். தக்காளியின் தோல் மட்டும் மிஞ்சும் வரை பிசைய வேண்டும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Add the crystal salt. Mashing the salt and tomatoes together by hand is the traditional secret to pulling out the deep flavors.",
                ta: "உடன் கல் உப்பு சேர்த்து பிசையவும். கல் உப்பு மற்றும் தக்காளியை கைகளால் பிசைவதே இதன் உண்மையான சுவைக்கு காரணம்."
              }
            }
          ]
        },
        {
          type: "preparation",
          title: { en: "Adding the Aromatics", ta: "மசாலா சேர்த்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Toss in the finely chopped small onions, crushed garlic, and crushed green chillies.",
                ta: "பொடியாக நறுக்கிய சின்ன வெங்காயம், தட்டிய பூண்டு மற்றும் பச்சை மிளகாய் சேர்க்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Add the coarsely pounded cumin seeds and black pepper. (Chef's tip: Do not use fine store-bought powders; crush whole seeds fresh for the authentic aroma).",
                ta: "ஒன்றிரண்டாக இடித்த சீரகம் மற்றும் மிளகு சேர்க்கவும். (கடைகளில் விற்கும் நைசான பொடிகளை பயன்படுத்த வேண்டாம், புதிதாக இடித்து சேர்ப்பதே சிறந்தது)."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "The Final Touch", ta: "இறுதி நிலை" },
          steps: [
            {
              step: 7,
              description: {
                en: "Add the torn curry leaves and a generous handful of fresh coriander leaves.",
                ta: "கருவேப்பிலை மற்றும் நறுக்கிய கொத்தமல்லி இலைகளை சேர்க்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Give the entire rasam one final, thorough mix with your hands so all the raw, pungent oils from the onions, garlic, and herbs infuse into the tangy tamarind water.",
                ta: "அனைத்தையும் கைகளால் மீண்டும் ஒருமுறை நன்கு பிசைந்து விடவும். இதனால் வெங்காயம், பூண்டு மற்றும் மூலிகைகளின் சாறு புளித்தண்ணீரில் முழுமையாக இறங்கும்."
              }
            },
            {
              step: 9,
              description: {
                en: "Taste the rasam and adjust the water or salt if needed. If it is too sour, drop in a tiny pinch of jaggery to balance it.",
                ta: "சுவை பார்த்து தேவைப்பட்டால் உப்பு அல்லது தண்ணீர் சேர்க்கவும். அதிக புளிப்பாக இருந்தால் ஒரு சிட்டிகை வெல்லம் சேர்க்கலாம்."
              }
            },
            {
              step: 10,
              description: {
                en: "That’s it! No stove required. Serve this intensely flavorful, tangy, and spicy raw rasam poured over steaming hot white rice, alongside a spicy chicken or mutton roast.",
                ta: "அவ்வளவுதான்! அடுப்பு தேவையில்லை. இந்த சுவையான பச்சை புளி ரசத்தை சூடான சாதம் மற்றும் காரசாரமான சிக்கன் அல்லது மட்டன் வறுவலுடன் பரிமாறவும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Pachai Puli Rasam recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
