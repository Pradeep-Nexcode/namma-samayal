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
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "1", unit: "kg" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "30-35", unit: "nos" },
  { name: "Coconut", ta: "தேங்காய்", quantity: "2", unit: "whole" },
  { name: "Ginger Garlic Paste", ta: "இஞ்சி பூண்டு விழுது", quantity: "1", unit: "ladle" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "2", unit: "handfuls" },
  { name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "generous amount", unit: "" }
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
      dishName: { en: "Erode Pallipalayam Chicken (TVS)", ta: "ஈரோடு பள்ளிபாளையம் சிக்கன் (TVS)" },
      slug: "erode-pallipalayam-chicken-tvs",
      description: {
        en: "A traditional Kongu Nadu recipe that uses a lot of small onions and dry red chillies to create a rich, spicy coating for the country chicken.",
        ta: "சின்ன வெங்காயம் மற்றும் காய்ந்த மிளகாய் சேர்த்து செய்யப்படும் பாரம்பரிய கொங்கு நாட்டு பள்ளிபாளையம் சிக்கன்."
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
      servings: 10,
      difficulty: "medium",
      source: "youtube",
      tags: ["non-veg", "chicken", "nattu-kozhi", "erode", "kongu", "pallipalayam", "spicy"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false, // Set to false as requested
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "preparation",
          title: { en: "The Base", ta: "அடிப்படை தயார் செய்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Heat a large, heavy-bottomed kadai and pour in a generous amount of groundnut oil.",
                ta: "ஒரு பெரிய கடாயை சூடாக்கி, தாராளமாக கடலை எண்ணெய் ஊற்றவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Once the oil is hot, add the 1 Kg of finely chopped small onions. Sauté them continuously until they turn soft, translucent, and glass-like (kannadi padham).",
                ta: "எண்ணெய் சூடானதும், நறுக்கிய 1 கிலோ சின்ன வெங்காயத்தை சேர்க்கவும். வெங்காயம் கண்ணாடி பதம் வரும் வரை நன்கு வதக்கவும்."
              }
            },
            {
              step: 3,
              description: {
                en: "Add the curry leaves and sauté briefly. Then add the deseeded dry red chillies and sauté until they infuse their heat and color into the oil.",
                ta: "கருவேப்பிலை சேர்த்து லேசாக வதக்கவும். பின் விதை நீக்கிய காய்ந்த மிளகாயை சேர்த்து, அதன் காரமும் நிறமும் எண்ணெயில் இறங்கும் வரை வதக்கவும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Add the ginger-garlic paste and sauté well until the raw aroma completely disappears.",
                ta: "இஞ்சி-பூண்டு விழுது சேர்த்து பச்சை வாசனை போகும் வரை நன்கு வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Cooking the Chicken", ta: "சிக்கனை சமைத்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Add the small-cut pieces of country chicken directly into the pan.",
                ta: "சிறிய துண்டுகளாக நறுக்கிய நாட்டுக்கோழியை கடாயில் சேர்க்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Add the turmeric powder and crystal salt. Give everything a thorough mix.",
                ta: "மஞ்சள் தூள் மற்றும் கல் உப்பு சேர்த்து அனைத்தையும் நன்கு கலக்கவும்."
              }
            },
            {
              step: 7,
              description: {
                en: "Keep cooking and stirring the chicken in the oil and spices until the meat firms up, changes color, and shrinks slightly (urundu varum).",
                ta: "கறி நிறம் மாறி சற்று சுருண்டு வரும் வரை எண்ணெயிலும் மசாலாவிலும் நன்கு வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Adding Coconut & Simmering", ta: "தேங்காய் சேர்த்து வேகவைத்தல்" },
          steps: [
            {
              step: 8,
              description: {
                en: "Once the chicken has firmed up, pour in enough water to allow the country chicken to cook through.",
                ta: "கறி வதங்கியதும், நாட்டுக்கோழி நன்கு வேக தேவையான அளவு தண்ணீர் சேர்க்கவும்."
              }
            },
            {
              step: 9,
              description: {
                en: "Immediately add the fresh coconut slices. Adding the coconut at this stage allows it to boil along with the meat, absorbing all the rich spices and chicken flavor.",
                ta: "உடனடியாக நறுக்கிய தேங்காய் பற்களை சேர்க்கவும். இதனால் தேங்காய் கறியோடு சேர்ந்து வெந்து, மசாலா மற்றும் கறியின் சுவையை முழுமையாக உறிஞ்சிக் கொள்ளும்."
              }
            },
            {
              step: 10,
              description: {
                en: "Cover the pan with a lid and let it cook for about 20 to 25 minutes. Stir occasionally.",
                ta: "கடாயை மூடி போட்டு சுமார் 20 முதல் 25 நிமிடங்கள் மிதமான தீயில் வேகவிடவும். அவ்வப்போது கிளறி விடவும்."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "The Final Roast", ta: "இறுதி நிலை" },
          steps: [
            {
              step: 11,
              description: {
                en: "Continue to cook until the country chicken is completely tender and soft.",
                ta: "நாட்டுக்கோழி முழுமையாக வெந்து மென்மையாகும் வரை தொடர்ந்து சமைக்கவும்."
              }
            },
            {
              step: 12,
              description: {
                en: "Let the water evaporate until the dish reaches a thick, semi-dry consistency. By this time, the 1 Kg of small onions will have completely dissolved, forming a thick, flavorful gravy-like coating over the chicken and coconut slices.",
                ta: "தண்ணீர் முழுவதும் வற்றி கெட்டியான பதத்திற்கு வரும் வரை காத்திருக்கவும். இந்த நேரத்தில் சின்ன வெங்காயம் முழுமையாக கரைந்து சிக்கன் மற்றும் தேங்காயின் மேல் சுவையான கிரேவி போன்று படிந்திருக்கும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Pallipalayam Chicken recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
