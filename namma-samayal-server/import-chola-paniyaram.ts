import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";
import Ingredient from "./src/models/Ingredient";
import User from "./src/models/User";
import Category from "./src/models/Category";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const ingredientsList: Array<{
  slug: string;
  name: string;
  ta: string;
  quantity: string;
  unit: string;
  categorySlug?: string;
}> = [
  { slug: "jowar", name: "Cholam (Sorghum / Jowar)", ta: "சோளம்", quantity: "500", unit: "g" },
  { slug: "idli-rice", name: "Idli Rice", ta: "இட்லி அரிசி", quantity: "250", unit: "g" },
  { slug: "urad-dal", name: "Whole White Urad Dal", ta: "உளுந்து", quantity: "100", unit: "g" },
  { slug: "fenugreek-seeds", name: "Fenugreek Seeds", ta: "வெந்தயம்", quantity: "1", unit: "tsp" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "2", unit: "tbsp (+ for cooking)" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "chana-dal", name: "Chana Dal", ta: "கடலை பருப்பு", quantity: "1", unit: "tsp" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "150", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "3-4", unit: "nos" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves", ta: "கொத்தமல்லி", quantity: "1", unit: "handful" },
  { slug: "ghee", name: "Ghee", ta: "நெய்", quantity: "as needed (optional, for kids)", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "kongunattu-chola-paniyaram";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "grains-cereals" }) || await Category.findOne();
    if (!fallbackCategory) throw new Error("No category found");

    const recipeIngredients = [];
    for (const item of ingredientsList) {
      let ingredient = await Ingredient.findOne({ slug: item.slug });

      if (!ingredient) {
        const cat = item.categorySlug
          ? (await Category.findOne({ slug: item.categorySlug })) || fallbackCategory
          : fallbackCategory;

        ingredient = await Ingredient.create({
          name: { en: item.name, ta: item.ta },
          slug: item.slug,
          category: cat._id,
          isActive: true,
        });
        console.log(`Created ingredient: ${item.name} (${item.slug})`);
      } else {
        console.log(`Reused ingredient: ${ingredient.name.en} (${ingredient.slug})`);
      }

      recipeIngredients.push({
        ingredient: ingredient._id,
        quantity: item.quantity,
        unit: item.unit,
        ingredientSnapshot: { en: item.name, ta: item.ta },
      });
    }

    const newRecipe = new Recipe({
      dishName: {
        en: "Kongunattu Chola Paniyaram (Sorghum Paniyaram)",
        ta: "கொங்குநாட்டு சோள பணியாரம்",
      },
      slug,
      description: {
        en: "A traditional Kongu-region millet paniyaram made by soaking and overnight-fermenting Cholam (sorghum/jowar) together with idli rice and urad dal, then steam-frying small batter spheres in a cast-iron paniyara kal. Crispy golden shells outside, soft spongy airy centers inside. Light on the stomach, deeply nutritious, and famous for 'kanakku illama saapidalam' — you can eat them without keeping count.",
        ta: "சோளம், இட்லி அரிசி மற்றும் உளுந்தை ஊறவைத்து, அரைத்து, இரவு முழுவதும் புளிக்க வைத்து செய்யப்படும் பாரம்பரிய கொங்கு நாட்டு சிறுதானிய பணியாரம். வெளியே பொன்னிறமாக மொறுமொறுப்பாகவும், உள்ளே மென்மையான காற்றோட்டமான தண்மையாகவும் வரும். எளிதில் ஜீரணமாகும், ஊட்டச்சத்து நிறைந்தது, 'கணக்கு இல்லாம சாப்பிடலாம்' என்று பிரபலம்.",
      },
      speciality: {
        en: "A Kongu millet powerhouse — cholam is light, highly digestible, rich in fiber and iron, and naturally cooling. Historically the farmer's sustained-energy food. Overnight fermentation is the key: it softens the tough millet grain and creates the signature crispy-shell, spongy-center texture that quick instant-mix versions can never match. The hand-mix step is critical — body warmth kickstarts the fermentation.",
        ta: "கொங்கு சிறுதானியத்தின் சக்தி வாய்ந்த உணவு — சோளம் இலகுவானது, எளிதில் ஜீரணமாகும், நார்ச்சத்து மற்றும் இரும்புச்சத்து நிறைந்தது, இயற்கையான குளிர்ச்சி தரும். விவசாயிகளுக்கு நீடித்த சக்தி தந்த உணவு. இரவு முழுவதும் புளிக்க வைப்பதே ரகசியம் — கடினமான சோளத்தை மென்மையாக்கி, மொறுமொறுப்பான வெளிப்புறமும் காற்றோட்டமான உட்பகுதியும் கொடுக்கும். கையால் கலக்கும் படி அவசியம் — உடல் வெப்பம் புளிப்பை தொடங்கி வைக்கும்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
      },
      prepTime: 30,
      cookingTime: 25,
      totalTime: 55,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      tags: [
        "veg",
        "breakfast",
        "tiffin",
        "paniyaram",
        "millet",
        "siruthaniyam",
        "sorghum",
        "jowar",
        "cholam",
        "kongu",
        "tamil-nadu",
        "fermented",
        "traditional",
        "healthy",
        "kid-friendly",
      ],
      searchKeywords: [
        "chola paniyaram",
        "cholam paniyaram",
        "sorghum paniyaram",
        "jowar paniyaram",
        "சோள பணியாரம்",
        "millet paniyaram",
        "kongu paniyaram",
        "kongunattu chola paniyaram",
        "chef deena",
        "siruthaniyam recipe",
      ],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      steps: [],
      sections: [
        {
          type: "preparation",
          title: { en: "Soaking the Grains", ta: "தானியங்களை ஊறவைத்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Wash the cholam, idli rice, urad dal and fenugreek seeds thoroughly under running water at least 2-3 times to remove any dust, husk fragments or impurities.",
                ta: "சோளம், இட்லி அரிசி, உளுந்து மற்றும் வெந்தயத்தை ஓடும் தண்ணீரில் குறைந்தது 2-3 முறை நன்கு கழுவவும். தூசு, உமி துகள்கள் அனைத்தும் நீங்க வேண்டும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Soak all four together in plenty of fresh water for 6 to 8 hours. Millets are hard grains and need ample hydration time before grinding — don't shortcut this step.",
                ta: "நான்கையும் ஒன்றாக நிறைய தண்ணீரில் 6 முதல் 8 மணி நேரம் ஊறவைக்கவும். சிறுதானியங்கள் கடினமான தானியங்கள், அரைப்பதற்கு முன் போதிய நேரம் ஊற வேண்டியது அவசியம் — இந்த படியை குறுக்க வேண்டாம்.",
              },
            },
          ],
        },
        {
          type: "preparation",
          title: { en: "Grinding & Fermenting the Batter", ta: "மாவு அரைத்தல் மற்றும் புளிக்க வைத்தல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Drain the soaked grains completely. Transfer to a wet grinder (or heavy mixer) and grind, adding water in small amounts, until you get a smooth, fluffy batter — slightly thicker than dosa batter, like an idli batter consistency.",
                ta: "ஊறிய தானியங்களை முழுவதுமாக வடிக்கவும். அரைக்கும் கல்லில் (அல்லது மிக்ஸியில்) சேர்த்து, சிறிது சிறிதாக தண்ணீர் சேர்த்து, இட்லி மாவு பதம் வரும் வரை — தோசை மாவை விட சற்று கெட்டியாக — மிருதுவாக காற்றோட்டமாக அரைக்கவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Transfer the batter to a large vessel and add crystal salt to taste. Crucial: mix well using your bare hands — the warmth from your hands kickstarts the fermentation. Don't substitute with a spoon.",
                ta: "மாவை ஒரு பெரிய பாத்திரத்துக்கு மாற்றி, தேவையான கல் உப்பு சேர்க்கவும். மிக முக்கியம்: கையாலேயே நன்கு கலக்கவும் — கையின் வெப்பம் புளிப்பை தூண்டும். கரண்டியை பயன்படுத்த வேண்டாம்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Cover the vessel with a lid (leave a small gap for gas to escape) and let it ferment overnight, or for about 8 hours, in a warm corner of the kitchen. The batter should rise noticeably, turn bubbly on top, and smell pleasantly sour.",
                ta: "பாத்திரத்தை மூடி வைக்கவும் (வாயு வெளியேற சிறிய இடைவெளி விடவும்), சமையலறையின் வெதுவெதுப்பான மூலையில் இரவு முழுவதும் அல்லது சுமார் 8 மணி நேரம் புளிக்க வைக்கவும். மாவு நன்கு பொங்கி, மேலே குமிழிகள் வந்து, லேசான புளிப்பு வாசனை வர வேண்டும்.",
              },
            },
          ],
        },
        {
          type: "tempering",
          title: { en: "The Flavorful Tempering (Thalippu)", ta: "தாளிப்பு" },
          steps: [
            {
              step: 6,
              description: {
                en: "Heat 2 tablespoons of groundnut oil in a small pan. Add the mustard seeds and let them splutter completely.",
                ta: "ஒரு சிறிய கடாயில் 2 ஸ்பூன் கடலை எண்ணெய் சூடாக்கி, கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Add 1 tsp chana dal and 1 tsp urad dal. Roast on a low flame, stirring often, until they turn a beautiful uniform golden brown and release a nutty aroma.",
                ta: "1 ஸ்பூன் கடலை பருப்பு மற்றும் 1 ஸ்பூன் உளுந்து சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, பொன்னிற பழுப்பாகி இனிய வாசனை வரும் வரை வறுக்கவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Toss in the finely chopped small onions, finely chopped green chillies and the curry leaves. Sauté until the onions turn translucent, soft and slightly sweet.",
                ta: "நன்கு நறுக்கிய சின்ன வெங்காயம், நன்கு நறுக்கிய பச்சை மிளகாய் மற்றும் கருவேப்பிலை சேர்க்கவும். வெங்காயம் பளபளப்பாகி, மிருதுவாகி, லேசாக இனிப்பு சுவை வரும் வரை வதக்கவும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Turn off the heat. Mix in the finely chopped fresh coriander leaves so they wilt in the residual heat without losing color.",
                ta: "அடுப்பை அணைக்கவும். நன்கு நறுக்கிய பச்சை கொத்தமல்லியை சேர்த்து, மீதமுள்ள வெப்பத்தில் வாட விடவும் — நிறம் இழக்காமல் இருக்கும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Pour this entire hot, aromatic tempering directly into the fermented Cholam batter and mix well. The batter is now ready to cook.",
                ta: "இந்த சூடான வாசனை மிக்க தாளிப்பை முழுவதுமாக புளித்த சோள மாவில் ஊற்றி நன்கு கலக்கவும். மாவு இப்போது வேக வைக்க தயார்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Paniyaram", ta: "பணியாரம் சுடுதல்" },
          steps: [
            {
              step: 11,
              description: {
                en: "Heat a traditional cast-iron paniyaram pan (paniyara kal) on the stove over medium heat until it is properly hot — a drop of water should sizzle and evaporate instantly.",
                ta: "பாரம்பரிய இரும்பு பணியாரக்கல்லை மிதமான தீயில் நன்கு சூடாக்கவும் — ஒரு துளி தண்ணீர் சேர்த்தால் உடனே சீறி ஆவியாக வேண்டும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add a few drops of groundnut oil into each of the molds. For kids, you can swap to ghee for a richer flavor and golden color.",
                ta: "ஒவ்வொரு குழியிலும் சில துளி கடலை எண்ணெய் சேர்க்கவும். குழந்தைகளுக்கு பரிமாற நெய் பயன்படுத்தினால் அதிக சுவையும் பொன்னிறமும் கிடைக்கும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Pour the tempered batter into the molds, filling each only about ¾ full — the batter will puff up significantly as it cooks.",
                ta: "தாளிப்பு கலந்த மாவை ஒவ்வொரு குழியிலும் முக்கால் பகுதி வரை மட்டும் ஊற்றவும் — வேகும் போது மாவு நன்கு பொங்கி வரும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Cover the pan with a lid and cook on medium-low heat for 2-3 minutes, until the bottom forms a crispy, deep golden-brown crust.",
                ta: "பாத்திரத்தை மூடி வைத்து மிதமான-குறைந்த தீயில் 2-3 நிமிடம் வேக விடவும். அடிப்பகுதி கெட்டியாக, ஆழமான பொன்னிற பழுப்பாக மொறுமொறுப்பாக மாற வேண்டும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Using a skewer or the back of a small spoon, gently flip each paniyaram over by sliding under the edge. Don't force it — if it's stuck, it isn't crusted enough yet, give it 30 more seconds.",
                ta: "ஒரு குச்சி அல்லது சிறிய ஸ்பூனின் பின்புறம் கொண்டு, ஓரத்திலிருந்து பணியாரத்தை மெதுவாக புரட்டவும். வலுக்கட்டாயமாக புரட்ட வேண்டாம் — ஒட்டிக்கொண்டிருந்தால் இன்னும் வேகவில்லை, மேலும் 30 விநாடிகள் காத்திருக்கவும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Let the other side cook uncovered for another minute or so until fully cooked through, golden and crispy.",
                ta: "மற்றொரு பக்கம் மூடாமல் சுமார் ஒரு நிமிடம் வேக விடவும் — முழுமையாக வெந்து, பொன்னிறமாக, மொறுமொறுப்பாக வர வேண்டும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Serve the piping hot, golden Chola Paniyarams immediately with a spicy tomato chutney, Kara chutney, or coconut chutney.",
                ta: "சூடான, பொன்னிற சோள பணியாரத்தை உடனடியாக காரமான தக்காளி சட்னி, கார சட்னி அல்லது தேங்காய் சட்னியுடன் பரிமாறவும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Chola Paniyaram recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
