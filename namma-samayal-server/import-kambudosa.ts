import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList = [
  { name: "Pearl Millet", ta: "கம்பு", quantity: "500", unit: "g" },
  { name: "Idli Rice", ta: "இட்லி அரிசி", quantity: "100", unit: "g" },
  { name: "Urad Dal", ta: "உளுத்தம் பருப்பு", quantity: "50-100", unit: "g" },
  { name: "Fenugreek Seeds", ta: "வெந்தயம்", quantity: "1", unit: "tsp" },
  { name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "2", unit: "tbsp" },
  { name: "Small Onions", ta: "சின்ன வெங்காயம்", quantity: "200", unit: "g" },
  { name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "8-10", unit: "nos" },
  { name: "Tomatoes", ta: "தக்காளி", quantity: "2", unit: "nos" },
  { name: "Garlic", ta: "பூண்டு", quantity: "4-5", unit: "cloves" },
  { name: "Tamarind", ta: "புளி", quantity: "1", unit: "small piece" },
  { name: "Chana Dal", ta: "கடலை பருப்பு", quantity: "1", unit: "tsp" },
  { name: "Mustard Seeds", ta: "கடுகு", quantity: "to temper", unit: "" },
  { name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "to temper", unit: "" },
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
      dishName: { en: "Erode Kambu Dosa & Spicy Onion Chutney", ta: "ஈரோடு கம்பு தோசை மற்றும் கார சட்னி" },
      slug: "erode-kambu-dosa-onion-chutney",
      description: {
        en: "An incredibly healthy, fermented pearl millet dosa known as 'Office Kambu' for its cooling and energy-sustaining properties, served alongside a fiery, tangy onion chutney.",
        ta: "கம்பு, இட்லி அரிசி மற்றும் உளுந்து சேர்த்து அரைத்து புளிக்க வைத்த ஆரோக்கியமான கம்பு தோசை மற்றும் அதற்கு இணையான காரசாரமான வெங்காய சட்னி."
      },
      speciality: {
        en: "What Makes 'Office Kambu' So Special?\n\n* The 'Office' Rebranding: Traditionally, Kambu (Pearl Millet) was considered rustic food for farmers doing hard labor. Recently, it earned the nickname 'Office Kambu' because desk-job workers realized its benefits: it's cooling, packed with iron, aids in weight loss, and provides sustained energy without making you sluggish.\n* The Golden Pairing: Pearl millet has an earthy, slightly bland flavor. To balance this, it MUST be paired with something aggressively flavorful. That is why in Erode, Kambu Dosa is exclusively served with a fiery Vengaya Kara Chutney (Spicy Small Onion Chutney).\n* The Fermentation Magic: While modern recipes push for 'instant' dosas, traditional Kongu cooks insist on proper overnight fermentation. Fermenting unlocks probiotics, makes millet easier to digest, and gives the dosa a beautiful sour tang, crispy edges, and a soft center.",
        ta: "ஆபிஸ் கம்பு தோசையின் சிறப்புகள்:\n\n* ஆபிஸ் கம்பு: விவசாயிகளுக்கு உடல் பலத்தை கொடுக்கும் கம்பு, இன்று கணிப்பொறி முன் அமர்ந்து வேலை பார்ப்பவர்களுக்கும் 'ஆபிஸ் கம்பு' என்ற பெயரில் மிகவும் ஆரோக்கியமான உணவாக மாறியுள்ளது. இது உடல் சூட்டை குறைத்து, சோர்வில்லாத ஆற்றலைத் தரும்.\n* கார சட்னி காம்பினேஷன்: கம்பின் லேசான சுவையை ஈடுகட்ட, அதனுடன் மிகவும் காரசாரமான சின்ன வெங்காய கார சட்னியை சேர்த்து சாப்பிடுவதே ஈரோடு மக்களின் தனிச்சிறப்பு.\n* புளிக்க வைப்பதன் ரகசியம்: கம்பு மாவை அரைத்த உடனே தோசை சுடாமல், 8 மணி நேரம் புளிக்க வைப்பதன் மூலம் மாவில் நல்ல பாக்டீரியாக்கள் உருவாகி, தோசைக்கு லேசான புளிப்பு சுவையும் நல்ல மொறுமொறுப்பும் கிடைக்கும்."
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode"
      },
      prepTime: 480, // 8 hours soaking/fermentation
      cookingTime: 30,
      totalTime: 510,
      servings: 4,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=7DymuhF0n8s"
      },
      tags: ["veg", "breakfast", "dosa", "kambu", "pearl-millet", "chutney", "erode", "kongu", "healthy"],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      sections: [
        {
          type: "preparation",
          title: { en: "Preparing the Kambu Dosa Batter", ta: "மாவு தயார் செய்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Wash the pearl millet (Kambu), idli rice, urad dal, and fenugreek seeds thoroughly under running water at least 2 to 3 times.",
                ta: "கம்பு, இட்லி அரிசி, உளுத்தம் பருப்பு மற்றும் வெந்தயத்தை 2-3 முறை நன்கு கழுவவும்."
              }
            },
            {
              step: 2,
              description: {
                en: "Soak all these ingredients together in a large vessel with plenty of water for 6 to 8 hours. (Since millets are hard grains, they require a longer soaking time than regular rice).",
                ta: "அனைத்தையும் ஒன்றாக 6 முதல் 8 மணி நேரம் அதிக தண்ணீரில் ஊறவைக்கவும். (கம்பு சற்று கடினமான தானியம் என்பதால் அதிக நேரம் ஊற வேண்டும்)."
              }
            },
            {
              step: 3,
              description: {
                en: "Drain the water and grind the mixture in a wet grinder or heavy-duty mixer until it forms a smooth, slightly fluffy batter.",
                ta: "தண்ணீரை வடிகட்டி, மாவை கிரைண்டர் அல்லது மிக்ஸியில் சற்று நைசாகவும் மிருதுவாகவும் அரைத்து எடுக்கவும்."
              }
            },
            {
              step: 4,
              description: {
                en: "Transfer the batter to a large container, add crystal salt, and mix well using your hands.",
                ta: "மாவை ஒரு பெரிய பாத்திரத்திற்கு மாற்றி, கல் உப்பு சேர்த்து கைகளால் நன்கு கரைத்து வைக்கவும்."
              }
            },
            {
              step: 5,
              description: {
                en: "Cover it and let it ferment overnight (or for 8 hours) in a warm place until the batter rises and becomes airy.",
                ta: "மூடி போட்டு 8 மணி நேரம் அல்லது இரவு முழுவதும் புளிக்க விடவும். மாவு நன்கு பொங்கி வர வேண்டும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Making the Spicy Onion Chutney", ta: "கார சட்னி செய்தல்" },
          steps: [
            {
              step: 6,
              description: {
                en: "Heat a pan with a tablespoon of groundnut oil. Roast the chana dal, urad dal, and dry red chillies until they release a nutty aroma.",
                ta: "ஒரு கடாயில் கடலை எண்ணெய் ஊற்றி கடலை பருப்பு, உளுத்தம் பருப்பு மற்றும் காய்ந்த மிளகாய் சேர்த்து வாசம் வரும் வரை வறுக்கவும்."
              }
            },
            {
              step: 7,
              description: {
                en: "Add the peeled small onions and garlic cloves. Sauté them well until the onions turn translucent and slightly golden.",
                ta: "தோல் உரித்த சின்ன வெங்காயம் மற்றும் பூண்டு சேர்த்து பொன்னிறமாகும் வரை வதக்கவும்."
              }
            },
            {
              step: 8,
              description: {
                en: "Toss in the chopped tomatoes, tamarind piece, and salt. Sauté everything continuously until the tomatoes turn completely soft and mushy.",
                ta: "நறுக்கிய தக்காளி, புளி மற்றும் உப்பு சேர்த்து தக்காளி நன்கு மசியும் வரை வதக்கவும்."
              }
            },
            {
              step: 9,
              description: {
                en: "Let the mixture cool down entirely, then grind it in a mixer to a smooth, vibrant red paste.",
                ta: "நன்கு ஆறிய பின் மிக்ஸியில் போட்டு மைய அரைத்து எடுக்கவும்."
              }
            },
            {
              step: 10,
              description: {
                en: "Optional: Heat a teaspoon of oil in a small pan, splutter some mustard seeds and curry leaves, and pour this tempering over the ground chutney.",
                ta: "விருப்பப்பட்டால் கடுகு, கருவேப்பிலை தாளித்து சட்னியில் சேர்க்கவும்."
              }
            }
          ]
        },
        {
          type: "cooking",
          title: { en: "Making the Dosa", ta: "தோசை சுடுதல்" },
          steps: [
            {
              step: 11,
              description: {
                en: "Heat a cast-iron dosa tawa (Dosa kal).",
                ta: "தோசைக்கல்லை அடுப்பில் வைத்து சூடாக்கவும்."
              }
            },
            {
              step: 12,
              description: {
                en: "Take a ladle full of the fermented Kambu batter and spread it out thinly in a circular motion, just like a regular dosa.",
                ta: "புளித்த கம்பு மாவை ஒரு கரண்டி எடுத்து வழக்கமான தோசை போல மெல்லியதாக ஊற்றவும்."
              }
            },
            {
              step: 13,
              description: {
                en: "Drizzle a spoonful of cold-pressed groundnut oil or ghee around the edges.",
                ta: "சுற்றிலும் சிறிதளவு கடலை எண்ணெய் அல்லது நெய் ஊற்றவும்."
              }
            },
            {
              step: 14,
              description: {
                en: "Let it cook until the bottom turns a beautiful golden-brown and the edges lift up easily. Flip it for a few seconds if you prefer it extra crispy.",
                ta: "அடிப்பகுதி நன்கு வெந்து பொன்னிறமாகும் வரை விடவும். தேவைப்பட்டால் தோசையை திருப்பி போட்டு மொறுமொறுப்பாக எடுக்கலாம்."
              }
            },
            {
              step: 15,
              description: {
                en: "Serve the hot, crispy Kambu Dosa immediately with a generous scoop of the fiery onion chutney!",
                ta: "சுடச்சுட கம்பு தோசையை காரசாரமான வெங்காய சட்னியுடன் சேர்த்து பரிமாறவும்!"
              }
            }
          ]
        }
      ]
    });

    await newRecipe.save();
    console.log("Kambu Dosa recipe created successfully!");

  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
