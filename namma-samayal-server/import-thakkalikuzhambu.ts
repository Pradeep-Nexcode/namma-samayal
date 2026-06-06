import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "4-5", unit: "tbsp" },
  { name: "Coriander Seeds", ta: "கொத்தமல்லி விதை", quantity: "1.5", unit: "tbsp" },
  { name: "Chana Dal", ta: "கடலை பருப்பு", quantity: "1", unit: "tsp" },
  { name: "Urad Dal", ta: "உளுத்தம் பருப்பு", quantity: "1", unit: "tsp" },
  { name: "Cumin Seeds", ta: "சீரகம்", quantity: "1", unit: "tsp" },
  { name: "Black Pepper", ta: "மிளகு", quantity: "1/2", unit: "tsp" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "6-8", unit: "nos" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "20-30", unit: "nos" },
  { name: "Grated Coconut", ta: "துருவிய தேங்காய்", quantity: "1/2", unit: "cup" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "sprig" },
  { name: "Country Tomatoes", ta: "நாட்டுத் தக்காளி", quantity: "5-6", unit: "large" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { name: "Coriander Leaves", ta: "கொத்தமல்லி இலை", quantity: "1", unit: "handful" }
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
      dishName: { en: "Erode Thakkali Kuzhambu", ta: "ஈரோடு தக்காளி குழம்பு" },
      slug: "erode-thakkali-kuzhambu",
      description: {
        en: "A Kongu-style gravy that relies entirely on the natural tanginess of country tomatoes (Nattu Thakkali) and a freshly roasted spice blend, skipping store-bought masala powders completely.",
        ta: "நாட்டுத் தக்காளியின் இயற்கையான புளிப்பு மற்றும் வறுத்து அரைத்த மசாலாவுடன் செய்யப்படும் ஈரோடு தக்காளி குழம்பு. கடைகளில் விற்கும் மசாலா பொடிகள் சேர்க்காத பாரம்பரிய உணவு."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 15,
      cookingTime: 25,
      totalTime: 40,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      tags: ["veg", "gravy", "tomato", "thakkali", "erode", "kongu", "no-masala-powder"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "masala",
          title: { en: "Roasting the Spices", ta: "மசாலா வறுத்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Heat 1 teaspoon of oil in a pan on medium-low heat. Add the chana dal, urad dal, coriander seeds, cumin seeds, black pepper, and dry red chillies.",
                ta: "ஒரு கடாயில் 1 தேக்கரண்டி எண்ணெய் ஊற்றி கடலை பருப்பு, உளுத்தம் பருப்பு, கொத்தமல்லி, சீரகம், மிளகு மற்றும் காய்ந்த மிளகாய் சேர்க்கவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Roast them continuously until the dals turn a golden brown color and release a nutty aroma. (Make sure not to burn the spices, as it will make the gravy bitter).",
                ta: "பருப்பு வகைகள் பொன்னிறமாகி வாசம் வரும் வரை வறுக்கவும். (கருகிவிடாமல் கவனமாக வறுக்கவும், இல்லையெனில் குழம்பு கசந்துவிடும்)."
              }
            },
            {
              step: 3,
              description: {
                en: "Add the peeled small onions and sauté until they turn slightly translucent.",
                ta: "தோல் உரித்த சின்ன வெங்காயம் சேர்த்து லேசாக வதக்கவும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Finally, add the freshly grated coconut. Give it a quick stir for about 30 seconds to remove the raw moisture, then turn off the heat.",
                ta: "இறுதியாக துருவிய தேங்காய் சேர்த்து 30 வினாடிகள் வதக்கி அடுப்பை அணைக்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Let this entire mixture cool down completely. Transfer it to a blender, add a little water, and grind it into a smooth, fine paste. Set aside.",
                ta: "இவை நன்கு ஆறிய பின், சிறிதளவு தண்ணீர் சேர்த்து நன்கு மைய அரைத்துக் கொள்ளவும்."
              }
            }
          ]
        },
        {
          type: "preparation",
          title: { en: "Cooking the Base", ta: "அடிப்படை தயார் செய்தல்" },
          steps: [
            {
              step: 6,
              description: {
                en: "Heat a traditional clay pot (Manchatti) or a heavy-bottomed vessel and pour in the groundnut oil. Once hot, add the mustard seeds and let them splutter.",
                ta: "ஒரு மண்சட்டியில் கடலை எண்ணெய் ஊற்றி சூடாக்கவும். எண்ணெய் காய்ந்ததும் கடுகு சேர்த்து வெடிக்க விடவும்."
              }
            },
            {
              step: 7,
              description: {
                en: "Add the chopped small onions and curry leaves. Sauté them well until the onions become golden and soft.",
                ta: "நறுக்கிய சின்ன வெங்காயம் மற்றும் கருவேப்பிலை சேர்த்து பொன்னிறமாகும் வரை நன்கு வதக்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Add the finely chopped (or hand-crushed) country tomatoes to the pot.",
                ta: "நறுக்கிய அல்லது மசித்த நாட்டுத் தக்காளியை சேர்க்கவும்."
              }
            },
            {
              step: 9,
              description: {
                en: "Add the turmeric powder and crystal salt immediately. Adding salt now helps the tomatoes break down and release their juices faster.",
                ta: "உடனே மஞ்சள் தூள் மற்றும் கல் உப்பு சேர்க்கவும். உப்பு சேர்ப்பதால் தக்காளி சீக்கிரம் வதங்கும்."
              }
            },
            {
              step: 10,
              description: {
                en: "Sauté the tomatoes continuously until they completely turn into a mushy paste and the oil starts separating from the edges.",
                ta: "தக்காளி நன்கு மசிந்து ஓரத்தில் எண்ணெய் பிரியும் வரை தொடர்ந்து வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Boiling the Kuzhambu", ta: "குழம்பு கொதிக்க வைத்தல்" },
          steps: [
            {
              step: 11,
              description: {
                en: "Once the tomato base is well cooked, pour the freshly ground masala paste into the pot. Mix everything well.",
                ta: "தக்காளி நன்கு வதங்கியதும், அரைத்து வைத்துள்ள மசாலா விழுதை சேர்த்து நன்கு கலக்கவும்."
              }
            },
            {
              step: 12,
              description: {
                en: "Add water to adjust the consistency. This kuzhambu shouldn't be too watery or too thick—aim for a standard gravy consistency.",
                ta: "தேவையான அளவு தண்ணீர் சேர்க்கவும். குழம்பு அதிக தண்ணியாகவோ அல்லது அதிக கெட்டியாகவோ இல்லாமல் நடுத்தர பதத்தில் இருக்க வேண்டும்."
              }
            },
            {
              step: 13,
              description: {
                en: "Cover the pot and let the kuzhambu boil vigorously on medium heat for about 10 to 15 minutes.",
                ta: "சட்டியை மூடி போட்டு மிதமான தீயில் 10 முதல் 15 நிமிடங்கள் நன்கு கொதிக்க விடவும்."
              }
            },
            {
              step: 14,
              description: {
                en: "Allow it to cook until the raw smell of the freshly ground spices completely disappears and a layer of oil beautifully floats to the top of the gravy.",
                ta: "அரைத்த மசாலாவின் பச்சை வாசனை முழுமையாக நீங்கி குழம்பின் மேல் எண்ணெய் பிரிந்து வரும் வரை கொதிக்க விடவும்."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "Final Touch", ta: "இறுதி நிலை" },
          steps: [
            {
              step: 15,
              description: {
                en: "Turn off the heat and garnish the hot gravy with a generous handful of freshly chopped coriander leaves.",
                ta: "அடுப்பை அணைத்துவிட்டு, சிறிது நறுக்கிய கொத்தமல்லி இலைகளை தூவவும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Thakkali Kuzhambu recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
