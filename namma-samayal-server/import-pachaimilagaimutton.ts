import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Mutton", ta: "மட்டன்", quantity: "1", unit: "kg" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "50", unit: "ml" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "400", unit: "g" },
  { name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "10-12", unit: "nos" },
  { name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { name: "Crystal Salt", ta: "கல் உப்பு", quantity: "10", unit: "g" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "4", unit: "sprigs" },
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
      dishName: { en: "Erode Pachai Milagai Mutton Varuval", ta: "ஈரோடு பச்சை மிளகாய் மட்டன் வறுவல்" },
      slug: "erode-pachai-milagai-mutton-varuval",
      description: {
        en: "A foolproof Kongu-style mutton roast that completely skips tomatoes and ginger-garlic paste, relying purely on the flavor of the meat, small onions, and deseeded green chillies.",
        ta: "கொங்கு நாட்டுப் பாரம்பரிய பச்சை மிளகாய் மட்டன் வறுவல். தக்காளி மற்றும் இஞ்சி-பூண்டு விழுது சேர்க்காமல், கறி, சின்ன வெங்காயம் மற்றும் விதை நீக்கிய பச்சை மிளகாயை கொண்டு செய்யப்படும் சுவையான வறுவல்."
      },
      speciality: {
        en: "What Makes This Mutton Varuval Special?\n\nThis recipe is a gem from the Kongu region that challenges the standard way most people cook mutton:\n\n* No Masala, No Tomatoes, No Ginger-Garlic: This dish relies purely on the flavor of the meat, small onions, and green chillies. The natural juices of the mutton shine.\n* The 'Beginner's Lifesaver': If sudden guests arrive and you don't know how to cook a complex mutton gravy, this is your lifesaver. You just toss the meat, chillies, and onions into a pot and boil it—it’s foolproof!\n* The Green Chilli Secret: The secret to using 10-12 green chillies without burning your tongue is completely removing the seeds inside. If you leave the seeds in, strictly use no more than 3 or 4!",
        ta: "இந்த மட்டன் வறுவலின் சிறப்பு:\n\n* தக்காளி, இஞ்சி-பூண்டு, மசாலா இல்லை: இது கறியின் இயற்கையான சுவை, சின்ன வெங்காயம் மற்றும் பச்சை மிளகாயின் காரம் ஆகியவற்றை மட்டுமே நம்பி தயாரிக்கப்படுகிறது.\n* சமைக்க தெரியாதவர்களுக்கும் எளிது: திடீரென விருந்தினர்கள் வந்தால் எளிதாக சமைக்கக்கூடிய உணவு. அனைத்தையும் ஒன்றாக சேர்த்து கொதிக்க வைத்தால் போதும்.\n* பச்சை மிளகாயின் ரகசியம்: 10-12 பச்சை மிளகாயை பயன்படுத்தினாலும் காரம் குறைவாக இருக்க காரணம், அதிலுள்ள விதைகளை முழுமையாக நீக்குவதே. விதைகளுடன் சமைக்க விரும்பினால் 3-4 மிளகாய்கள் மட்டுமே பயன்படுத்தவும்."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 15,
      cookingTime: 60,
      totalTime: 75,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=VkAhaExpWUE"
      },
      tags: ["non-veg", "mutton", "varuval", "erode", "kongu", "pachai-milagai", "green-chilli", "no-masala"],
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
                en: "Heat a heavy-bottomed kadai or clay pot and pour in 50 ml of groundnut oil. Add the mustard seeds and allow them to splutter.",
                ta: "ஒரு மண்சட்டி அல்லது கடாயில் 50 மி.லி கடலை எண்ணெய் ஊற்றவும். எண்ணெய் காய்ந்ததும் கடுகு சேர்த்து வெடிக்க விடவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Toss in the fresh curry leaves, followed by the 400g of small onions. Sauté the onions well until they turn translucent and soft.",
                ta: "கருவேப்பிலை மற்றும் 400 கிராம் சின்ன வெங்காயம் சேர்த்து பொன்னிறமாகும் வரை நன்கு வதக்கவும்."
              }
            },
            {
              step: 3,
              description: {
                en: "Add the deseeded green chillies to the oil and onions. Sauté them briefly so the oil absorbs the fresh chilli aroma.",
                ta: "விதை நீக்கிய பச்சை மிளகாய் சேர்த்து சிறிது நேரம் வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Searing the Mutton", ta: "மட்டனை சமைத்தல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Add the 1 Kg of mutton pieces directly into the pan.",
                ta: "கழுவி வைத்துள்ள 1 கிலோ மட்டன் துண்டுகளை சேர்க்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Immediately add the turmeric powder and the crystal salt.",
                ta: "உடனே மஞ்சள் தூள் மற்றும் கல் உப்பு சேர்க்கவும்."
              }
            },
            {
              step: 6,
              description: {
                en: "Mix everything thoroughly and sauté the mutton in the oil for a few minutes until the meat changes color and slightly firms up.",
                ta: "அனைத்தையும் நன்கு கலந்து, கறி நிறம் மாறும் வரை எண்ணெயிலும் மசாலாவிலும் நன்கு வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Boiling and Roasting", ta: "வேகவைத்தல் மற்றும் வறுத்தல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "Pour in enough water to submerge and fully cook the mutton.",
                ta: "மட்டன் நன்கு வேக தேவையான அளவு தண்ணீர் சேர்க்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Cover the pot and let it cook on a medium-high flame. Mutton takes time to become tender, so let it boil vigorously.",
                ta: "கடாயை மூடி போட்டு மிதமான தீயில் வேகவிடவும். மட்டன் வேக அதிக நேரம் எடுக்கும்."
              }
            },
            {
              step: 9,
              description: {
                en: "Once the mutton is completely cooked and tender, remove the lid. Let the remaining water evaporate completely.",
                ta: "மட்டன் நன்கு வெந்ததும், மூடியை திறந்து மீதமுள்ள தண்ணீர் முழுவதும் வற்றும் வரை விடவும்."
              }
            },
            {
              step: 10,
              description: {
                en: "Keep roasting it in the pan until the dish reaches a thick, dry consistency (varuval). The green chillies and onions will have mashed together to coat the mutton pieces beautifully.",
                ta: "தண்ணீர் முழுவதும் வற்றி வறுவல் பதத்திற்கு வரும் வரை நன்கு வதக்கவும். பச்சை மிளகாய் மற்றும் வெங்காயம் முழுமையாக கரைந்து மட்டனின் மேல் சுவையான மசாலாவாக படிந்திருக்கும்."
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Pachai Milagai Mutton Varuval recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
