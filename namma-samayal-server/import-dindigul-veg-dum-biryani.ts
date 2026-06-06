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
  // Main
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "2", unit: "kg" },
  { slug: "carrot", name: "Carrots (chopped)", ta: "காரட் (நறுக்கியது)", quantity: "250", unit: "g" },
  { slug: "green-beans", name: "Green Beans / French Beans (chopped)", ta: "பீன்ஸ் (நறுக்கியது)", quantity: "250", unit: "g", categorySlug: "vegetables" },
  { slug: "dry-green-peas", name: "Dry Green Peas (Pachai Pattani) — soaked 3 hrs, pressure-cooked 2 whistles", ta: "காய்ந்த பச்சை பட்டாணி — 3 மணி நேரம் ஊறவைத்து, 2 விசில் வேக வைக்கவும்", quantity: "250", unit: "g", categorySlug: "vegetables" },

  // Aromatic base (Dual Onion, shallot-HEAVY)
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, coarsely crushed) — 4:1 vs big onions", ta: "சின்ன வெங்காயம் (கரகரப்பாக நசுக்கியது) — பெரிய வெங்காயத்தை விட 4:1", quantity: "400", unit: "g" },
  { slug: "big-onion", name: "Big Onion (Pallari, finely sliced)", ta: "பெரிய வெங்காயம் (மெல்லியதாக நறுக்கியது)", quantity: "100", unit: "g" },
  { slug: "tomato", name: "Tomato (roughly chopped — kept LOW to avoid 'tomato rice' taste)", ta: "தக்காளி (பெரிய துண்டுகளாக — 'தக்காளி சாதம்' சுவை வராமல் குறைவாக)", quantity: "100", unit: "g" },
  { slug: "garlic", name: "Garlic Paste (freshly ground, coarse) — 2:1 vs ginger", ta: "பூண்டு விழுது (புதிய, கரகரப்பான) — இஞ்சியை விட 2:1", quantity: "200", unit: "g" },
  { slug: "ginger", name: "Ginger Paste (freshly ground)", ta: "இஞ்சி விழுது (புதிய)", quantity: "100", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli (slit)", ta: "பச்சை மிளகாய் (கீறியது)", quantity: "5", unit: "nos" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina) — sautéed FIRST for flavor extraction", ta: "புதினா — சுவை வெளியேற்றத்துக்கு முதலில் வதக்கப்படுகிறது", quantity: "1", unit: "handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli)", ta: "கொத்தமல்லி", quantity: "1", unit: "handful" },

  // Fats, dairy, spices
  { slug: "groundnut-oil", name: "Groundnut Oil (Kadalai Ennai)", ta: "கடலை எண்ணெய்", quantity: "200", unit: "ml" },
  { slug: "ghee", name: "Ghee (Nei)", ta: "நெய்", quantity: "250", unit: "ml" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder — added DIRECTLY to hot oil (color trick)", ta: "மிளகாய் தூள் — சூடான எண்ணெயில் நேரடியாக சேர்க்கப்படுகிறது (நிற ரகசியம்)", quantity: "15", unit: "g" },
  { slug: "cashew-nuts", name: "Cashew Nuts", ta: "முந்திரி", quantity: "50", unit: "g" },
  { slug: "curd", name: "Curd (Thayir)", ta: "தயிர்", quantity: "50", unit: "ml" },
  { slug: "lemon", name: "Lemon (juiced)", ta: "எலுமிச்சை (சாறு)", quantity: "1/2", unit: "no" },
  { slug: "cinnamon", name: "Cinnamon (Pattai) — GROUND with cardamom & cloves (not whole)", ta: "இலவங்கப்பட்டை — ஏலக்காய் + கிராம்புடன் அரைக்கப்படுகிறது (முழுதாக அல்ல)", quantity: "10", unit: "g" },
  { slug: "cardamom", name: "Cardamom (Yelakkai) — GROUND not whole", ta: "ஏலக்காய் — அரைக்கப்படுகிறது", quantity: "5", unit: "g" },
  { slug: "cloves", name: "Cloves (Kirambu) — GROUND not whole", ta: "கிராம்பு — அரைக்கப்படுகிறது", quantity: "2.5", unit: "g" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "dindigul-jaffer-veg-dum-biryani";
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
        en: "Dindigul Jaffer Veg Dum Biryani (Wedding-Style Vegetarian, 'Mutton-Style' Base)",
        ta: "திண்டுக்கல் ஜாஃபர் சைவ தம் பிரியாணி (கல்யாண பாணி, 'ஆட்டிறைச்சி-பாணி' அடிப்படை)",
      },
      title: "Dindigul Jaffer Veg Dum Biryani",
      slug,
      description: {
        en: "The legendary vegetarian dum biryani from Dindigul Jaffer Catering (Professor Mr. Yasin) — built deliberately on the same intense, rich masala BASE as their famous mutton biryani so the dish has a deep, savory complexity instead of tasting like a generic vegetable pulao. Four uncompromising Jaffer signatures define it: (1) the 'mutton-style' base technique scaled to veg, (2) the 'color trick' where red chilli powder is added DIRECTLY into the hot oil right after mint + onion for that signature Dindigul deep reddish-brown color (no artificial colors), (3) the powdered whole spices — cinnamon, cardamom, cloves are pre-ground to a fine powder (NOT thrown in whole) so the aroma distributes evenly and diners never bite into them, and (4) the shallot-dominant 4:1 onion ratio (400g crushed small onions + 100g big onions) plus the deliberately LOW 100g tomato to avoid a 'tomato rice' taste. Finished on a 20-minute coal-and-weight dum on Seeraga Samba.",
        ta: "திண்டுக்கல் ஜாஃபர் கேட்டரிங்கின் (பேராசிரியர் திரு. யாசின்) புகழ்பெற்ற சைவ தம் பிரியாணி — பொதுவான காய்கறி புலாவ் போல சுவைக்காமல், ஆழமான, செழுமையான சிக்கல் தர, தங்களின் புகழ்பெற்ற ஆட்டிறைச்சி பிரியாணியின் அதே தீவிர மசாலா அடிப்படையில் வேண்டுமென்றே கட்டப்பட்டுள்ளது. நான்கு கட்டாய ஜாஃபர் தனிச்சிறப்புகள்: (1) 'ஆட்டிறைச்சி-பாணி' அடிப்படை நுட்பம் சைவத்துக்கு பயன்படுத்தப்படுகிறது, (2) 'நிற ரகசியம்' — புதினா + வெங்காயம் வதக்கிய பிறகு, மிளகாய் தூள் சூடான எண்ணெயில் நேரடியாக சேர்க்கப்பட்டு, செயற்கை நிறம் இல்லாமலேயே தனிச்சிறப்பான திண்டுக்கல் ஆழமான சிவப்பு-பழுப்பு நிறம் வருகிறது, (3) அரைத்த முழு மசாலா — இலவங்கப்பட்டை, ஏலக்காய், கிராம்பு முன்பே மிருதுவான தூளாக அரைக்கப்படுகிறது (முழுதாக போடப்படவில்லை), இதனால் வாசனை சீராக பரவுகிறது மற்றும் சாப்பிடுபவர்கள் தவறுதலாக கடிக்க மாட்டார்கள், (4) சின்ன வெங்காய ஆதிக்க 4:1 வெங்காய விகிதம் (400 கிராம் நசுக்கிய சின்ன வெங்காயம் + 100 கிராம் பெரிய வெங்காயம்) மற்றும் 'தக்காளி சாதம்' சுவை வராமல் தடுக்க வேண்டுமென்றே குறைந்த 100 கிராம் தக்காளி. சீரக சம்பாவில் 20-நிமிட கரி-மற்றும்-பாரம் தம்மில் முடிக்கப்படுகிறது.",
      },
      speciality: {
        en: "Four uncompromising Jaffer Catering signatures define this Dindigul Wedding-style Veg Dum Biryani: (1) The 'Mutton-Style' Base — most veg biryanis use a light pulao-style base; Jaffer Catering instead uses the EXACT same intense onion-garlic-ghee base as their famous mutton biryani, just with vegetables instead of meat. The result tastes deep, savory and complex, never light or sweet like a vegetable pulao. (2) The Color Trick in Oil — instead of artificial color or piling on tomatoes (which would make a 'tomato rice'), the chefs add 15g of red chilli powder DIRECTLY into the hot oil right after sautéing the mint and big onions. The oil instantly absorbs and magnifies the color, giving the entire biryani that signature deep Dindigul reddish-brown hue without overloading on acid. (3) The Powdered Whole Spices — unlike Chennai-style biryanis where cinnamon + cardamom + cloves are thrown into the oil whole, Dindigul grinds them dry into a fine spice powder BEFORE cooking. This stops diners from accidentally biting into a whole clove or cardamom pod AND distributes the aroma evenly across every grain. (4) The 4:1 Shallot Dominance + Low-Tomato Rule — 400g of coarsely crushed shallots (NOT finely ground) vs just 100g of big onions; and ONLY 100g of tomato (commercial Dindigul wisdom: more tomato = 'tomato rice' taste, less tomato = clean Seeraga Samba flavor). The shallot dominance gives the dish its rustic Kongu wedding-feast sweetness.",
        ta: "இந்த திண்டுக்கல் கல்யாண பாணி சைவ தம் பிரியாணியின் நான்கு கட்டாய ஜாஃபர் கேட்டரிங் தனிச்சிறப்புகள்: (1) 'ஆட்டிறைச்சி-பாணி' அடிப்படை — பெரும்பாலான சைவ பிரியாணிகள் இலகுவான புலாவ்-பாணி அடிப்படை பயன்படுத்துகின்றன; ஜாஃபர் கேட்டரிங் தங்களின் புகழ்பெற்ற ஆட்டிறைச்சி பிரியாணியின் அதே தீவிர வெங்காயம்-பூண்டு-நெய் அடிப்படையை பயன்படுத்துகிறது, இறைச்சிக்கு பதிலாக காய்கறிகள் மட்டும். முடிவு: ஆழமான, சுவையான, சிக்கலான சுவை — இலகுவான அல்லது இனிமையான காய்கறி புலாவ் போல இல்லை. (2) எண்ணெயில் நிற ரகசியம் — செயற்கை நிறம் அல்லது அதிக தக்காளி ('தக்காளி சாதம்' சுவை) இல்லாமல், சமையற்காரர்கள் புதினா + பெரிய வெங்காயம் வதக்கிய பிறகு 15 கிராம் மிளகாய் தூளை சூடான எண்ணெயில் நேரடியாக சேர்க்கின்றனர். எண்ணெய் உடனடியாக நிறத்தை உள்ளீர்த்து பெரிதாக்குகிறது — அமிலத்தை அதிகரிக்காமல், முழு பிரியாணிக்கும் தனிச்சிறப்பான திண்டுக்கல் ஆழமான சிவப்பு-பழுப்பு நிறம் கொடுக்கிறது. (3) அரைத்த முழு மசாலாக்கள் — சென்னை-பாணி பிரியாணியில் இலவங்கப்பட்டை + ஏலக்காய் + கிராம்பு முழுதாக எண்ணெயில் போடப்படுகின்றன; திண்டுக்கல் சமைப்பதற்கு முன்பே வரண்டே மிருதுவான மசாலா தூளாக அரைக்கிறது. இது சாப்பிடுபவர்கள் கிராம்பு அல்லது ஏலக்காய் ஆகியவற்றை தவறுதலாக கடிக்காமல் தடுக்கிறது மற்றும் வாசனையை ஒவ்வொரு தானியத்திலும் சீராக பரப்புகிறது. (4) 4:1 சின்ன வெங்காய ஆதிக்கம் + குறைந்த தக்காளி விதி — 400 கிராம் கரகரப்பாக நசுக்கிய சின்ன வெங்காயம் (நன்கு அரைக்கப்படவில்லை) எதிராக வெறும் 100 கிராம் பெரிய வெங்காயம்; மற்றும் வெறும் 100 கிராம் தக்காளி (வணிக திண்டுக்கல் ஞானம்: அதிக தக்காளி = 'தக்காளி சாதம்' சுவை, குறைந்த தக்காளி = தூய சீரக சம்பா சுவை). சின்ன வெங்காய ஆதிக்கம் உணவுக்கு கிராமத்து கொங்கு கல்யாண-விருந்து இனிமையை தருகிறது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        city: "Dindigul",
      },
      prepTime: 40,
      cookingTime: 75,
      totalTime: 115,
      servings: 15,
      difficulty: "hard",
      source: "youtube",
      tags: [
        "veg",
        "vegetarian",
        "biryani",
        "veg-biryani",
        "vegetable-biryani",
        "dum-biryani",
        "dindigul",
        "wedding-biryani",
        "kalyana-biryani",
        "jaffer-catering",
        "professor-yasin",
        "seeraga-samba",
        "mutton-style-veg",
        "color-trick",
        "powdered-whole-spices",
        "shallot-heavy",
        "low-tomato",
        "feast",
        "virundhu",
        "tamil-nadu",
        "iconic",
        "commercial-recipe",
      ],
      searchKeywords: [
        "dindigul veg biryani",
        "dindigul vegetable biryani",
        "jaffer veg biryani",
        "professor yasin veg biryani",
        "திண்டுக்கல் சைவ பிரியாணி",
        "ஜாஃபர் சைவ பிரியாணி",
        "wedding veg biryani",
        "kalyana veetu veg biryani",
        "seeraga samba veg biryani",
        "mutton style veg biryani",
        "dindigul veg dum biryani",
        "chef deena veg biryani",
        "vegetarian dum biryani recipe",
        "tamil nadu veg biryani",
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
                en: "Wash the 2 kg of Seeraga Samba rice gently 2-3 times until the water runs clear. Soak in fresh water for 20 minutes. Drain just before adding to the broth.",
                ta: "2 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவவும். 20 நிமிடம் சுத்தமான தண்ணீரில் ஊறவைக்கவும். சாற்றில் சேர்ப்பதற்கு சற்று முன்பு வடிக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Soak the 250g of dry green peas (pachai pattani) in plenty of fresh water for 3 HOURS. Drain, transfer to a pressure cooker with fresh water, and cook for EXACTLY 2 whistles. Don't over-cook — they should still hold their shape, not turn mushy.",
                ta: "250 கிராம் காய்ந்த பச்சை பட்டாணியை நிறைய சுத்தமான தண்ணீரில் 3 மணி நேரம் ஊறவைக்கவும். வடித்து, புதிய தண்ணீருடன் குக்கரில் சேர்த்து, சரியாக 2 விசில் வேக வைக்கவும். அதிகம் வேக விட வேண்டாம் — அவை தனது வடிவத்தை தாங்க வேண்டும், குழைய கூடாது.",
              },
            },
            {
              step: 3,
              description: {
                en: "Chop the 250g of carrots and 250g of green beans into medium uniform pieces (about 1.5 cm). Uniform size = uniform cooking. Set aside.",
                ta: "250 கிராம் காரட் மற்றும் 250 கிராம் பீன்ஸை சீரான நடுத்தர துண்டுகளாக (சுமார் 1.5 செமீ) நறுக்கவும். சீரான அளவு = சீரான சமையல். தனியாக வைக்கவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Peel the 400g of small onions and COARSELY CRUSH them with the side of a knife or a heavy mortar — don't grind smooth or finely chop. Coarse crush is the Dindigul signature; it releases the aroma while letting pieces dissolve into the gravy. Finely slice the 100g of big onions. Roughly chop the 100g of tomatoes. Slit the 5 green chillies.",
                ta: "400 கிராம் சின்ன வெங்காயத்தை தோல் சீவி, கத்தியின் பக்கத்தால் அல்லது கனமான அம்மிக்கல்லால் கரகரப்பாக நசுக்கவும் — மிருதுவாக அரைக்கவோ நன்கு நறுக்கவோ வேண்டாம். கரகரப்பாக நசுக்குதல் திண்டுக்கல் தனிச்சிறப்பு; வாசனையை வெளியேற்றும், துண்டுகள் குழம்பில் கரையும். 100 கிராம் பெரிய வெங்காயத்தை மெல்லியதாக நறுக்கவும். 100 கிராம் தக்காளியை பெரிய துண்டுகளாக நறுக்கவும். 5 பச்சை மிளகாயை கீறவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Grind a FRESH coarse garlic paste from 200g of garlic (slightly grainy, not silky-smooth). Grind a SEPARATE fresh ginger paste from 100g of ginger. The 2:1 garlic-to-ginger ratio is Dindigul commercial wisdom.",
                ta: "200 கிராம் பூண்டை புதிய கரகரப்பான விழுதாக அரைக்கவும் (சற்று கரகரப்பாக, மிருதுவாக அல்ல). 100 கிராம் இஞ்சியை தனியாக புதிய விழுதாக அரைக்கவும். 2:1 பூண்டு-இஞ்சி விகிதம் திண்டுக்கல் வணிக ஞானம்.",
              },
            },
            {
              step: 6,
              description: {
                en: "POWDERED-SPICE STEP: in a dry mixer, grind the 10g cinnamon + 5g cardamom + 2.5g cloves together into a fine spice powder. This is the Dindigul technique — most biryanis throw these whole into the oil, but the dry powder distributes the aroma evenly AND no one bites into a whole clove.",
                ta: "அரைத்த-மசாலா படி: வரண்ட மிக்ஸியில் 10 கிராம் இலவங்கப்பட்டை + 5 கிராம் ஏலக்காய் + 2.5 கிராம் கிராம்பை சேர்த்து மிருதுவான மசாலா தூளாக அரைக்கவும். இது திண்டுக்கல் நுட்பம் — பெரும்பாலான பிரியாணிகள் இவற்றை முழுதாக எண்ணெயில் போடுகின்றன, ஆனால் வரண்ட தூள் வாசனையை சீராக பரப்புகிறது மற்றும் யாரும் முழு கிராம்பை கடிக்க மாட்டார்கள்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Flavor Extraction (Mint First!)", ta: "சுவை வெளியேற்றம் (முதலில் புதினா!)" },
          steps: [
            {
              step: 7,
              description: {
                en: "Place a heavy-bottomed biryani dekchi over medium-high heat. Pour in the 200 ml of cold-pressed groundnut oil and the FULL 250 ml of pure ghee. The oil prevents the ghee from burning during the long sauté.",
                ta: "ஒரு தடிமனான பிரியாணி தேக்சியை மிதமான-உயர் தீயில் வைக்கவும். 200 மிலி மரச்செக்கு கடலை எண்ணெய் மற்றும் முழு 250 மிலி தூய நெய் ஊற்றவும். எண்ணெய் நீண்ட வதக்குதலில் நெய் கருகாமல் தடுக்கும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "FLAVOR-FIRST SIGNATURE STEP: once the fat is hot, drop in the FULL handful of fresh mint leaves directly. Most biryanis add mint after the masala; Dindigul Jaffer adds it FIRST so its herbal oils saturate the fat layer right from the start — every later ingredient picks up the mint perfume.",
                ta: "சுவை-முதல் தனிச்சிறப்பு படி: கொழுப்பு சூடாகும் போது, முழு கைப்பிடி புதினாவை நேரடியாக சேர்க்கவும். பெரும்பாலான பிரியாணிகள் மசாலாவுக்கு பிறகு புதினா சேர்க்கின்றன; திண்டுக்கல் ஜாஃபர் முதலில் சேர்க்கிறார்கள், இதனால் ஆரம்பத்திலிருந்தே மூலிகை எண்ணெய்கள் கொழுப்பு அடுக்கை நிறைக்கின்றன — பின் சேர்க்கப்படும் ஒவ்வொரு பொருளும் புதினா வாசனையை உள்ளீர்க்கின்றன.",
              },
            },
            {
              step: 9,
              description: {
                en: "Add the 100g of finely sliced big onions. Sauté patiently on medium heat, stirring often, until soft and translucent — about 5-7 minutes. Don't darken them — Dindigul style stays light.",
                ta: "100 கிராம் மெல்லியதாக நறுக்கிய பெரிய வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, மிருதுவாகி பளபளப்பாகும் வரை — சுமார் 5-7 நிமிடம் — பொறுமையாக வதக்கவும். கருக்க வேண்டாம் — திண்டுக்கல் பாணி லேசாக இருக்கிறது.",
              },
            },
            {
              step: 10,
              description: {
                en: "THE COLOR TRICK: lower the flame slightly. Add the 15g of red chilli powder DIRECTLY into the hot oil and sauté for 10-20 seconds — just enough so the oil turns a deep, glowing red. CRITICAL: don't burn the powder (it'll turn black and bitter in seconds); 10-20 seconds, then move on. This is the secret to Dindigul's signature dark reddish-brown color without artificial colors or extra tomatoes.",
                ta: "நிற ரகசியம்: தீயை சற்று குறைக்கவும். 15 கிராம் மிளகாய் தூளை சூடான எண்ணெயில் நேரடியாக சேர்த்து, 10-20 விநாடிகள் வதக்கவும் — எண்ணெய் ஆழமான, ஒளிரும் சிவப்பாக மாற போதும். மிக முக்கியம்: தூளை கருக விட வேண்டாம் (விநாடிகளில் கருப்பாகி கசக்கும்); 10-20 விநாடிகள், பின் தொடரவும். இதுவே செயற்கை நிறம் அல்லது அதிக தக்காளி இல்லாமல் திண்டுக்கல் தனிச்சிறப்பான ஆழமான சிவப்பு-பழுப்பு நிறத்தின் ரகசியம்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Building the Masala (Powdered Spices First)", ta: "மசாலா கட்டமைத்தல் (அரைத்த தூள் முதலில்)" },
          steps: [
            {
              step: 11,
              description: {
                en: "Add the freshly ground dry spice powder (cinnamon + cardamom + cloves) from step 6 into the now reddish hot oil. Stir for 10-15 seconds — the powder will bloom in the oil and release a royal aroma.",
                ta: "படி 6-இல் தயாரித்த புதிய அரைத்த வரண்ட மசாலா தூளை (இலவங்கப்பட்டை + ஏலக்காய் + கிராம்பு) இப்போது சிவப்பாகிய சூடான எண்ணெயில் சேர்க்கவும். 10-15 விநாடிகள் கிளறவும் — தூள் எண்ணெயில் மலர்ந்து அரசியல் வாசனை வெளியேற்றும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add the coarse GARLIC paste (200g) FIRST. Sauté vigorously for 2-3 minutes, stirring constantly so it doesn't catch at the bottom — the raw garlic smell must completely vanish. Then add the GINGER paste (100g) and sauté another 1-2 minutes until raw smell goes.",
                ta: "கரகரப்பான பூண்டு விழுதை (200 கிராம்) முதலில் சேர்க்கவும். 2-3 நிமிடம் வேகமாக, அடியில் ஒட்டாமல் இருக்க தொடர்ந்து கிளறி வதக்கவும் — பச்சை பூண்டு வாசனை முற்றிலும் போக வேண்டும். பின் இஞ்சி விழுதை (100 கிராம்) சேர்த்து, பச்சை வாசனை போகும் வரை மேலும் 1-2 நிமிடம் வதக்கவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "SHALLOT TIME: add the FULL 400g of coarsely crushed small onions. Sauté vigorously — they'll release moisture and the masala will start looking glossy. Keep going until the raw smell completely disappears and the oil starts separating at the edges — about 8-10 minutes.",
                ta: "சின்ன வெங்காய நேரம்: முழு 400 கிராம் கரகரப்பாக நசுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். வேகமாக வதக்கவும் — அவை ஈரம் வெளியிட்டு மசாலா பளபளப்பாக காணப்படும். பச்சை வாசனை முற்றிலும் போய், ஓரத்தில் எண்ணெய் பிரிய ஆரம்பிக்கும் வரை — சுமார் 8-10 நிமிடம் — தொடர்ந்து வதக்கவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Pour in a SPLASH of water (about 100 ml) — this prevents the heavy garlic-ginger paste from catching at the bottom and burning. Stir to deglaze.",
                ta: "சிறிது தண்ணீர் (சுமார் 100 மிலி) ஊற்றவும் — இது கனமான பூண்டு-இஞ்சி விழுது அடியில் ஒட்டி கருகாமல் தடுக்கிறது. அடியில் ஒட்டியதை விடுவிக்க கிளறவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Veggie Roast (Don't Overcook!)", ta: "காய்கறி வறுவல் (அதிகம் வேக விட வேண்டாம்!)" },
          steps: [
            {
              step: 15,
              description: {
                en: "Add the 100g of chopped tomatoes (LOW quantity is deliberate — more tomato = 'tomato rice' taste). Add the handful of fresh coriander leaves, the 50g of cashew nuts, and the 5 slit green chillies. Sauté until the tomatoes break down — about 4-5 minutes.",
                ta: "100 கிராம் நறுக்கிய தக்காளியை சேர்க்கவும் (குறைந்த அளவு வேண்டுமென்றே — அதிக தக்காளி = 'தக்காளி சாதம்' சுவை). ஒரு கைப்பிடி புதிய கொத்தமல்லி, 50 கிராம் முந்திரி, மற்றும் 5 கீறிய பச்சை மிளகாயை சேர்க்கவும். தக்காளி குழையும் வரை — சுமார் 4-5 நிமிடம் — வதக்கவும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Drop in the chopped carrots and chopped green beans along with crystal salt to taste. Sauté the vegetables in the intense masala for ONLY 2 minutes — not more. Critical chef's tip: don't overcook the veg here, or they'll turn into mush later during dum.",
                ta: "நறுக்கிய காரட் மற்றும் பீன்ஸை, தேவையான கல் உப்புடன் சேர்க்கவும். தீவிர மசாலாவில் காய்கறிகளை வெறும் 2 நிமிடம் மட்டுமே வதக்கவும் — அதற்கு மேல் இல்லை. மிக முக்கியமான சமையற்காரர் குறிப்பு: இங்கு காய்கறிகளை அதிகம் வேக விட வேண்டாம், இல்லையென்றால் தம் கட்டத்தில் அவை குழைந்துவிடும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Stir in the 50 ml of thick curd gradually. Mix until the masala looks uniform and creamy.",
                ta: "50 மிலி கெட்டியான தயிரை மெதுவாக சேர்க்கவும். மசாலா சீராக, வெண்மை போல காணப்படும் வரை கலக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Boiling Broth", ta: "கொதிக்கும் சாறு" },
          steps: [
            {
              step: 18,
              description: {
                en: "Add the pre-cooked green peas (from step 2) directly into the vessel and stir gently.",
                ta: "முன் வேக வைத்த பச்சை பட்டாணியை (படி 2) பாத்திரத்தில் நேரடியாக சேர்த்து மெதுவாக கலக்கவும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Pour in 3 LITERS of water for the 2 kg of Seeraga Samba rice (the 1:1.5 Seeraga Samba ratio). Cover the vessel and bring it to a rolling, vigorous boil.",
                ta: "2 கிலோ சீரக சம்பா அரிசிக்கு 3 லிட்டர் தண்ணீர் ஊற்றவும் (1:1.5 சீரக சம்பா விகிதம்). பாத்திரத்தை மூடி, நன்கு கொதிக்க விடவும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Critical salt check: taste the boiling broth. It must be slightly saltier than a normal soup — distinctly seawater-salty. The rice will absorb a lot of this salt. Adjust crystal salt now. Squeeze in the juice of half a lemon — this keeps the rice grains separate and brightens the flavour.",
                ta: "மிக முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். சாதாரண சூப்பை விட சற்று அதிக உப்பு — தெளிவாக கடல்நீர் உப்பு — இருக்க வேண்டும். அரிசி இந்த உப்பை நிறைய உள்ளீர்க்கும். இப்போது கல் உப்பை சரிசெய்யவும். அரை எலுமிச்சையின் சாற்றை பிழியவும் — இது அரிசி தானியங்கள் ஒட்டாமல் தனித்தனியாக இருக்கவும், சுவையை பிரகாசமாக்கவும் உதவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Dum Process", ta: "தம் சமையல்" },
          steps: [
            {
              step: 21,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice. Gently slide the rice into the boiling broth — don't dump it in. Mix once VERY gently from the bottom; the small Seeraga Samba grains break easily.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுமையாக வடிக்கவும். கொதிக்கும் சாற்றில் அரிசியை மெதுவாக சேர்க்கவும் — வேகமாக போட வேண்டாம். அடியிலிருந்து மிக மெதுவாக ஒரு முறை கலக்கவும்; சீரக சம்பாவின் சிறிய தானியங்கள் எளிதில் உடையும்.",
              },
            },
            {
              step: 22,
              description: {
                en: "Cook on medium-high flame, UNCOVERED, until about 70-80% of the water has evaporated and the rice begins to surface — usually 10-15 minutes for 2 kg. This is the dum-ready signal.",
                ta: "மிதமான-உயர் தீயில் மூடாமல், சுமார் 70-80% தண்ணீர் ஆவியாகி, அரிசி மேற்பரப்பில் தெரிய ஆரம்பிக்கும் வரை — 2 கிலோவுக்கு வழக்கமாக 10-15 நிமிடம் — வேக விடவும். இதுவே தம் வைக்க தயார் என்பதற்கான அடையாளம்.",
              },
            },
            {
              step: 23,
              description: {
                en: "Lower the flame to the absolute minimum (a steady simmer). Seal the vessel tightly with a heavy lid and weight (or seal the edges with a roll of wheat dough). The traditional commercial Dindigul method is to place HOT COALS on top of the lid — this creates dum from BOTH sides, top and bottom. Leave it on dum for EXACTLY 20 minutes, undisturbed.",
                ta: "தீயை மிக குறைந்த அளவுக்கு குறைக்கவும் (சிறிய நிலையான கொதிநிலை). கனமான மூடி மற்றும் பாரத்தால் பாத்திரத்தை இறுக்கமாக மூடவும் (அல்லது கோதுமை மாவு பிசைந்து ஓரத்தில் ஒட்டி காற்று வெளியேறாமல் முத்திரை இடவும்). பாரம்பரிய வணிக திண்டுக்கல் முறை மூடியின் மேல் சூடான கரிகளை வைப்பது — இது மேலிருந்தும் கீழிருந்தும் இரண்டு பக்கங்களிலும் தம் உருவாக்குகிறது. சரியாக 20 நிமிடம் தொடாமல் தம்மில் வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Fluff and Serve", ta: "புரட்டி பரிமாறுதல்" },
          steps: [
            {
              step: 24,
              description: {
                en: "Turn off the heat. Let the vessel rest with the seal still intact for another 10 minutes — the trapped ghee, mint, cashew and powdered-spice aroma settles into every grain.",
                ta: "அடுப்பை அணைக்கவும். முத்திரையை அப்படியே வைத்து இன்னும் 10 நிமிடம் ஓய்வு கொடுக்கவும் — அடைபட்ட நெய், புதினா, முந்திரி மற்றும் அரைத்த மசாலா வாசனை ஒவ்வொரு தானியத்திலும் நிலையாகும்.",
              },
            },
            {
              step: 25,
              description: {
                en: "Open the lid — the unmistakable Dindigul aroma will fill the room. Using a flat ladle (not a spoon), gently fluff the beautifully separated, deep-red-tinted rice from the edges inward toward the center — lift and turn, don't stir. The delicate Seeraga Samba grains break if stirred.",
                ta: "மூடியை திறக்கவும் — தனிச்சிறப்பான திண்டுக்கல் வாசனை அறை முழுவதும் பரவும். தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, அழகாக பிரிந்த, ஆழமான சிவப்பு நிறமுள்ள சாதத்தை ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். மென்மையான சீரக சம்பா தானியங்கள் கிளறினால் உடையும்.",
              },
            },
            {
              step: 26,
              description: {
                en: "Serve this rich, 'mutton-style' Veg Dum Biryani steaming hot. The classic Dindigul wedding pairing: a cool onion-mint raita and a generous pour of vegetarian dalcha (or chana kurma). For a wedding feast presentation, top each plate with a few extra ghee-roasted cashews and a wedge of lemon.",
                ta: "இந்த செழுமையான, 'ஆட்டிறைச்சி-பாணி' சைவ தம் பிரியாணியை சூடாக பரிமாறவும். கிளாசிக் திண்டுக்கல் கல்யாண சேர்க்கை: குளிர்ந்த வெங்காய-புதினா ரெய்தா மற்றும் தாராளமான சைவ தால்சா (அல்லது சன்னா குருமா). கல்யாண-விருந்து வழங்கலுக்கு, ஒவ்வொரு தட்டின் மேலும் சில கூடுதல் நெய்-வறுத்த முந்திரி மற்றும் ஒரு துண்டு எலுமிச்சை வைக்கவும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Dindigul Veg Dum Biryani recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
