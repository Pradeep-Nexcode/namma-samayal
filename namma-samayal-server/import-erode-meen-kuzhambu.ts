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
  { slug: "fish", name: "Fish", ta: "மீன்", quantity: "1.5", unit: "kg" },
  { slug: "gingelly-oil-sesame-oil", name: "Gingelly Oil (Sesame Oil)", ta: "எள்ளெண்ணெய்", quantity: "as needed (generous)", unit: "" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "500", unit: "g" },
  { slug: "garlic", name: "Garlic", ta: "பூண்டு", quantity: "10", unit: "cloves" },
  { slug: "tomato", name: "Tomato", ta: "தக்காளி", quantity: "2", unit: "nos" },
  { slug: "tamarind", name: "Tamarind", ta: "புளி", quantity: "100", unit: "g" },
  { slug: "coriander-powder", name: "Coriander Powder", ta: "கொத்தமல்லி தூள்", quantity: "200", unit: "g" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "10", unit: "nos" },
  { slug: "fennel-seeds", name: "Fennel Seeds", ta: "சோம்பு", quantity: "1", unit: "tsp" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "fenugreek-seeds", name: "Fenugreek Seeds", ta: "வெந்தயம்", quantity: "1", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-aaya-meen-kuzhambu";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "seafood" }) || await Category.findOne();
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
      dishName: { en: "Erode Aaya's Meen Kuzhambu (Grandma's Fish Curry)", ta: "ஈரோடு ஆயா மீன் குழம்பு" },
      slug,
      description: {
        en: "An authentic Kongu-style village fish curry built on a massive base of small onions and freshly bloomed coriander powder, finished in gingelly oil with a fenugreek-curry-leaf tempering. The hallmark of true Tamil home cooking — known for tasting even better the next morning (pazhasu) once the fish has soaked overnight in the tangy tamarind broth.",
        ta: "ஈரோடு கொங்கு நாட்டு பாரம்பரிய மீன் குழம்பு. அரை கிலோ சின்ன வெங்காயம் மற்றும் 200 கிராம் கொத்தமல்லி தூள் கொண்ட அடிப்படையில், எள்ளெண்ணெய்யில் வெந்தயம் மற்றும் கருவேப்பிலை தாளித்து செய்யப்படும் சுவையான குழம்பு. மறுநாள் காலையில் இன்னும் ருசியாக இருக்கும் — அதுதான் இதன் சிறப்பு!",
      },
      speciality: {
        en: "The 'kaimanam' (mother's hand-flavor) fish curry — relies on an unusually high onion-to-coriander-powder base instead of coconut or tomato thickeners. Gingelly oil is mandatory: it carries the aroma and counters the heat of the tamarind and chillies. Tastes ten times better as next-day 'pazhasu' from the clay pot.",
        ta: "'கைமணம்' கொண்ட பாரம்பரிய மீன் குழம்பு — தேங்காய் அல்லது தக்காளி அதிகம் இல்லாமல், சின்ன வெங்காயம் மற்றும் கொத்தமல்லி தூள் கொண்டே கெட்டியாக்கப்படுகிறது. எள்ளெண்ணெய் கட்டாயம் — வாசனைக்கும், புளி-மிளகாய் வெப்பத்தை குளிர்விக்கவும். மண்சட்டியில் வைத்து மறுநாள் 'பழசு'வாக சாப்பிட்டால் பத்து மடங்கு ருசி அதிகரிக்கும்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 20,
      cookingTime: 40,
      totalTime: 60,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=s-LAPk8AyCc",
      },
      tags: [
        "non-veg",
        "fish",
        "meen-kuzhambu",
        "fish-curry",
        "kuzhambu",
        "gravy",
        "erode",
        "kongu",
        "tamil-nadu",
        "traditional",
        "clay-pot",
        "pazhasu",
        "village-style",
      ],
      searchKeywords: [
        "meen kuzhambu",
        "fish curry",
        "மீன் குழம்பு",
        "erode aaya",
        "kongu fish curry",
        "kaimanam",
        "pazhasu meen kuzhambu",
        "gingelly oil fish curry",
        "village fish curry",
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
          title: { en: "Cleaning the Fish", ta: "மீன் சுத்தம் செய்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Clean the fish thoroughly under running water. Rub the pieces with a pinch of turmeric and a little crystal salt, then rinse off — this removes the slime and any raw smell. Drain and set aside.",
                ta: "மீனை ஓடும் தண்ணீரில் நன்கு சுத்தம் செய்யவும். துண்டுகளில் சிறிது மஞ்சள் தூள் மற்றும் கல் உப்பு தடவி, மீண்டும் கழுவவும் — இது வழவழப்பையும் பச்சை வாசனையையும் நீக்கும். தண்ணீரை வடித்து தனியாக வைக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Soak the 100g of tamarind in warm water for 10-15 minutes, then squeeze and extract a thick juice. Discard the fibre and seeds. Set aside.",
                ta: "100 கிராம் புளியை சூடான தண்ணீரில் 10-15 நிமிடம் ஊறவைத்து, கசக்கி கெட்டியான புளிக்கரைசலை எடுக்கவும். நார் மற்றும் விதைகளை நீக்கி தனியாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Making the Fresh Masala Base (Part 1)", ta: "மசாலா தயாரித்தல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat 2 tablespoons of gingelly oil in a pan. Add the fennel seeds and let them splutter, releasing their aroma, followed immediately by the dry red chillies. Sauté for a few seconds.",
                ta: "ஒரு கடாயில் 2 ஸ்பூன் எள்ளெண்ணெய் சூடாக்கவும். சோம்பு சேர்த்து வெடிக்க விடவும், உடனே காய்ந்த மிளகாயை சேர்த்து சில விநாடிகள் வதக்கவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Toss in the full ½ kg of peeled small onions (kept whole) and the 10 garlic cloves. Sauté patiently on a medium flame until the onions turn translucent and slightly golden — don't rush this step.",
                ta: "தோல் சீவிய அரை கிலோ சின்ன வெங்காயம் (முழுதாக) மற்றும் 10 பூண்டு பற்களை சேர்க்கவும். வெங்காயம் பளபளப்பாகி, லேசாக பொன்னிறம் ஆகும் வரை மிதமான தீயில் பொறுமையாக வதக்கவும். அவசரப்பட வேண்டாம்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Add the chopped tomatoes and sauté until they break down completely and become soft and mushy.",
                ta: "நறுக்கிய தக்காளியை சேர்த்து, அவை முற்றிலும் குழைந்து மிருதுவாகும் வரை வதக்கவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Lower the flame and add the 200g of coriander powder along with the turmeric powder directly into the hot onion-tomato mixture. Sauté briefly just until the raw smell of the powders fades. Critical: do NOT burn the dry powders — burnt masala will make the entire curry bitter.",
                ta: "தீயை குறைத்து, 200 கிராம் கொத்தமல்லி தூள் மற்றும் மஞ்சள் தூளை வெங்காயம்-தக்காளி கலவையில் நேரடியாக சேர்க்கவும். பச்சை வாசனை போகும் வரை மட்டும் மிதமாக வதக்கவும். மிக முக்கியம்: தூள்கள் கருகக்கூடாது — கருகினால் முழு குழம்பும் கசக்கும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Turn off the heat. Let the mixture cool down completely, then transfer to a mixer jar and grind to a smooth, thick paste. Set aside.",
                ta: "அடுப்பை அணைக்கவும். கலவை முற்றிலும் ஆறிய பின் மிக்ஸியில் சேர்த்து கெட்டியான மிருதுவான விழுதாக அரைக்கவும். தனியாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Building the Kuzhambu (Part 2)", ta: "குழம்பு கட்டமைத்தல்" },
          steps: [
            {
              step: 8,
              description: {
                en: "Heat a traditional clay pot (manchatti) or a heavy-bottomed vessel and pour in a generous layer of gingelly oil — don't be stingy, this oil carries the entire flavor.",
                ta: "ஒரு பாரம்பரிய மண்சட்டி அல்லது தடிமனான பாத்திரத்தை சூடாக்கி, தாராளமான அளவு எள்ளெண்ணெய் ஊற்றவும் — கஞ்சத்தனம் காட்ட வேண்டாம், இந்த எண்ணெய்தான் முழு சுவையையும் தாங்கி நிற்கிறது.",
              },
            },
            {
              step: 9,
              description: {
                en: "Add the mustard seeds and let them pop. Immediately add the fenugreek seeds (vendhayam) and a generous handful of fresh curry leaves. Let them splutter — this releases the signature fish curry fragrance into the oil.",
                ta: "கடுகு சேர்த்து வெடிக்க விடவும். உடனே வெந்தயம் மற்றும் ஒரு கைப்பிடி கருவேப்பிலை சேர்க்கவும். இந்த தாளிப்புதான் மீன் குழம்புக்கு உரிய சிறப்பு வாசனையை எண்ணெய்க்கு கொடுக்கும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Pour the freshly ground masala paste into the hot tempered oil. Sauté it well for a couple of minutes, stirring continuously so it doesn't stick.",
                ta: "புதிதாக அரைத்த மசாலா விழுதை சூடான தாளித்த எண்ணெயில் ஊற்றவும். ஒட்டாமல் இருக்க தொடர்ந்து கிளறி இரண்டு நிமிடம் வதக்கவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Pour in the thick tamarind extract and add crystal salt to taste. Mix everything thoroughly.",
                ta: "கெட்டியான புளிக்கரைசலை ஊற்றி, தேவையான கல் உப்பு சேர்த்து நன்கு கலக்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add enough water to bring the gravy to a proper kuzhambu consistency — not too watery, not too thick. Cover the pot and let the gravy boil vigorously on a medium flame for 10-15 minutes, until the raw tamarind smell completely disappears and the gingelly oil floats beautifully on top — this is the sign the kuzhambu is ready.",
                ta: "சரியான குழம்பு பதத்துக்கு தேவையான தண்ணீர் சேர்க்கவும் — அதிக நீர்த்தும் வேண்டாம், கெட்டியாகவும் வேண்டாம். மூடி மூடி மிதமான தீயில் 10-15 நிமிடம் நன்கு கொதிக்க விடவும். புளியின் பச்சை வாசனை முற்றிலும் போய், மேலே எள்ளெண்ணெய் தனியாக மிதந்தால் — குழம்பு தயார்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Fish (Part 3)", ta: "மீன் வேக வைத்தல்" },
          steps: [
            {
              step: 13,
              description: {
                en: "Once the gravy is fully cooked and bubbling perfectly, gently slide the cleaned fish pieces into the pot one by one.",
                ta: "குழம்பு நன்கு வெந்து சரியாக கொதிக்கும் போது, சுத்தம் செய்த மீன் துண்டுகளை ஒவ்வொன்றாக மெதுவாக சேர்க்கவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Crucial: do NOT stir the curry vigorously with a ladle after adding the fish — the delicate pieces will break apart. Instead, gently swirl the pot by its handles, or lightly press the fish pieces down with the back of a spoon so they are fully submerged in the gravy.",
                ta: "மிக முக்கியம்: மீன் சேர்த்த பிறகு கரண்டியால் வேகமாக கிளற வேண்டாம் — மீன் துண்டுகள் உடைந்து விடும். மண்சட்டியின் காதுகளை பிடித்து மெதுவாக சுழற்றவும், அல்லது ஸ்பூனின் பின்புறத்தால் மீன் துண்டுகளை குழம்பில் முழுகுமாறு லேசாக அழுத்தவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Let it simmer gently on a low flame for just 5 to 7 minutes — fish cooks very quickly, so don't overcook it.",
                ta: "மிதமான தீயில் வெறும் 5 முதல் 7 நிமிடம் மட்டும் மெதுவாக கொதிக்க விடவும் — மீன் வேகமாக வெந்து விடும், அதிகம் வேக வைக்க வேண்டாம்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Turn off the heat and let the curry rest for at least 15-20 minutes before serving — this lets the fish soak in the flavors.",
                ta: "அடுப்பை அணைத்து, பரிமாறும் முன் குறைந்தது 15-20 நிமிடம் ஆற விடவும் — மீன் சுவையை உறிஞ்சிக் கொள்ள இந்த ஓய்வு அவசியம்.",
              },
            },
          ],
        },
        {
          type: "serving",
          title: { en: "Serving & Pazhasu (Next-Day) Tip", ta: "பரிமாறுதல் மற்றும் பழசு" },
          steps: [
            {
              step: 17,
              description: {
                en: "Serve steaming hot over plain white rice with a side of appalam or fried vegetables.",
                ta: "சூடான வெள்ளை சாதத்துடன், அப்பளம் அல்லது பொரியலுடன் சேர்த்து சூடாக பரிமாறவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "For the true 'pazhasu' (next-day) magic — leave the curry undisturbed in the clay pot overnight at room temperature (or refrigerated). The next morning, the fish will have fully soaked up the tangy tamarind broth and the flavor deepens dramatically. Serve cold-from-the-pot with idlies for breakfast.",
                ta: "உண்மையான 'பழசு' சுவைக்கு — குழம்பை மண்சட்டியில் இரவு முழுவதும் சாதாரண வெப்பநிலையில் (அல்லது குளிர்சாதனத்தில்) தொடாமல் வைக்கவும். மறுநாள் காலையில் மீன் புளி குழம்பின் சுவையை முழுமையாக உறிஞ்சி இருக்கும், ருசி பல மடங்கு அதிகரிக்கும். மண்சட்டியிலிருந்தே இட்லியுடன் காலை உணவாக பரிமாறவும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Meen Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
