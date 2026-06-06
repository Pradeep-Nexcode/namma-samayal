import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Garlic", ta: "பூண்டு", quantity: "50", unit: "g" },
  { name: "Cinnamon", ta: "பட்டை", quantity: "2", unit: "small pieces" },
  { name: "Cloves", ta: "கிராம்பு", quantity: "2", unit: "nos" },
  { name: "Cumin Seeds", ta: "சீரகம்", quantity: "2", unit: "tsp" },
  { name: "Black Pepper", ta: "மிளகு", quantity: "1/2", unit: "tsp" },
  { name: "Fried Gram", ta: "பொட்டுக்கடலை", quantity: "1", unit: "tsp" },
  { name: "Coriander Powder", ta: "கொத்தமல்லி தூள்", quantity: "50", unit: "g" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "3-4", unit: "tbsp" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "sprig" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "100", unit: "g" },
  { name: "Bitter Gourd", ta: "பாகற்காய்", quantity: "3", unit: "nos" },
  { name: "Tomatoes", ta: "தக்காளி", quantity: "2", unit: "nos" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { name: "Tamarind", ta: "புளி", quantity: "2", unit: "lemon-sized balls" },
  { name: "Salt", ta: "உப்பு", quantity: "to taste", unit: "" }
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
      dishName: { en: "Erode Selavu Paavakkai Puli Kuzhambu", ta: "ஈரோடு செலவு பாகற்காய் புளி குழம்பு" },
      slug: "erode-selavu-paavakkai-puli-kuzhambu",
      description: {
        en: "A traditional Kongu-style gravy where 'Selavu' refers to the freshly ground, rustic spice blend that gives the gravy its signature aroma and helps perfectly balance the bitterness of the bitter gourd.",
        ta: "கொங்கு நாட்டு பாரம்பரிய செலவு பாகற்காய் புளி குழம்பு. செலவு என்று அழைக்கப்படும் வறுத்து அரைத்த மசாலாவுடன் பாகற்காயின் கசப்பு தெரியாமல் சுவையாக செய்யப்படும் உணவு."
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
      tags: ["veg", "gravy", "bitter-gourd", "paavakkai", "puli-kuzhambu", "erode", "kongu", "selavu"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "masala",
          title: { en: "Preparing the 'Selavu' (Fresh Masala)", ta: "மசாலா தயார் செய்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "In a mixer jar, add the garlic, cinnamon, cloves, cumin seeds, black pepper, fried gram, and coriander powder.",
                ta: "ஒரு மிக்ஸி ஜாரில் பூண்டு, பட்டை, கிராம்பு, சீரகம், மிளகு, பொட்டுக்கடலை மற்றும் கொத்தமல்லி தூள் சேர்க்கவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Add a little water and grind it into a fine, smooth paste. Set this freshly ground selavu aside.",
                ta: "சிறிது தண்ணீர் சேர்த்து நன்கு மைய அரைத்துக் கொள்ளவும். இந்த செலவு மசாலாவை தனியாக வைக்கவும்."
              }
            }
          ]
        },
        {
          type: "preparation",
          title: { en: "Tempering and Sautéing the Base", ta: "தாளித்து வதக்குதல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat a heavy-bottomed pan or clay pot (Manchatti) and pour in the groundnut oil.",
                ta: "ஒரு மண்சட்டியை சூடாக்கி கடலை எண்ணெய் ஊற்றவும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Once the oil is hot, add the mustard seeds and let them splutter. Add the curry leaves.",
                ta: "எண்ணெய் காய்ந்ததும் கடுகு சேர்த்து வெடிக்க விடவும். பின் கருவேப்பிலை சேர்க்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Add the 100g of small onions and sauté them well until they turn translucent.",
                ta: "100 கிராம் சின்ன வெங்காயம் சேர்த்து பொன்னிறமாகும் வரை வதக்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Add the chopped tomatoes. Add crystal salt and turmeric powder at this stage. Sauté until the tomatoes turn soft and mushy.",
                ta: "நறுக்கிய தக்காளி, கல் உப்பு மற்றும் மஞ்சள் தூள் சேர்த்து தக்காளி நன்கு மசியும் வரை வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Cooking the Bitter Gourd", ta: "பாகற்காயை சமைத்தல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "Add the sliced bitter gourd (Paavakkai) pieces to the pan.",
                ta: "நறுக்கிய பாகற்காய் துண்டுகளை சேர்க்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Sauté the bitter gourd well in the oil and onion-tomato mixture for a few minutes. Roasting it slightly in the oil helps reduce its sharp bitterness.",
                ta: "பாகற்காயை எண்ணெயிலும் வெங்காயம்-தக்காளி கலவையிலும் நன்கு வதக்கவும். எண்ணெயில் வதக்குவதால் கசப்பு தன்மை குறையும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Building the Kuzhambu", ta: "குழம்பு கொதிக்க வைத்தல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "The Secret Step: Take your freshly ground selavu masala paste, add a little water to it in a bowl, and dilute it. Pour this diluted masala into the pan.",
                ta: "ரகசிய குறிப்பு: அரைத்து வைத்துள்ள செலவு மசாலாவில் சிறிது தண்ணீர் சேர்த்து கரைத்து குழம்பில் ஊற்றவும். இது மசாலா கட்டி படாமல் இருக்க உதவும்."
              }
            },
            {
              step: 10,
              description: {
                en: "Mix everything well so the bitter gourd is coated in the masala. Let it cook for 2-3 minutes.",
                ta: "பாகற்காயில் மசாலா நன்கு படியும் வரை கலந்து 2-3 நிமிடங்கள் கொதிக்க விடவும்."
              }
            },
            {
              step: 11,
              description: {
                en: "Pour in the prepared tamarind extract. The tartness of the tamarind completely neutralizes the bitterness of the Paavakkai.",
                ta: "புளித்தண்ணீர் சேர்க்கவும். புளியின் புளிப்பு பாகற்காயின் கசப்பை சமன் செய்யும்."
              }
            },
            {
              step: 12,
              description: {
                en: "Add extra water to adjust the consistency. Keep it slightly watery at this stage.",
                ta: "தேவையான அளவு தண்ணீர் சேர்க்கவும். இந்த நிலையில் குழம்பு சற்று தண்ணியாக இருக்க வேண்டும்."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "Boiling to Perfection", ta: "இறுதி நிலை" },
          steps: [
            {
              step: 13,
              description: {
                en: "Cover the pan and let the gravy boil vigorously on a medium flame.",
                ta: "சட்டியை மூடி போட்டு மிதமான தீயில் நன்கு கொதிக்க விடவும்."
              }
            },
            {
              step: 14,
              description: {
                en: "Cook until the bitter gourd becomes completely tender, the raw smell of the tamarind and freshly ground spices disappears, and the oil floats to the surface.",
                ta: "பாகற்காய் நன்கு வெந்து, புளி மற்றும் மசாலாவின் பச்சை வாசனை நீங்கி எண்ணெய் பிரிந்து வரும் வரை கொதிக்க விடவும்."
              }
            },
            {
              step: 15,
              description: {
                en: "Because we added a teaspoon of fried gram (pottukadalai) in the masala, the watery gravy will naturally thicken into a rich, luscious consistency as it boils.",
                ta: "மசாலாவில் பொட்டுக்கடலை சேர்த்துள்ளதால், குழம்பு கொதிக்கும் போது இயற்கையாகவே கெட்டியான பதத்திற்கு வரும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Paavakkai Kuzhambu recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
