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
  // Aracha (roasted-and-ground) paste
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, for paste)", ta: "சின்ன வெங்காயம் (விழுதுக்கு)", quantity: "750", unit: "g (¾ kg)" },
  { slug: "country-tomatoes", name: "Country Tomatoes (Naattu Thakkali, roughly chopped)", ta: "நாட்டு தக்காளி (பெரிய துண்டுகளாக)", quantity: "10-12", unit: "nos" },
  { slug: "garlic", name: "Garlic", ta: "பூண்டு", quantity: "10-15", unit: "cloves" },
  { slug: "ginger", name: "Ginger (small piece)", ta: "இஞ்சி (சிறு துண்டு)", quantity: "1", unit: "small piece" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "6-7", unit: "nos" },
  { slug: "grated-coconut", name: "Grated Coconut", ta: "துருவிய தேங்காய்", quantity: "2", unit: "handfuls (~1/4 cup)" },
  { slug: "cinnamon", name: "Cinnamon (Pattai)", ta: "இலவங்கப்பட்டை", quantity: "1", unit: "small piece" },
  { slug: "cloves", name: "Cloves (Kirambu)", ta: "கிராம்பு", quantity: "2", unit: "nos" },
  { slug: "poppy-seeds", name: "Poppy Seeds (Kasagasa / Khus Khus) — KURUMA-ILLUSION key spice", ta: "கசகசா — குருமா-மாயை முக்கிய பொருள்", quantity: "1/4", unit: "tsp", categorySlug: "nuts-seeds" },
  { slug: "fennel-seeds", name: "Fennel Seeds (Sombu)", ta: "சோம்பு", quantity: "1/4", unit: "tsp" },
  { slug: "sambar-powder", name: "Homemade Kuzhambu Thool (or Sambar Powder)", ta: "வீட்டு குழம்பு தூள் (அல்லது சாம்பார் தூள்)", quantity: "3", unit: "tbsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves (for both paste & tempering)", ta: "கருவேப்பிலை (விழுது + தாளிப்பு)", quantity: "small handful + 1 handful", unit: "" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },

  // Tempering
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, finely chopped — for tempering)", ta: "சின்ன வெங்காயம் (நன்கு நறுக்கியது — தாளிப்புக்கு)", quantity: "150", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli (slit, for tempering)", ta: "பச்சை மிளகாய் (கீறியது, தாளிப்புக்கு)", quantity: "4-5", unit: "nos" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "groundnut-oil", name: "Groundnut Oil (split: roasting + tempering)", ta: "கடலை எண்ணெய் (வறுக்க + தாளிக்க)", quantity: "200", unit: "ml total" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "thottathu-virundhu-thakkali-mozhagu-aracha-kuzhambu";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "vegetables" }) || await Category.findOne();
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
        en: "Thottathu Virundhu Thakkali Mozhagu Aracha Kuzhambu (Tomato 'Kuruma' Spiced Gravy)",
        ta: "தோட்டத்து விருந்து தக்காளி மிளகு அரைச்ச குழம்பு",
      },
      slug,
      description: {
        en: "A large-batch 'kuruma-illusion' tomato gravy from Kavithamani Akka at Thottathu Virundhu (Erode) — looks like an ordinary tomato gravy but tastes shockingly rich, almost like a non-veg kuruma. The secret is the unusual whole-spice combination added to the roast-and-grind base: cinnamon + cloves + fennel + poppy seeds (kasagasa) — the kasagasa is the lift that pushes a humble tomato gravy into kuruma territory. ¾ kg shallots and 10-12 country tomatoes give it a deep sweet-tangy backbone; a generous 3 tablespoons of homemade kuzhambu thool brings the depth. The 3-meal champion of Kongu households: make a big batch in the morning and it carries you through idli/dosa breakfast → rice lunch → idli/dosa dinner. The ultimate way to eat it: pour generously over hot Kushboo idlies with a spoonful of ghee, and let the idlies completely SOAK and drown in the gravy before the first bite.",
        ta: "ஈரோடு தோட்டத்து விருந்தின் கவிதாமணி அக்காவின் பெரிய அளவு 'குருமா-மாயை' தக்காளி குழம்பு — பார்ப்பதற்கு சாதாரண தக்காளி குழம்பு போலவே இருந்தாலும், சுவைக்கும்போது அசைவ குருமா போல ஆச்சர்யமான செழுமை. ரகசியம்: வழக்கத்துக்கு மாறான முழு மசாலா கலவை — இலவங்கப்பட்டை + கிராம்பு + சோம்பு + கசகசா — அரைப்பு அடிப்படையில் சேர்க்கப்படுகிறது; கசகசாவே சாதாரண தக்காளி குழம்பை குருமா எல்லைக்கு உயர்த்தும் தூக்கி. முக்கால் கிலோ சின்ன வெங்காயம் மற்றும் 10-12 நாட்டு தக்காளி ஆழமான இனிப்பு-புளிப்பு அடித்தளம் தருகிறது; தாராளமான 3 ஸ்பூன் வீட்டு குழம்பு தூள் ஆழம் சேர்க்கிறது. கொங்கு வீடுகளின் '3-வேளை சாம்பியன்': காலையில் ஒரு பெரிய பானை செய்தால், இட்லி/தோசை காலை → சாதம் மதியம் → இட்லி/தோசை இரவு — மூன்று வேளைக்கும் போதுமானது. சிறந்த சாப்பிடும் முறை: சூடான குஷ்பு இட்லியின் மேல் தாராளமாக ஊற்றி, ஒரு ஸ்பூன் நெய் சேர்த்து, இட்லி குழம்பில் முற்றிலும் ஊறிய பிறகே முதல் கடி.",
      },
      speciality: {
        en: "Four Thottathu Virundhu signatures define this gravy: (1) The Kuruma Illusion — looks like tomato gravy, tastes like non-veg kuruma. The trick is the whole-spice quartet added to the aracha (roast-and-grind) base: cinnamon + cloves + fennel + poppy seeds (kasagasa). Skip ANY of these and you lose the illusion. The kasagasa especially is what pushes it over the edge. (2) The 3-Meal Champion — designed deliberately for one large morning batch that covers ALL three meals: idli/dosa breakfast, rice lunch, idli/dosa dinner again. Most Kongu houses cook it this way. (3) The 'No Pottu Kadalai' Rule — Kavithamani Akka explicitly forbids roasted gram in this gravy (a common shortcut for thickening tomato gravies); pottu kadalai makes this gravy slimy (vala-valappa) and overly thick. This gravy MUST stay slightly flowy, sambar-like — not paste-like. (4) The Idli Soak Technique — the official way to eat it: pour generously over hot Kushboo idlies, drop a spoonful of ghee, and wait for the idlies to fully soak/drown in the gravy before the first bite. It's so addictive you eat extra idlies without realizing.",
        ta: "தோட்டத்து விருந்தின் நான்கு தனிச்சிறப்புகள்: (1) குருமா மாயை — தக்காளி குழம்பு போல தோற்றம், அசைவ குருமா போல சுவை. ரகசியம், அரைப்பு அடிப்படையில் சேர்க்கப்படும் முழு மசாலா கூட்டு: இலவங்கப்பட்டை + கிராம்பு + சோம்பு + கசகசா. இவற்றில் எதையாவது தவிர்த்தால் மாயை மறையும். குறிப்பாக கசகசாதான், இதை எல்லை மீறி கொண்டு செல்கிறது. (2) 3-வேளை சாம்பியன் — காலையில் ஒரே ஒரு பெரிய பானை செய்து, மூன்று வேளைக்கும் (இட்லி/தோசை காலை, சாதம் மதியம், மீண்டும் இட்லி/தோசை இரவு) போதுமான அளவில் வேண்டுமென்றே வடிவமைக்கப்பட்டது. பெரும்பாலான கொங்கு வீடுகள் இப்படியே சமைக்கின்றன. (3) 'பொட்டுக்கடலை இல்லை' விதி — கவிதாமணி அக்கா இந்த குழம்பில் பொட்டுக்கடலை சேர்ப்பதை கண்டிப்பாக தடை செய்கிறார் (தக்காளி குழம்புகளை கெட்டியாக்கும் பொதுவான குறுக்கு வழி); பொட்டுக்கடலை இந்த குழம்பை வழவழப்பாக்கி (வளவளப்ப), அதிக கெட்டியாக்கி கெடுக்கும். இந்த குழம்பு கட்டாயம் சற்று ஓடும், சாம்பார் போன்ற பதத்தில் இருக்க வேண்டும் — விழுது போல அல்ல. (4) இட்லி ஊறவைக்கும் நுட்பம் — அதிகாரப்பூர்வ சாப்பிடும் முறை: சூடான குஷ்பு இட்லியின் மேல் தாராளமாக ஊற்றி, ஒரு ஸ்பூன் நெய் சேர்த்து, இட்லி குழம்பில் முற்றிலும் ஊறி/மூழ்கும் வரை காத்திருந்து, பின் முதல் கடி. மிக மிக அடிமையாக்கும் — கூடுதலான இட்லி சாப்பிட்டதே தெரியாது.",
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
      servings: 10,
      difficulty: "medium",
      source: "youtube",
      tags: [
        "veg",
        "vegan",
        "gravy",
        "kuzhambu",
        "thakkali-kuzhambu",
        "tomato-gravy",
        "aracha-kuzhambu",
        "kuruma-illusion",
        "large-batch",
        "3-meal-recipe",
        "all-meals",
        "idli-side",
        "dosa-side",
        "rice-side",
        "naatu-thakkali",
        "country-tomato",
        "poppy-seeds",
        "kasagasa",
        "no-pottu-kadalai",
        "erode",
        "kongu",
        "tamil-nadu",
        "thottathu-virundhu",
        "kavithamani-akka",
      ],
      searchKeywords: [
        "thakkali mozhagu aracha kuzhambu",
        "thakkali kuzhambu",
        "tomato gravy kuruma style",
        "தக்காளி குழம்பு",
        "தக்காளி மிளகு அரைச்ச குழம்பு",
        "kuruma illusion tomato gravy",
        "naatu thakkali kuzhambu",
        "thottathu virundhu thakkali",
        "kavithamani akka thakkali kuzhambu",
        "kasagasa thakkali gravy",
        "poppy seeds tomato gravy",
        "3 meal kongu kuzhambu",
        "kushboo idli kuzhambu",
        "chef deena thakkali kuzhambu",
        "no pottu kadalai thakkali gravy",
        "kongu tomato gravy",
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
          title: { en: "Prep", ta: "முன் தயாரிப்பு" },
          steps: [
            {
              step: 1,
              description: {
                en: "Peel the ¾ kg of small onions for the paste and keep them whole (they'll be sautéed and ground). Separately, finely chop the 150g of tempering small onions into squares.",
                ta: "விழுதுக்கான முக்கால் கிலோ சின்ன வெங்காயத்தை தோல் சீவி முழுதாக வைக்கவும் (இவை வதங்கி அரைக்கப்படும்). தாளிப்புக்கு 150 கிராம் சின்ன வெங்காயத்தை தனியாக சதுர துண்டுகளாக நன்கு நறுக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Roughly chop the 10-12 country tomatoes (Naattu Thakkali preferred — they're smaller, tangier, and break down faster). Peel the 10-15 garlic cloves and the small piece of ginger. Slit the 4-5 green chillies for tempering.",
                ta: "10-12 நாட்டு தக்காளியை பெரிய துண்டுகளாக நறுக்கவும் (நாட்டு தக்காளி சிறந்தது — சிறியவை, அதிக புளிப்பு, விரைவில் குழையும்). 10-15 பூண்டு பற்களையும், சிறு துண்டு இஞ்சியையும் தோல் சீவவும். தாளிப்புக்கு 4-5 பச்சை மிளகாயை கீறவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Onion & Spice Base", ta: "வெங்காயம் மற்றும் மசாலா அடிப்படை வதக்கல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat a heavy-bottomed kadai over medium heat. Add 2-3 tablespoons of the groundnut oil (from the 200 ml total — save the rest for tempering).",
                ta: "ஒரு தடிமனான கடாயை மிதமான தீயில் சூடாக்கவும். மொத்த 200 மிலி கடலை எண்ணெயிலிருந்து 2-3 ஸ்பூன் ஊற்றவும் (மீதியை தாளிப்புக்கு வைக்கவும்).",
              },
            },
            {
              step: 4,
              description: {
                en: "Drop in the ¾ kg of whole small onions, the peeled garlic cloves, the ginger piece, the whole spices (1 cinnamon piece, 2 cloves, ¼ tsp poppy seeds, ¼ tsp fennel seeds), the 6-7 dry red chillies, and a small handful of curry leaves all together.",
                ta: "முக்கால் கிலோ முழு சின்ன வெங்காயம், தோல் சீவிய பூண்டு, இஞ்சி துண்டு, முழு மசாலாக்கள் (1 இலவங்கப்பட்டை, 2 கிராம்பு, ¼ ஸ்பூன் கசகசா, ¼ ஸ்பூன் சோம்பு), 6-7 காய்ந்த மிளகாய் மற்றும் சிறு கைப்பிடி கருவேப்பிலையை அனைத்தையும் ஒன்றாக சேர்க்கவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Sauté patiently on medium flame for about 2 minutes — the onions should turn slightly soft and translucent, the spices should release their aroma, but DON'T let anything brown deeply or burn.",
                ta: "மிதமான தீயில் சுமார் 2 நிமிடம் பொறுமையாக வதக்கவும் — வெங்காயம் லேசாக மிருதுவாகி பளபளப்பாக ஆக வேண்டும், மசாலாக்கள் வாசனை வீச வேண்டும் — ஆனாலும் எதையும் ஆழ பழுப்பாக்கவோ கருகவோ விட வேண்டாம்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Add the 2 handfuls of grated coconut. Toss it in the residual heat for just a few seconds — you want it warmed but NOT roasted brown.",
                ta: "2 கைப்பிடி துருவிய தேங்காய் சேர்க்கவும். எஞ்சிய வெப்பத்தில் வெறும் சில விநாடிகள் கிளறவும் — சூடாக மட்டுமே வேண்டும், பழுப்பாக வறுக்க கூடாது.",
              },
            },
            {
              step: 7,
              description: {
                en: "CRUCIAL TURN-OFF STEP: turn off the stove FIRST, then add the 3 tablespoons of kuzhambu thool (sambar powder). Mix it well in the residual heat of the pan so the raw smell of the powder fades WITHOUT burning. Adding powder to a hot flame = burnt masala = bitter gravy.",
                ta: "மிக முக்கியமான அடுப்பு-அணை படி: முதலில் அடுப்பை அணைக்கவும், பின்னர் 3 ஸ்பூன் குழம்பு தூள் (சாம்பார் தூள்) சேர்க்கவும். கடாயின் எஞ்சிய வெப்பத்தில் நன்கு கலந்து, தூளின் பச்சை வாசனை போக விடவும் — ஆனாலும் கருகாமல் இருக்க வேண்டும். தீயில் தூள் சேர்த்தால் = கருகிய மசாலா = கசக்கும் குழம்பு.",
              },
            },
            {
              step: 8,
              description: {
                en: "Transfer the entire sautéed mixture to a plate to cool to room temperature.",
                ta: "வதங்கிய கலவையை முழுவதையும் ஒரு தட்டுக்கு மாற்றி, அறை வெப்பநிலைக்கு ஆற விடவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Tomatoes", ta: "தக்காளி வதக்கல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "In the same kadai (don't wash it — the residual flavor matters), add just a tiny drop of oil and the chopped country tomatoes, the ½ tsp turmeric powder, and a little crystal salt. The salt trick: adding salt now makes the tomatoes break down significantly faster.",
                ta: "அதே கடாயில் (கழுவ வேண்டாம் — மீதமுள்ள சுவை முக்கியம்), ஒரு துளி எண்ணெய் மட்டுமே சேர்த்து, நறுக்கிய நாட்டு தக்காளி, ½ ஸ்பூன் மஞ்சள் தூள் மற்றும் சிறிது கல் உப்பு சேர்க்கவும். உப்பு ரகசியம்: இப்போது உப்பு சேர்ப்பது தக்காளியை வெகுவாக விரைவில் குழைய வைக்கும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Sauté the tomatoes vigorously on medium-high heat until they turn completely soft, mushy, and the raw smell of the tomato disappears — about 6-9 minutes. They should look like a thick, jammy paste with no chunks left. Transfer to a plate to cool completely.",
                ta: "மிதமான-உயர் தீயில், தக்காளி முற்றிலும் மிருதுவாகி, குழைந்து, பச்சை வாசனை போகும் வரை — சுமார் 6-9 நிமிடம் — வேகமாக வதக்கவும். கெட்டியான, ஜாம் போன்ற விழுதாக மாற வேண்டும் — பெரிய துண்டுகள் இருக்க கூடாது. தட்டுக்கு மாற்றி முழுமையாக ஆற விடவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "The Grind", ta: "அரைத்தல்" },
          steps: [
            {
              step: 11,
              description: {
                en: "Once BOTH the sautéed onion-spice mixture AND the cooked tomatoes have cooled completely to room temperature, transfer everything together into a large mixer jar.",
                ta: "வதங்கிய வெங்காயம்-மசாலா கலவை மற்றும் வேக வைத்த தக்காளி இரண்டுமே அறை வெப்பநிலைக்கு முற்றிலும் ஆறிய பிறகு, ஒரு பெரிய மிக்ஸியில் அனைத்தையும் ஒன்றாக சேர்க்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Grind everything into a perfectly smooth, fine paste — WITHOUT adding any extra water. The tomatoes hold enough moisture to take this all the way to a smooth paste on their own. Adding water dilutes the flavor and makes the kuruma-illusion fail.",
                ta: "அனைத்தையும் முற்றிலும் மிருதுவான, மென்மையான விழுதாக அரைக்கவும் — கூடுதலான தண்ணீர் சேர்க்க வேண்டாம். தக்காளியில் போதிய ஈரப்பதம் உள்ளது, அதுவே மிருதுவான விழுதாக மாற போதுமானது. தண்ணீர் சேர்த்தால் சுவை நீர்த்து, குருமா-மாயை தோல்வியடையும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final Tempering & Boil", ta: "இறுதி தாளிப்பு மற்றும் கொதிநிலை" },
          steps: [
            {
              step: 13,
              description: {
                en: "Heat a large vessel (big enough to hold the final gravy) over medium-high heat. Pour in the REMAINING groundnut oil (about 100-150 ml of the 200 ml total).",
                ta: "ஒரு பெரிய பாத்திரத்தை (இறுதி குழம்பு பிடிக்கும் அளவு) மிதமான-உயர் தீயில் சூடாக்கவும். மீதமுள்ள கடலை எண்ணெய் (மொத்த 200 மிலியில் சுமார் 100-150 மிலி) ஊற்றவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Add the 1 tsp mustard seeds and let them splutter completely.",
                ta: "1 ஸ்பூன் கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Toss in the 150g finely chopped small onions, the 4-5 slit green chillies, and a generous handful of fresh curry leaves. Sauté until the onions are soft but still hold their shape — do NOT over-fry them into a mush. You want them sweet but with a slight crunch left.",
                ta: "150 கிராம் நன்கு நறுக்கிய சின்ன வெங்காயம், 4-5 கீறிய பச்சை மிளகாய் மற்றும் ஒரு கைப்பிடி புதிய கருவேப்பிலை சேர்க்கவும். வெங்காயம் மிருதுவாகி, ஆனாலும் உருவம் கெடாமல் வரும் வரை வதக்கவும் — அதிகம் வறுத்து மசிய விடவும் வேண்டாம். இனிமையாக ஆனால் சிறு கொறுகொறுப்பும் தங்க வேண்டும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Pour the freshly ground smooth paste directly into the tempered vessel. Stir well to deglaze.",
                ta: "புதிதாக அரைத்த மிருதுவான விழுதை, தாளித்த பாத்திரத்தில் நேரடியாக ஊற்றவும். அடியில் ஒட்டியதை விடுவிக்க நன்கு கலக்கவும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Add enough water to bring the gravy to a SLIGHTLY FLOWY, sambar-like consistency — not a thick paste, not watery either. Critical: this gravy MUST stay slightly flowy. If you make it too thick (especially by adding pottu kadalai — explicitly forbidden here), it ruins the dish.",
                ta: "குழம்பை சற்று ஓடும், சாம்பார் போன்ற பதத்துக்கு கொண்டுவர போதிய தண்ணீர் சேர்க்கவும் — கெட்டியான விழுதாகவோ, மிக நீர்த்தாகவோ வேண்டாம். மிக முக்கியம்: இந்த குழம்பு கட்டாயம் சற்று ஓடும் பதத்தில் இருக்க வேண்டும். அதிக கெட்டியாக்கினால் (குறிப்பாக பொட்டுக்கடலை சேர்த்து — இது இங்கு கண்டிப்பாக தடை), உணவு கெடும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Taste and adjust salt if needed. Cover the vessel and let the gravy come to a rolling boil for 8 to 10 minutes — until the raw smell of the masala completely vanishes and the groundnut oil floats beautifully to the top as a glossy red layer.",
                ta: "சுவைத்து தேவையானால் உப்பு சரிசெய்யவும். பாத்திரத்தை மூடி, மசாலாவின் பச்சை வாசனை முற்றிலும் போய், மேலே கடலை எண்ணெய் பளபளக்கும் சிவப்பு அடுக்காக அழகாக மிதக்கும் வரை — 8-10 நிமிடம் நன்கு கொதிக்க விடவும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Turn off the heat. Serve this brilliant Thakkali Mozhagu Aracha Kuzhambu three ways: (a) THE Kavithamani Akka way — pour generously over hot soft Kushboo idlies, add a spoonful of ghee, and let the idlies fully soak/drown in the gravy before the first bite; (b) over steaming hot white rice with ghee; (c) with crispy dosas. Stored in the fridge, this large batch easily covers all 3 meals of the day.",
                ta: "அடுப்பை அணைக்கவும். இந்த அற்புதமான தக்காளி மிளகு அரைச்ச குழம்பை மூன்று வழிகளில் பரிமாறவும்: (அ) கவிதாமணி அக்காவின் முறை — சூடான மென்மையான குஷ்பு இட்லியின் மேல் தாராளமாக ஊற்றி, ஒரு ஸ்பூன் நெய் சேர்த்து, இட்லி குழம்பில் முற்றிலும் ஊறும் வரை காத்திருந்து முதல் கடி எடுக்கவும்; (ஆ) சூடான வெள்ளை சாதம் + நெய்யுடன்; (இ) மொறுமொறுப்பான தோசையுடன். குளிர்சாதனத்தில் வைத்தால், இந்த பெரிய பானை நாளின் 3 வேளைக்கும் எளிதில் போதும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Thakkali Mozhagu Aracha Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
