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
  { slug: "soya-chunks", name: "Soya Chunks (Meal Maker)", ta: "சோயா சங்க்ஸ் (மீல் மேக்கர்)", quantity: "2", unit: "cups (medium/mini)", categorySlug: "grains-cereals" },
  { slug: "big-onion", name: "Big Onion (finely sliced)", ta: "பெரிய வெங்காயம் (நீளமாக மெல்லியதாக நறுக்கியது)", quantity: "2-3", unit: "large" },
  { slug: "tomato", name: "Tomato (finely chopped)", ta: "தக்காளி (நன்கு நறுக்கியது)", quantity: "2", unit: "medium" },
  { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste", ta: "இஞ்சி பூண்டு விழுது", quantity: "1.5", unit: "tbsp" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1", unit: "small handful" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves (for garnish)", ta: "கொத்தமல்லி (அலங்காரம்)", quantity: "1", unit: "generous handful" },
  { slug: "fennel-seeds", name: "Fennel Seeds (Sombu)", ta: "சோம்பு", quantity: "1", unit: "tsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "1.5", unit: "tbsp" },
  { slug: "coriander-powder", name: "Coriander Powder (Malli Thool)", ta: "கொத்தமல்லி தூள்", quantity: "1", unit: "tbsp" },
  { slug: "garam-masala", name: "Garam Masala (or Meat Masala)", ta: "கரம் மசாலா (அல்லது மீட் மசாலா)", quantity: "1", unit: "tsp" },
  { slug: "black-pepper-powder", name: "Crushed Black Pepper (for finishing)", ta: "மிளகுத் தூள் (இறுதி சேர்க்கைக்கு)", quantity: "1", unit: "tsp" },
  { slug: "coconut-oil", name: "Coconut Oil (or Refined Oil)", ta: "தேங்காய் எண்ணெய் (அல்லது சுத்திகரிக்கப்பட்ட எண்ணெய்)", quantity: "3-4", unit: "tbsp" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "sri-janani-catering-soya-sukka-varattu";
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
        en: "Sri Janani Catering Soya Sukka (Mutton-Defeating Soya Varattu)",
        ta: "ஸ்ரீ ஜனனி கேட்டரிங் சோயா சுக்கா (ஆட்டிறைச்சியை வீழ்த்தும் சோயா வரட்டு)",
      },
      slug,
      description: {
        en: "A 100% vegetarian R&D recipe from Mr. Harish at Sri Janani Catering (Chennai), inspired by the legendary Kerala 'Meat Varattiyathu' (beef/mutton dry roast). Soya chunks are first boiled in salted water, then completely squeezed dry (the secret), then heavily roasted in a dark caramelized onion + tomato + mint masala base until the masala is fully trapped INSIDE the chunks — making them juicy with every bite instead of the usual dry, rubbery soya. Successfully served to 4,000+ corporate employees who literally skipped the rice to eat it as a starter. The heavy caramelization, fresh mint and full mutton-roast technique earn its title: it gives tough competition to actual mutton sukka.",
        ta: "சென்னை ஸ்ரீ ஜனனி கேட்டரிங் கடையின் திரு. ஹரிஷின் 100% சைவ R&D உணவு — பிரபலமான கேரளாவின் 'மீட் வரட்டியது' (மாட்டிறைச்சி/ஆட்டிறைச்சி உலர் வறுவல்) ஊக்கத்தில் உருவாக்கப்பட்டது. சோயா சங்க்ஸ் முதலில் உப்பு நீரில் வேக வைக்கப்பட்டு, பின் முழுமையாக நீர் கசக்கி எடுக்கப்படுகிறது (ரகசியம் இதுதான்), பின் கருகிய பெரிய வெங்காயம் + தக்காளி + புதினா மசாலா அடிப்படையில் நன்கு வறுக்கப்படுகிறது — மசாலா சோயா சங்க்ஸுக்கு உள்ளே முழுமையாக சிக்க, ஒவ்வொரு கடியிலும் சதைப்பற்றாக இருக்கும்; சாதாரண காய்ந்த, ரப்பர் போன்ற சோயாவை விட முற்றிலும் மாறானது. 4,000+ பெருநிறுவன ஊழியர்களுக்கு வெற்றிகரமாக பரிமாறப்பட்டது — பலர் சாதத்தை விட்டு இதை மட்டுமே ஸ்டார்ட்டராக சாப்பிட்டார்கள். அதிக கருகல், புதிய புதினா மற்றும் முழு ஆட்டிறைச்சி வறுவல் நுட்பம் — இதன் தலைப்பை நியாயப்படுத்துகிறது: உண்மையான ஆட்டிறைச்சி சுக்காவுக்கு கடுமையான போட்டி தரும்.",
      },
      speciality: {
        en: "Four signatures define Sri Janani's Soya Sukka: (1) The Kerala Varattiyathu Inspiration — built on the Kerala meat-varattu blueprint (heavy caramelization, dry roasting, no gravy) but with soya instead of meat; same intense dark roasted flavor profile, 100% veg. (2) The Soya Sponge Squeeze Secret — most home cooks fail because they leave water inside the boiled soya chunks; the chunks then refuse to absorb masala and taste dry. Mr. Harish squeezes EVERY drop of water out by hand before they touch the pot, which is the entire difference between juicy soya and rubbery soya. (3) The 'Trap Masala Inside' Varattu Step — a quarter cup of water is added with the spiced soya, the pot is covered briefly so the soya drinks the masala-water in, THEN the lid comes off and dry roasting starts; the masala ends up inside the chunks, not on them. (4) The Non-Veg Illusion — heavily caramelized big onions + sautéed fresh mint pudhina + mutton-roast techniques (curry leaves, fennel start, garam masala) make this dish read on the palate exactly like mutton sukka. Tested on 4,000+ corporate diners.",
        ta: "ஸ்ரீ ஜனனி சோயா சுக்காவின் நான்கு தனிச்சிறப்புகள்: (1) கேரள வரட்டியது ஊக்கம் — கேரளாவின் மீட் வரட்டு கட்டமைப்பில் (அதிக கருகல், உலர் வறுவல், குழம்பு இல்லை) கட்டப்பட்டது — இறைச்சிக்கு பதிலாக சோயா; அதே தீவிர இருண்ட வறுவல் சுவை, 100% சைவம். (2) சோயா ஸ்பாஞ்ச் கசக்கும் ரகசியம் — பெரும்பாலான வீட்டு சமையற்காரர்கள் தோல்வியடைவது வேக வைத்த சோயாவில் தண்ணீரை விட்டுவிடுவதால்; சோயா மசாலாவை உள்ளீர்க்காமல், காய்ந்து சுவையற்றதாகிறது. திரு. ஹரிஷ், சோயா பானையில் சேர்க்கும் முன், கையால் ஒவ்வொரு துளி நீரையும் கசக்கி எடுக்கிறார் — சதைப்பற்றான சோயாவுக்கும், ரப்பர் சோயாவுக்கும் இடையே உள்ள வித்தியாசம் இதுதான். (3) 'மசாலா உள்ளே சிக்கும்' வரட்டு படி — மசாலா சேர்த்த சோயாவுடன் கால் கப் தண்ணீர் சேர்க்கப்பட்டு, பானை சிறிது நேரம் மூடப்படுகிறது — சோயா மசாலா-தண்ணீரை உள்ளீர்க்கிறது; பின் மூடி திறக்கப்பட்டு உலர் வறுவல் ஆரம்பிக்கிறது; மசாலா சோயாவுக்கு வெளியே அல்லாமல், உள்ளேயே இருக்கும். (4) அசைவ மாயை — அதிக கருகிய பெரிய வெங்காயம் + வதங்கிய புதினா + ஆட்டிறைச்சி வறுவல் நுட்பங்கள் (கருவேப்பிலை, சோம்பு ஆரம்பம், கரம் மசாலா) — இந்த உணவு நாக்கில் ஆட்டிறைச்சி சுக்காவை போலவே சுவைக்கிறது. 4,000+ பெருநிறுவன பார்வையாளர்களால் சோதிக்கப்பட்டது.",
      },
      location: {
        country: "India",
      },
      prepTime: 20,
      cookingTime: 35,
      totalTime: 55,
      servings: 6,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "veg",
        "vegetarian",
        "vegan-friendly",
        "high-protein",
        "soya",
        "soya-chunks",
        "meal-maker",
        "sukka",
        "varattu",
        "dry-roast",
        "starter",
        "side-dish",
        "kerala-inspired",
        "meat-mimic",
        "non-veg-illusion",
        "sri-janani-catering",
        "harish",
        "corporate-recipe",
      ],
      searchKeywords: [
        "soya sukka",
        "soya varattu",
        "soya chunks sukka",
        "meal maker sukka",
        "சோயா சுக்கா",
        "சோயா வரட்டு",
        "vegetarian mutton sukka",
        "sri janani catering",
        "harish soya recipe",
        "mutton defeating soya",
        "kerala varattiyathu soya",
        "high protein vegetarian",
        "soya starter",
        "chef deena soya sukka",
        "corporate soya recipe",
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
          title: { en: "The Soya Sponge Prep (Crucial Step)", ta: "சோயா ஸ்பாஞ்ச் தயாரிப்பு (மிக முக்கிய படி)" },
          steps: [
            {
              step: 1,
              description: {
                en: "Bring a large vessel of water to a rolling boil. Add a pinch of crystal salt to the boiling water — salting the soak water seasons the soya from the inside out.",
                ta: "ஒரு பெரிய பாத்திரத்தில் தண்ணீர் நன்கு கொதிக்க விடவும். கொதிக்கும் தண்ணீரில் சிறிது கல் உப்பு சேர்க்கவும் — சோயாவுக்கு உள்ளிருந்தே சுவை வர இது உதவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Drop the 2 cups of soya chunks (meal maker) into the boiling water and IMMEDIATELY turn off the heat. Let them soak in the hot water (with the heat OFF) for 10 minutes — they will puff up to roughly 3x their dry size and soften completely.",
                ta: "2 கப் சோயா சங்க்ஸ் (மீல் மேக்கர்) கொதிக்கும் தண்ணீரில் சேர்த்து உடனே அடுப்பை அணைக்கவும். அடுப்பு அணைக்கப்பட்ட நிலையில் சூடான தண்ணீரில் 10 நிமிடம் ஊற விடவும் — அவை சுமார் 3 மடங்கு பருத்து, முற்றிலும் மிருதுவாகும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Drain the hot water completely. Now wash the puffed soya chunks 2-3 times in COLD water to stop the cooking and remove any beany odor.",
                ta: "சூடான தண்ணீரை முழுமையாக வடிக்கவும். பருத்த சோயா சங்க்ஸை குளிர்ந்த தண்ணீரில் 2-3 முறை கழுவவும் — இது வேக்கத்தை நிறுத்தி, பீன் வாசனையை நீக்கும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "THE SECRET STEP: take small handfuls of the soaked soya chunks and SQUEEZE THEM TIGHTLY with your hands to wring out every last drop of water. If even a little water is left inside, the chunks will refuse to absorb the masala and the entire dish will taste dry and rubbery. Set the dry, squeezed chunks aside in a dry bowl.",
                ta: "ரகசிய படி: சோயா சங்க்ஸை சிறிய அளவுகளில் எடுத்து, கையால் இறுக்கமாக கசக்கி, கடைசி துளி தண்ணீரையும் வெளியேற்றவும். உள்ளே சிறிது தண்ணீர் கூட இருந்தால், சோயா மசாலாவை உள்ளீர்க்க மறுக்கும், முழு உணவும் காய்ந்து ரப்பர் போல சுவைக்கும். கசக்கி வடிய வைத்த சோயாவை ஒரு வரண்ட பாத்திரத்தில் வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Building the Dark Masala Base", ta: "இருண்ட மசாலா அடிப்படை கட்டமைத்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Heat a heavy-bottomed kadai over medium-high heat. Pour in 3-4 tablespoons of coconut oil (for the Kerala touch) or refined oil.",
                ta: "ஒரு தடிமனான கடாயை மிதமான-உயர் தீயில் சூடாக்கவும். 3-4 ஸ்பூன் தேங்காய் எண்ணெய் (கேரள தொடுதலுக்கு) அல்லது சுத்திகரிக்கப்பட்ட எண்ணெய் ஊற்றவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Once hot, add the 1 tsp of fennel seeds and let them splutter and release their sweet aroma. Immediately follow with a generous handful of curry leaves and let them crackle.",
                ta: "எண்ணெய் சூடாகும் போது, 1 ஸ்பூன் சோம்பு சேர்த்து வெடித்து இனிய வாசனை வர விடவும். உடனே ஒரு கைப்பிடி கருவேப்பிலை சேர்த்து சீறி வெடிக்க விடவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Add the 2-3 finely sliced big onions. Sauté patiently on medium flame, stirring often, until they turn a DEEP, dark golden brown — typically 12-15 minutes. Do not rush this. The dark color and 'mutton-like' depth of the final sukka comes entirely from how well these onions caramelize.",
                ta: "2-3 மெல்லியதாக நறுக்கிய பெரிய வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, ஆழமான இருண்ட பழுப்பு பொன்னிறம் வரும் வரை — சுமார் 12-15 நிமிடம் — பொறுமையாக வதக்கவும். அவசரப்பட வேண்டாம். இறுதி சுக்காவின் இருண்ட நிறம் மற்றும் 'ஆட்டிறைச்சி போன்ற' ஆழம் — வெங்காயம் எவ்வளவு நன்கு கருகுகிறது என்பதையே சார்ந்து உள்ளது.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the 1½ tablespoons of ginger-garlic paste. Sauté vigorously for 1-2 minutes until the raw, pungent smell completely disappears.",
                ta: "1½ ஸ்பூன் இஞ்சி-பூண்டு விழுதை சேர்க்கவும். பச்சை வாசனை முற்றிலும் போகும் வரை 1-2 நிமிடம் வேகமாக வதக்கவும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Toss in the small handful of fresh mint leaves (pudhina). Sauté for 30-60 seconds — sautéing mint directly in the hot caramelized-onion oil is the secret to the 'mutton/biryani' aroma that makes this dish read as non-veg.",
                ta: "ஒரு கைப்பிடி புதிய புதினாவை சேர்க்கவும். 30-60 விநாடிகள் வதக்கவும் — கருகிய வெங்காயம்-எண்ணெயில் புதினாவை நேரடியாக வதக்குவதே, இந்த உணவை அசைவம் போல சுவைக்க வைக்கும் 'ஆட்டிறைச்சி/பிரியாணி' வாசனையின் ரகசியம்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "The Spice Infusion", ta: "மசாலா இணைப்பு" },
          steps: [
            {
              step: 10,
              description: {
                en: "Add the 2 finely chopped tomatoes and crystal salt to taste. Sauté vigorously on medium-high heat until the tomatoes break down COMPLETELY and mash into the onion-mint base — no visible tomato chunks should remain. About 5-7 minutes.",
                ta: "2 நன்கு நறுக்கிய தக்காளி மற்றும் தேவையான கல் உப்பு சேர்க்கவும். மிதமான-உயர் தீயில், தக்காளி முற்றிலும் குழைந்து, வெங்காயம்-புதினா அடிப்படையுடன் ஒன்றாக மசிந்து விடும் வரை — பெரிய துண்டுகள் தெரியக்கூடாது — சுமார் 5-7 நிமிடம் வேகமாக வதக்கவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Lower the heat. Add the ½ tsp turmeric powder, 1½ tablespoons red chilli powder, 1 tablespoon coriander powder, and 1 tsp garam masala (or meat masala for an even stronger non-veg illusion).",
                ta: "தீயை குறைக்கவும். ½ ஸ்பூன் மஞ்சள் தூள், 1½ ஸ்பூன் மிளகாய் தூள், 1 ஸ்பூன் கொத்தமல்லி தூள் மற்றும் 1 ஸ்பூன் கரம் மசாலா (அல்லது அதிக அசைவ மாயைக்கு மீட் மசாலா) சேர்க்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Sauté the dry spices in the oil for about a minute until the raw smell leaves and the masala turns into a thick, glossy, aromatic paste with oil starting to separate at the edges. Critical: don't burn the powders or the whole dish turns bitter.",
                ta: "தூள்கள் எண்ணெயில் வதங்கி, பச்சை வாசனை போய், கெட்டியான பளபளக்கும் வாசனை மிக்க விழுதாக மாறி, ஓரத்தில் எண்ணெய் பிரிய ஆரம்பிக்கும் வரை சுமார் 1 நிமிடம் வதக்கவும். மிக முக்கியம்: தூள்களை கருக விட வேண்டாம், இல்லையென்றால் முழு உணவும் கசக்கும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Varattu (Roasting) Process", ta: "வரட்டு (வறுவல்) செய்முறை" },
          steps: [
            {
              step: 13,
              description: {
                en: "Drop the squeezed-dry soya chunks directly into the thick masala base. Toss everything together with a spatula so every single chunk is heavily, fully coated in the dark spice paste.",
                ta: "கசக்கி வடிய வைத்த சோயா சங்க்ஸை நேரடியாக கெட்டியான மசாலா அடிப்படையில் சேர்க்கவும். ஒவ்வொரு சங்க்கும் இருண்ட மசாலா விழுதில் முழுமையாக, அதிகமாக படியும்படி கரண்டியால் கலக்கவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Pour in JUST a quarter cup of water — very little! The water is only there so the masala doesn't burn during the brief covered phase and so the dry soya can drink in the masala-flavored liquid.",
                ta: "வெறும் கால் கப் தண்ணீர் ஊற்றவும் — மிக குறைவாக! மூடியின் கீழ் சிறிது நேரம் இருக்கும் போது மசாலா கருகாமல் இருக்கவும், காய்ந்த சோயா மசாலா-சாற்றை உள்ளீர்க்கவும் மட்டுமே இந்த தண்ணீர்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Cover the kadai and let it cook on a LOW flame for 5 to 7 minutes. During this time, the dry soya chunks drink in the masala-water and the spices migrate INSIDE the chunks — this is the 'trap masala inside' moment.",
                ta: "கடாயை மூடி, குறைந்த தீயில் 5-7 நிமிடம் வேக விடவும். இந்த நேரத்தில், காய்ந்த சோயா சங்க்ஸ் மசாலா-தண்ணீரை உள்ளீர்த்து, மசாலா சங்க்ஸுக்கு உள்ளே சேர்ந்துவிடும் — இதுவே 'மசாலா உள்ளே சிக்கும்' தருணம்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Remove the lid. The water should be almost completely absorbed. Now INCREASE the heat slightly and start the varattu (dry roasting) — keep tossing/stirring the soya continuously so it doesn't stick or burn.",
                ta: "மூடியை எடுக்கவும். தண்ணீர் கிட்டத்தட்ட முழுமையாக உள்ளீர்க்கப்பட்டிருக்கும். இப்போது தீயை லேசாக அதிகரித்து, வரட்டு (உலர் வறுவல்) படியை ஆரம்பிக்கவும் — ஒட்டாமல், கருகாமல் இருக்க, சோயாவை தொடர்ந்து புரட்டி கிளறவும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Keep roasting until the mixture becomes COMPLETELY dry, dark, and you can see the oil glistening on the OUTSIDE of the soya chunks — this is the visual 'done' signal. Typically 6-10 minutes of constant tossing.",
                ta: "கலவை முற்றிலும் காய்ந்து, இருண்டு, சோயா சங்க்ஸின் வெளியே எண்ணெய் பளபளப்பாக தெரியும் வரை வறுக்கவும் — இதுவே 'தயார்' என்பதற்கான அடையாளம். தொடர்ந்து புரட்டினால் சுமார் 6-10 நிமிடம்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final Kick & Serving", ta: "இறுதி காரம் மற்றும் பரிமாறுதல்" },
          steps: [
            {
              step: 18,
              description: {
                en: "Sprinkle the 1 tsp of crushed black pepper generously over the top. Give it one final, rigorous toss for that authentic sukka-style spicy kick — the pepper goes in only at the end so it stays sharp and aromatic, not cooked out.",
                ta: "1 ஸ்பூன் நசுக்கிய மிளகுத் தூளை மேலே தாராளமாக தூவவும். அசலான சுக்கா பாணி காரத்துக்காக ஒரு இறுதி முறை வேகமாக புரட்டி கலக்கவும் — மிளகை கடைசியில் மட்டுமே சேர்ப்பதால், அதன் கூர்மை மற்றும் வாசனை இழக்காமல் தங்கும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Turn off the heat. Garnish with a generous handful of freshly chopped coriander leaves.",
                ta: "அடுப்பை அணைக்கவும். தாராளமான கைப்பிடி புதிதாக நறுக்கிய கொத்தமல்லியை தூவவும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Serve this high-protein, juicy, non-veg-illusion Soya Sukka three ways: (a) as a standalone starter or party bowl — Chef Deena literally wipes the plate clean with this one; (b) rolled inside a hot chapathi or parotta with a slice of raw onion; or (c) mixed into hot rasam rice as a side. Equally good cold the next day.",
                ta: "இந்த உயர்-புரத, சதைப்பற்றான, அசைவ-மாயை சோயா சுக்காவை மூன்று வழிகளில் பரிமாறவும்: (அ) தனியான ஸ்டார்ட்டர் அல்லது விருந்து கிண்ணமாக — சமையற்காரர் டீனா அரை நிமிடத்தில் தட்டை வெறுமையாக்கினார்; (ஆ) சூடான சப்பாத்தி அல்லது பரோட்டாவில் சுருட்டி பச்சை வெங்காய துண்டுடன்; (இ) சூடான ரசம் சாதத்துடன் தொட்டுக்கொள்ளும் சைடாக. மறுநாள் குளிர்ந்தாலும் சமமான ருசி.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Sri Janani Soya Sukka recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
