import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Country Chicken", ta: "நாட்டுக்கோழி", quantity: "4", unit: "kg" },
  { name: "Gingelly Oil", ta: "நல்லெண்ணெய்", quantity: "200", unit: "ml" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "2", unit: "tsp" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "1", unit: "kg" },
  { name: "Ginger Garlic Paste", ta: "இஞ்சி பூண்டு விழுது", quantity: "100", unit: "g" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "50", unit: "nos" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "2", unit: "tsp" },
  { name: "Crystal Salt", ta: "கல் உப்பு", quantity: "40", unit: "g" },
  { name: "Water", ta: "தண்ணீர்", quantity: "as needed", unit: "" }
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
      dishName: { en: "Erode Nallampatti Kozhi Varuval", ta: "ஈரோடு நல்லாம்பட்டி கோழி வறுவல்" },
      slug: "erode-nallampatti-kozhi-varuval",
      description: {
        en: "A signature country chicken dry roast from the town of Nallampatti in Kongu Nadu, known for its absolute simplicity and fiery red color derived purely from deseeded dry chillies.",
        ta: "கொங்கு நாட்டின் நல்லாம்பட்டி கிராமத்தின் புகழ்பெற்ற நாட்டுக்கோழி வறுவல். மிகவும் குறைவான பொருட்களை கொண்டு செய்யப்படும் தனித்துவமான சுவை."
      },
      speciality: {
        en: "What Makes Nallampatti Chicken So Special?\n\nJust like Pallipalayam and Chinthamani, the town of Nallampatti in the Kongu region has its own iconic, signature way of preparing country chicken:\n\n* Ultimate Simplicity: Uses an absolute maximum of 4 to 5 main ingredients. No fancy spice blends, no coriander powder, no garam masala, and absolutely no tomatoes.\n* Foolproof Cooking: The process is so straightforward that even an absolute beginner can perfectly recreate it.\n* The Local Combo: Famously savored with steaming Pacharisi Satham (Raw white rice). The taste is so addictive that some customers can easily polish off an entire kilo by themselves!\n* The Chili Secret: Using 50 dry red chillies sounds terrifying, but completely stripping out every single seed infuses the oil with a rich red color and an incredible smoky flavor without making the dish unbearably spicy.",
        ta: "நல்லாம்பட்டி சிக்கனின் சிறப்பம்சங்கள்:\n\n* எளிமையான சமையல்: 4 முதல் 5 அடிப்படைப் பொருட்களை மட்டுமே கொண்டு சமைக்கப்படும் உணவு. மசாலா பொடிகள் மற்றும் தக்காளி அறவே சேர்க்கப்படுவதில்லை.\n* எவரும் சமைக்கலாம்: சமைக்கத் தெரியாதவர்கள் கூட மிக எளிதாக, சரியான சுவையில் இதை தயாரிக்க முடியும்.\n* பச்சரிசி சாதம்: சுடச்சுட பச்சரிசி சாதத்துடன் சேர்த்து உண்பது இதன் தனிச்சிறப்பு.\n* மிளகாயின் ரகசியம்: 50 காய்ந்த மிளகாய் சேர்த்தாலும், அதன் விதைகளை முழுமையாக நீக்கிவிடுவதால், குழம்பிற்கு ஆழமான சிவப்பு நிறமும் புகையான சுவையும் கிடைக்கும், ஆனால் காரம் அதிகமாக இருக்காது."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 20,
      cookingTime: 60,
      totalTime: 80,
      servings: 6,
      difficulty: "easy",
      source: "youtube",
      tags: ["non-veg", "chicken", "nattu-kozhi", "varuval", "erode", "kongu", "nallampatti", "spicy"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "preparation",
          title: { en: "The Base Sauté", ta: "அடிப்படை வதக்குதல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Heat a large, heavy-bottomed kadai or clay pot and pour in the 200 ml of gingelly oil.",
                ta: "ஒரு பெரிய மண்சட்டி அல்லது கடாயை சூடாக்கி 200 மி.லி நல்லெண்ணெய் ஊற்றவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Let the mustard seeds splutter, then drop in the 1 Kg of peeled, whole small onions. Sauté them continuously in the oil until they turn a deep golden brown.",
                ta: "கடுகு சேர்த்து வெடிக்க விடவும். பின் 1 கிலோ முழு சின்ன வெங்காயம் சேர்த்து பொன்னிறமாகும் வரை நன்கு வதக்கவும்."
              }
            },
            {
              step: 3,
              description: {
                en: "Toss in the fresh curry leaves. Add the ginger-garlic paste to the hot oil and sauté vigorously until the raw smell completely disappears.",
                ta: "கருவேப்பிலை மற்றும் இஞ்சி-பூண்டு விழுது சேர்த்து பச்சை வாசனை போகும் வரை நன்கு வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Searing the Chicken", ta: "சிக்கனை சமைத்தல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Add the small-cut country chicken pieces directly into the pan.",
                ta: "சிறிய துண்டுகளாக நறுக்கிய நாட்டுக்கோழியை சேர்க்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Add the deseeded dry red chillies, turmeric powder, and salt.",
                ta: "விதை நீக்கிய காய்ந்த மிளகாய், மஞ்சள் தூள் மற்றும் உப்பு சேர்க்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Mix everything thoroughly. Sauté the chicken in the oil and spices until the meat changes color, shrinks slightly, and becomes firm.",
                ta: "அனைத்தையும் நன்கு கலந்து, கறி நிறம் மாறி சற்று சுருண்டு வரும் வரை எண்ணெயிலும் மசாலாவிலும் நன்கு வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Slow Cooking", ta: "மெதுவாக வேகவைத்தல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "Pour in enough water to allow the country chicken to cook through. (Country chicken requires more water and time to tenderize compared to broiler chicken).",
                ta: "நாட்டுக்கோழி நன்கு வேக தேவையான அளவு தண்ணீர் சேர்க்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Cover the pan and let it cook vigorously on a medium-high flame. Stir occasionally so the ginger-garlic paste doesn't stick to the bottom.",
                ta: "கடாயை மூடி போட்டு மிதமான தீயில் வேகவிடவும். இஞ்சி-பூண்டு விழுது அடிபிடிக்காமல் இருக்க அவ்வப்போது கிளறி விடவும்."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "The Final 'Varuval' (Roast)", ta: "இறுதி வறுவல் நிலை" },
          steps: [
            {
              step: 9,
              description: {
                en: "Continue to cook until the chicken is completely tender and the water entirely evaporates.",
                ta: "கறி முழுமையாக வெந்து தண்ணீர் முழுவதும் வற்றும் வரை தொடர்ந்து சமைக்கவும்."
              }
            },
            {
              step: 10,
              description: {
                en: "The dish is done when it reaches a thick, dry consistency. The whole onions and ginger-garlic paste will have broken down to form a tight, spicy coating around the chicken, and the gingelly oil will start separating at the edges.",
                ta: "வெங்காயம் மற்றும் இஞ்சி-பூண்டு விழுது முழுமையாக கரைந்து சிக்கனின் மேல் சுவையான மசாலாவாக படிந்திருக்கும். எண்ணெய் பிரிந்து வரத் தொடங்கும்."
              }
            },
            {
              step: 11,
              description: {
                en: "Turn off the heat. Drizzle a final tablespoon of raw, cold-pressed gingelly oil over the top for aroma, and garnish with fresh curry leaves.",
                ta: "அடுப்பை அணைத்துவிட்டு, சிறிது பச்சை நல்லெண்ணெய் ஊற்றி, கருவேப்பிலை தூவி பரிமாறவும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Nallampatti Kozhi Varuval recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
