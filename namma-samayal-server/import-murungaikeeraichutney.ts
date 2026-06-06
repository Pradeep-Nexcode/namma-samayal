import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Drumstick Leaves", ta: "முருங்கைக்கீரை", quantity: "2", unit: "handfuls" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "3", unit: "tbsp" },
  { name: "Coriander Seeds", ta: "கொத்தமல்லி விதை", quantity: "3", unit: "tsp" },
  { name: "Cumin Seeds", ta: "சீரகம்", quantity: "2", unit: "tsp" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "4-5", unit: "nos" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "200", unit: "g" },
  { name: "Tomatoes", ta: "தக்காளி", quantity: "3", unit: "nos" },
  { name: "Tamarind", ta: "புளி", quantity: "1", unit: "lemon-sized ball" },
  { name: "Coriander Leaves", ta: "கொத்தமல்லி இலை", quantity: "1", unit: "small handful" },
  { name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" }
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
      dishName: { en: "Erode Aaya's Murungaikeerai Chutney", ta: "ஈரோடு ஆயாவின் முருங்கைக்கீரை சட்னி" },
      slug: "erode-aaya-murungaikeerai-chutney",
      description: {
        en: "A highly nutritious, traditional Kongu recipe that turns iron-rich drumstick leaves into a delicious, tangy, and spicy chutney, completely masking their natural bitterness.",
        ta: "இரும்புச்சத்து நிறைந்த முருங்கைக்கீரையின் கசப்பு தெரியாமல், சுவையான மற்றும் காரசாரமான சட்னியாக மாற்றும் ஈரோடு ஆயாவின் பாரம்பரிய கொங்கு நாட்டு செய்முறை."
      },
      speciality: {
        en: "What Makes This Chutney Special?\n\nChef Deena learns this rare recipe straight from Mrs. Pazhani Ammal (Erode Aaya):\n\n* The Ultimate Health Hack: Murungai Keerai (Moringa) is a powerhouse of iron and calcium. However, many kids dislike eating it as a regular stir-fry due to its earthy taste.\n* The Magic Disguise: Erode Aaya's secret turns these leaves into a tangy, spicy chutney. By blending it with roasted coriander seeds, tamarind, and tomatoes, the bitterness completely vanishes. You won't even realize you are eating drumstick leaves!\n* Versatility: This thick, rustic chutney (thogayal) pairs phenomenally well as a side for soft idlies and crispy dosas, but tastes absolute heaven mixed with hot steamed white rice and a dollop of ghee.",
        ta: "இந்த சட்னியின் சிறப்பம்சங்கள்:\n\n* சிறந்த ஆரோக்கியம்: இரும்பு மற்றும் கால்சியம் சத்துக்கள் நிறைந்த முருங்கைக்கீரையை பொரியலாக சாப்பிட பல குழந்தைகள் விரும்புவதில்லை.\n* கசப்பற்ற சுவை: ஈரோடு ஆயாவின் கைமணத்தில், மல்லி, புளி மற்றும் தக்காளி சேர்த்து வதக்கி அரைப்பதால் கீரையின் கசப்பு துளியும் தெரியாது. கீரை சாப்பிடாதவர்களும் விரும்பி சாப்பிடுவார்கள்.\n* பலவகை பயன்பாடு: இட்லி, தோசைக்கு சிறந்த தொடுகறியாக இருப்பதோடு, சுடச்சுட சாதத்தில் நெய் விட்டு பிசைந்து சாப்பிட தேவாமிர்தமாக இருக்கும்."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 10,
      cookingTime: 15,
      totalTime: 25,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=oIQKyP2Pj1E"
      },
      tags: ["veg", "chutney", "thogayal", "murungaikeerai", "moringa", "drumstick-leaves", "erode", "kongu", "healthy"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "preparation",
          title: { en: "Roasting the Spices", ta: "மசாலா வறுத்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Heat a heavy-bottomed kadai or clay pot (manchatti) and add a tablespoon of groundnut oil.",
                ta: "ஒரு மண்சட்டி அல்லது கடாயை சூடாக்கி ஒரு தேக்கரண்டி கடலை எண்ணெய் ஊற்றவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Add the coriander seeds, cumin seeds, and dry red chillies. Roast them on a medium-low flame until they release a beautiful, nutty aroma. Do not let them burn.",
                ta: "கொத்தமல்லி விதை, சீரகம் மற்றும் காய்ந்த மிளகாய் சேர்த்து வாசம் வரும் வரை மிதமான தீயில் வறுக்கவும். கருகவிட வேண்டாம்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Base", ta: "அடிப்படை வதக்குதல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "To the same pan, add the peeled small onions. Sauté them well until they turn translucent and slightly golden.",
                ta: "அதே கடாயில் சின்ன வெங்காயம் சேர்த்து பொன்னிறமாகும் வரை நன்கு வதக்கவும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Toss in the chopped tomatoes and the piece of tamarind. Add the crystal salt at this stage.",
                ta: "நறுக்கிய தக்காளி, புளி மற்றும் கல் உப்பு சேர்க்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Sauté continuously until the tomatoes break down and turn completely soft and mushy.",
                ta: "தக்காளி நன்கு மசியும் வரை தொடர்ந்து வதக்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Cooking the Miracle Leaves", ta: "கீரை வதக்குதல்" },
          steps: [
            {
              step: 6,
              description: {
                en: "Add the 2 handfuls of fresh Murungai Keerai (Drumstick leaves) directly into the onion-tomato base.",
                ta: "ஆய்ந்து வைத்துள்ள முருங்கைக்கீரையை தக்காளி-வெங்காய கலவையுடன் சேர்க்கவும்."
              }
            },
            {
              step: 7,
              description: {
                en: "Sauté the leaves well for a few minutes. You will notice the leaves shrink rapidly. Keep cooking until the raw, earthy smell of the greens completely disappears. (Chef's tip: Do not overcook the leaves until they turn black, as you want to retain their bright color and nutrients).",
                ta: "கீரையை நன்கு வதக்கவும். கீரையின் பச்சை வாசனை போகும் வரை சில நிமிடங்கள் வதக்கினால் போதுமானது. (அதிகமாக வதக்கி கருகிவிட வேண்டாம், கீரையின் நிறம் மற்றும் சத்துக்கள் மாறாமல் இருக்க வேண்டும்)."
              }
            }
          ]
        },
        {
          type: "final",
          title: { en: "The Final Grind", ta: "அரைத்தல்" },
          steps: [
            {
              step: 8,
              description: {
                en: "Turn off the heat. Toss in a small handful of fresh coriander leaves into the hot pan and give it a quick mix. The residual heat is enough to wilt them.",
                ta: "அடுப்பை அணைத்துவிட்டு, சிறிது நறுக்கிய கொத்தமல்லி இலைகளை சேர்த்து ஒரு முறை கிளறி விடவும். பாத்திரத்தின் சூட்டிலேயே இது வதங்கிவிடும்."
              }
            },
            {
              step: 9,
              description: {
                en: "Allow the entire mixture to cool down completely.",
                ta: "இந்த கலவையை முழுமையாக ஆறவிடவும்."
              }
            },
            {
              step: 10,
              description: {
                en: "Transfer it to a mixer jar and grind it into a thick, slightly coarse paste (do not make it overly smooth or watery; a rustic thogayal texture is best).",
                ta: "ஆறிய பின் மிக்ஸியில் போட்டு சற்று கெட்டியாக, நடுத்தர பதத்தில் அரைத்து எடுக்கவும். (அதிக தண்ணியாகவோ, மைய அரைக்கவோ வேண்டாம்)."
              }
            },
            {
              step: 11,
              description: {
                en: "Serve this incredibly healthy, vibrant green chutney with hot idlies or mix it into steaming white rice!",
                ta: "இந்த ஆரோக்கியமான சுவையான சட்னியை இட்லி, தோசையுடன் பரிமாறவும் அல்லது சூடான சாதத்தில் பிசைந்து சாப்பிடவும்!"
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Murungaikeerai Chutney recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
