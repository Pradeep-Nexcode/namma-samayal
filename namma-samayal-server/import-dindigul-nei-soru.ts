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
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "3", unit: "kg" },
  { slug: "big-onion", name: "Big Onion (Pallari, finely sliced)", ta: "பெரிய வெங்காயம் (பல்லாரி, மெல்லியதாக நறுக்கியது)", quantity: "250", unit: "g" },
  { slug: "tomato", name: "Tomato (finely chopped)", ta: "தக்காளி (நன்கு நறுக்கியது)", quantity: "300", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli (slit — provides ALL the heat)", ta: "பச்சை மிளகாய் (கீறியது — முழு காரமும் இதிலிருந்தே)", quantity: "150", unit: "g" },
  { slug: "garlic", name: "Garlic Paste (freshly ground) — KEY 2:1 ratio vs ginger", ta: "பூண்டு விழுது (புதிதாக அரைத்தது) — இஞ்சியை விட இரட்டை அளவு", quantity: "150", unit: "g" },
  { slug: "ginger", name: "Ginger Paste (freshly ground)", ta: "இஞ்சி விழுது (புதிதாக அரைத்தது)", quantity: "75", unit: "g" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1", unit: "generous handful" },
  { slug: "cinnamon", name: "Cinnamon (Pattai)", ta: "இலவங்கப்பட்டை", quantity: "10", unit: "g" },
  { slug: "cardamom", name: "Cardamom (Yelakkai)", ta: "ஏலக்காய்", quantity: "5", unit: "g" },
  { slug: "cloves", name: "Cloves (Kirambu)", ta: "கிராம்பு", quantity: "2.5", unit: "g" },
  { slug: "cashew-nuts", name: "Cashew Nuts", ta: "முந்திரி", quantity: "150", unit: "g" },
  { slug: "ghee", name: "Ghee (Nei)", ta: "நெய்", quantity: "400", unit: "ml" },
  { slug: "groundnut-oil", name: "Groundnut Oil (cold-pressed)", ta: "கடலை எண்ணெய் (மரச்செக்கு)", quantity: "300", unit: "ml" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "dindigul-jaffer-nei-soru";
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
        en: "Dindigul Jaffer Catering Nei Soru (Three-Generation Dindigul Ghee Rice)",
        ta: "திண்டுக்கல் ஜாஃபர் கேட்டரிங் நெய் சோறு",
      },
      title: "Dindigul Nei Soru (Ghee Rice)",
      slug,
      description: {
        en: "The legendary 45-year-old Dindigul ghee rice from Dindigul Jaffer Catering (Professor Mr. Yasin), passed down through three generations of master caterers. Seeraga Samba rice is slow-cooked in a generous 400 ml of pure ghee and 300 ml of cold-pressed groundnut oil with whole cinnamon, cardamom and cloves, then a punchy base of caramelized big onions, slit green chillies, mint, and the famous 2:1 garlic-to-ginger paste ratio (150g garlic + 75g ginger). Critically there are NO masala powders (no coriander powder, no chilli powder) — the heat comes purely from 150g of green chillies, and the depth comes from the massive fresh garlic-mint-cashew aromatic base. Finished on tight dum till the tiny grains glisten golden.",
        ta: "மூன்று தலைமுறை மாஸ்டர் கேட்டரர்களின் பாரம்பரியம் வாழும், திண்டுக்கல் ஜாஃபர் கேட்டரிங் (பேராசிரியர் திரு. யாசின்) 45 ஆண்டு பழமை வாய்ந்த நெய் சோறு. சீரக சம்பா அரிசியை தாராளமான 400 மிலி தூய நெய் மற்றும் 300 மிலி மரச்செக்கு கடலை எண்ணெயில், முழு இலவங்கப்பட்டை, ஏலக்காய், கிராம்புடன் மெதுவாக வேக வைக்கப்படுகிறது. காரமான அடிப்படை: கருகிய பெரிய வெங்காயம், கீறிய பச்சை மிளகாய், புதினா, மற்றும் புகழ்பெற்ற 2:1 பூண்டு-இஞ்சி விகித விழுது (150 கிராம் பூண்டு + 75 கிராம் இஞ்சி). மிக முக்கியம் — மசாலா தூள் எதுவும் இல்லை (கொத்தமல்லி தூள் இல்லை, மிளகாய் தூள் இல்லை); காரம் வெறும் 150 கிராம் பச்சை மிளகாயிலிருந்தே, ஆழம் புதிய பூண்டு-புதினா-முந்திரி வாசனை அடிப்படையிலிருந்தே வருகிறது. பளபளக்கும் பொன்னிற சிறு தானியங்கள் வரும் வரை இறுக்கமான தம்மில் முடிக்கப்படுகிறது.",
      },
      speciality: {
        en: "Three Jaffer Catering signatures define authentic Dindigul Nei Soru: (1) The 'Zero Powder' Purity — most ghee rice recipes sneak in coriander powder or a pinch of garam masala for body, but true Dindigul Nei Soru uses ZERO masala powders. The ONLY heat source is 150g of green chillies; the depth comes from a massive fresh GG-mint-cashew aromatic base. This keeps the rice golden, clean and visually distinct from biryani. (2) The Golden 2:1 Garlic-to-Ginger Ratio — exactly 150g garlic vs 75g ginger. Master caterers know that equal ginger would give a sharp, bitter bite; the deliberate garlic dominance produces the rich, mellow Dindigul base that defines this dish. Skip this ratio and you lose the Dindigul identity. (3) The Ghee + Groundnut Oil Combo — 400 ml ghee + 300 ml cold-pressed groundnut oil. The oil prevents the ghee from burning during the long sauté while the ghee carries the aroma. Cashews roasted in this fat at the start become tiny crunchy flavor bombs throughout the finished rice. Three generations, 45 years, one rule book.",
        ta: "அசலான திண்டுக்கல் நெய் சோறின் மூன்று ஜாஃபர் கேட்டரிங் தனிச்சிறப்புகள்: (1) 'மசாலா தூள் இல்லை' தூய்மை — பெரும்பாலான நெய் சோறு செய்முறைகள் கொத்தமல்லி தூள் அல்லது சிறிது கரம் மசாலா சேர்க்கின்றன, ஆனால் அசலான திண்டுக்கல் நெய் சோறு எந்த மசாலா தூளையும் சேர்க்காது. ஒரே காரத் தடம் 150 கிராம் பச்சை மிளகாய்; ஆழம் புதிய இஞ்சி-பூண்டு-புதினா-முந்திரி வாசனை அடிப்படையிலிருந்தே வருகிறது. இதனால் சோறு பொன்னிறமாக, தூய்மையாக, பிரியாணியிலிருந்து காட்சி ரீதியாக வேறுபட்டு இருக்கிறது. (2) தங்க 2:1 பூண்டு-இஞ்சி விகிதம் — சரியாக 150 கிராம் பூண்டு எதிராக 75 கிராம் இஞ்சி. மாஸ்டர் கேட்டரர்களுக்கு தெரியும் — சம இஞ்சி கசப்பான, கூரிய சுவையை தரும்; வேண்டுமென்றே பூண்டு மேலாதிக்கம் செழுமையான, மென்மையான திண்டுக்கல் அடிப்படையை உருவாக்குகிறது. இந்த விகிதத்தை தவிர்த்தால் திண்டுக்கல் அடையாளம் இழக்கப்படும். (3) நெய் + கடலை எண்ணெய் கலவை — 400 மிலி நெய் + 300 மிலி மரச்செக்கு கடலை எண்ணெய். எண்ணெய், நீண்ட வதக்குதலின் போது நெய் கருகாமல் தடுக்கிறது; நெய் வாசனையை தாங்குகிறது. ஆரம்பத்தில் இந்த கொழுப்பில் வறுத்த முந்திரி, இறுதி சோற்றில் சிறு கொறுகொறுப்பான சுவை வெடிகுண்டுகளாக மாறுகின்றன. மூன்று தலைமுறைகள், 45 ஆண்டுகள், ஒரு விதி புத்தகம்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        city: "Dindigul",
      },
      prepTime: 30,
      cookingTime: 75,
      totalTime: 105,
      servings: 25,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=mfL_K4JcQMk",
      },
      tags: [
        "veg",
        "rice",
        "nei-soru",
        "ghee-rice",
        "dindigul",
        "jaffer-catering",
        "seeraga-samba",
        "dum-rice",
        "feast",
        "virundhu",
        "wedding-rice",
        "tamil-nadu",
        "no-masala-powder",
        "zero-powder",
        "three-generations",
        "professor-yasin",
        "cashew",
        "iconic",
        "traditional",
      ],
      searchKeywords: [
        "dindigul nei soru",
        "nei soru",
        "ghee rice",
        "dindigul ghee rice",
        "திண்டுக்கல் நெய் சோறு",
        "நெய் சோறு",
        "jaffer catering ghee rice",
        "professor yasin nei soru",
        "seeraga samba ghee rice",
        "tamil nadu ghee rice",
        "feast ghee rice",
        "wedding ghee rice",
        "no masala ghee rice",
        "chef deena nei soru",
        "three generation ghee rice",
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
                en: "Wash the 3 kg of Seeraga Samba rice gently 2-3 times until the water runs clear. Soak in fresh water for 20-30 minutes. Drain just before adding to the broth.",
                ta: "3 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவவும். 20-30 நிமிடம் சுத்தமான தண்ணீரில் ஊறவைக்கவும். சாற்றில் சேர்ப்பதற்கு சற்று முன்பு வடிக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Peel and FINELY slice the 250g of big onions (Pallari) — thin long slices, not chopped. Finely chop the 300g of tomatoes. Slit the 150g of green chillies lengthwise.",
                ta: "250 கிராம் பெரிய வெங்காயத்தை (பல்லாரி) தோல் சீவி மெல்லியதாக நீளமாக நறுக்கவும் — துண்டுகளாக நறுக்க வேண்டாம். 300 கிராம் தக்காளியை நன்கு நறுக்கவும். 150 கிராம் பச்சை மிளகாயை நீளவாக்கில் கீறவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Grind a FRESH garlic paste from 150g of garlic. Grind a SEPARATE fresh ginger paste from 75g of ginger. Critical: keep them in two distinct piles. The 2:1 garlic-to-ginger ratio is the Dindigul signature — equal ginger would make the rice taste sharp and bitter.",
                ta: "150 கிராம் பூண்டை புதிதாக விழுதாக அரைக்கவும். 75 கிராம் இஞ்சியை தனியாக புதிதாக விழுதாக அரைக்கவும். மிக முக்கியம்: இரண்டையும் தனித்தனியாக வைக்கவும். 2:1 பூண்டு-இஞ்சி விகிதம் திண்டுக்கல் தனிச்சிறப்பு — சம இஞ்சி சேர்த்தால் சோறு கூரிய, கசப்பான சுவை கொள்ளும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Aromatics & Spices", ta: "மசாலா மற்றும் வாசனை வதக்கல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Heat a large, heavy-bottomed dekchi (biryani vessel) over medium-high heat. Pour in the 300 ml of cold-pressed groundnut oil and the FULL 400 ml of pure ghee. The oil prevents the ghee from burning during the long sauté; the ghee carries the entire aroma.",
                ta: "ஒரு பெரிய, தடிமனான தேக்சி (பிரியாணி பாத்திரம்) ஐ மிதமான-உயர் தீயில் சூடாக்கவும். 300 மிலி மரச்செக்கு கடலை எண்ணெய் மற்றும் முழு 400 மிலி தூய நெய் ஊற்றவும். எண்ணெய் நீண்ட வதக்குதலில் நெய் கருகாமல் தடுக்கும்; நெய் முழு வாசனையையும் தாங்குகிறது.",
              },
            },
            {
              step: 5,
              description: {
                en: "Once hot, add the whole spices: 10g cinnamon, 5g cardamom, and 2.5g cloves. Let them crackle and bloom in the fat for 30-60 seconds — their royal aroma should fill the kitchen.",
                ta: "சூடாகும் போது, முழு மசாலாக்களை சேர்க்கவும்: 10 கிராம் இலவங்கப்பட்டை, 5 கிராம் ஏலக்காய், மற்றும் 2.5 கிராம் கிராம்பு. 30-60 விநாடிகள் கொழுப்பில் வாசனை வெளிப்பட விடவும் — அவற்றின் அரசியல் வாசனை சமையலறையை நிரப்ப வேண்டும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Add the 150g of cashew nuts. Roast on medium heat, stirring often, until they turn a LIGHT golden brown — about 2-3 minutes. Don't darken them; they'll cook more during dum.",
                ta: "150 கிராம் முந்திரியை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, லேசான பொன்னிற பழுப்பு வரும் வரை — சுமார் 2-3 நிமிடம் — வறுக்கவும். அதிக கருகலாக்க வேண்டாம்; தம்மில் மேலும் வேகும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Toss in the 250g of sliced big onions. Sauté patiently on medium heat, stirring often, until they turn TRANSLUCENT and SOFT — about 8-10 minutes. Chef's tip: don't darken them like biryani — Nei Soru should stay light and golden, NOT brown.",
                ta: "250 கிராம் நறுக்கிய பெரிய வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, பளபளப்பாகி மிருதுவாகும் வரை — சுமார் 8-10 நிமிடம் — பொறுமையாக வதக்கவும். சமையற்காரர் குறிப்பு: பிரியாணியை போல கருக்க வேண்டாம் — நெய் சோறு லேசான பொன்னிறமாக இருக்க வேண்டும், பழுப்பாக அல்ல.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the 150g of slit green chillies and sauté for 30-60 seconds — they will sizzle and release their fresh heat into the fat. This is the dish's only heat source, so don't reduce the quantity.",
                ta: "150 கிராம் கீறிய பச்சை மிளகாயை சேர்த்து 30-60 விநாடிகள் வதக்கவும் — அவை சீறி, புதிய காரத்தை எண்ணெயில் வெளியிடும். இதுவே இந்த உணவின் ஒரே காரத் தடம், எனவே அளவை குறைக்க வேண்டாம்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Building the Rich Base (Garlic First)", ta: "செழுமை அடிப்படை கட்டமைத்தல் (பூண்டு முதலில்)" },
          steps: [
            {
              step: 9,
              description: {
                en: "Add the freshly ground GARLIC paste FIRST (150g). Sauté vigorously for 2-3 minutes until the raw garlic smell completely vanishes. Garlic first is a Dindigul technique — garlic needs slightly longer to cook out raw notes than ginger.",
                ta: "புதிய பூண்டு விழுதை முதலில் சேர்க்கவும் (150 கிராம்). 2-3 நிமிடம் வேகமாக வதக்கவும் — பச்சை பூண்டு வாசனை முற்றிலும் போக வேண்டும். முதலில் பூண்டு என்பது திண்டுக்கல் நுட்பம் — பூண்டின் பச்சை வாசனை போக இஞ்சியை விட சற்று கூடுதல் நேரம் தேவை.",
              },
            },
            {
              step: 10,
              description: {
                en: "Now add the freshly ground GINGER paste (75g). Sauté another 1-2 minutes until the raw ginger smell also disappears. The fat should look glossy and aromatic.",
                ta: "இப்போது புதிய இஞ்சி விழுதை (75 கிராம்) சேர்க்கவும். பச்சை இஞ்சி வாசனையும் முற்றிலும் போகும் வரை மேலும் 1-2 நிமிடம் வதக்கவும். கொழுப்பு பளபளப்பாகவும் வாசனை மிக்கதாகவும் இருக்க வேண்டும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Drop in the generous handful of fresh mint leaves. Let them WILT into the hot ghee — 30-60 seconds. The mint releases its herbal oils directly into the fat layer; this is what gives the rice its signature Dindigul aroma.",
                ta: "ஒரு கைப்பிடி புதிய புதினாவை சேர்க்கவும். சூடான நெய்யில் வாட விடவும் — 30-60 விநாடிகள். புதினா தனது மூலிகை எண்ணெய்களை நேரடியாக கொழுப்பில் வெளியிடும்; இதுவே சோற்றுக்கு திண்டுக்கல் தனிச்சிறப்பு வாசனையை தருகிறது.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add the 300g of chopped tomatoes along with a generous handful of crystal salt. Sauté continuously until the tomatoes break down COMPLETELY and the ghee + oil start floating to the edges as a clear glossy layer — about 6-8 minutes. Critical: NO chilli powder, NO coriander powder, NO garam masala. The 'Zero Powder' rule is what makes this Dindigul Nei Soru and not a generic ghee rice.",
                ta: "300 கிராம் நறுக்கிய தக்காளி மற்றும் தாராளமான கல் உப்பு சேர்க்கவும். தக்காளி முற்றிலும் குழைந்து, நெய் + எண்ணெய் ஓரத்தில் தெளிவான பளபளக்கும் அடுக்காக மிதக்கும் வரை — சுமார் 6-8 நிமிடம் — தொடர்ந்து வதக்கவும். மிக முக்கியம்: மிளகாய் தூள் இல்லை, கொத்தமல்லி தூள் இல்லை, கரம் மசாலா இல்லை. 'மசாலா தூள் இல்லை' விதிதான் இதை திண்டுக்கல் நெய் சோறாக ஆக்குகிறது, சாதாரண நெய் சோறாக அல்ல.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Ghee Rice", ta: "நெய் சோறு வேக வைத்தல்" },
          steps: [
            {
              step: 13,
              description: {
                en: "Pour in the measured water — for 3 kg of Seeraga Samba rice, you need about 4.5-6 liters depending on the age of the rice (newer rice needs less, drier old rice needs more). Bring it to a rolling, vigorous boil.",
                ta: "அளவீடு செய்த தண்ணீரை ஊற்றவும் — 3 கிலோ சீரக சம்பா அரிசிக்கு, அரிசியின் வயதைப் பொறுத்து சுமார் 4.5-6 லிட்டர் தேவை (புதிய அரிசிக்கு குறைவாக, பழைய காய்ந்த அரிசிக்கு அதிகமாக). நன்கு கொதிக்க விடவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Critical salt check: taste the boiling broth. It should taste DISTINCTLY salty — slightly saltier than seawater. The rice will absorb a lot of this salt as it cooks. Adjust crystal salt now.",
                ta: "மிக முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். தெளிவாக உப்பு சுவை — கடல்நீரை விட சற்று அதிக உப்பு — இருக்க வேண்டும். அரிசி வேக வேக இந்த உப்பை நிறைய உள்ளீர்க்கும். இப்போது கல் உப்பை சரிசெய்யவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice. Gently slide the rice into the boiling broth — don't dump it in. Mix once VERY gently from the bottom to bring everything together; the tiny Seeraga Samba grains break easily.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுமையாக வடிக்கவும். கொதிக்கும் சாற்றில் அரிசியை மெதுவாக சேர்க்கவும் — வேகமாக போட வேண்டாம். அடியிலிருந்து மிக மெதுவாக ஒரு முறை கலக்கவும்; சீரக சம்பாவின் சிறிய தானியங்கள் எளிதில் உடையும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Dum Process", ta: "தம் சமையல்" },
          steps: [
            {
              step: 16,
              description: {
                en: "Cook on medium-high flame, uncovered, until about 70-80% of the water is absorbed and the tiny rice grains start peeking through the surface — usually 10-15 minutes for 3 kg. This is the dum-ready signal.",
                ta: "மிதமான-உயர் தீயில் மூடாமல், சுமார் 70-80% தண்ணீர் உள்ளீர்க்கப்பட்டு, சிறு தானியங்கள் மேற்பரப்பில் தெரிய ஆரம்பிக்கும் வரை — 3 கிலோவுக்கு வழக்கமாக 10-15 நிமிடம் — வேக விடவும். இதுவே தம் வைக்க தயார் என்பதற்கான அடையாளம்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Lower the stove flame to the absolute minimum (a steady simmer). Cover the vessel with a very tight-fitting lid. Place a heavy weight on top of the lid (or seal the edges with a roll of wheat dough) — the goal is to trap ALL the steam.",
                ta: "அடுப்பின் தீயை மிக குறைந்த அளவுக்கு குறைக்கவும் (சிறிய நிலையான கொதிநிலை). பாத்திரத்தை மிக இறுக்கமான மூடியால் மூடவும். மூடியின் மேல் ஒரு கனமான பாரம் வைக்கவும் (அல்லது கோதுமை மாவு பிசைந்து ஓரத்தில் ஒட்டி காற்று வெளியேறாமல் முத்திரை இடவும்) — நோக்கம்: எந்த ஆவியும் வெளியேற கூடாது.",
              },
            },
            {
              step: 18,
              description: {
                en: "Leave it on dum for 15 to 20 minutes, undisturbed. Do not lift the lid, do not stir, do not peek — every escaping wisp of steam is lost flavour.",
                ta: "15 முதல் 20 நிமிடம் தம்மில் தொடாமல் வைக்கவும். மூடியை திறக்க வேண்டாம், கிளற வேண்டாம், எட்டிப்பார்க்க வேண்டாம் — வெளியேறும் ஒவ்வொரு ஆவி குமிழும் இழந்த சுவையே.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Fluff and Serve", ta: "புரட்டி பரிமாறுதல்" },
          steps: [
            {
              step: 19,
              description: {
                en: "Turn off the heat. Let the vessel rest with the lid still tightly sealed for another 10 minutes — the trapped ghee aroma settles into every grain.",
                ta: "அடுப்பை அணைக்கவும். மூடியை இறுக்கமாக மூடிய நிலையில் இன்னும் 10 நிமிடம் ஓய்வு கொடுக்கவும் — அடைபட்ட நெய் வாசனை ஒவ்வொரு தானியத்திலும் நிலையாகும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Open the lid — the incredible ghee, mint and cashew aroma will fill the room. Using a flat ladle (not a spoon), gently fluff the rice from the edges inward toward the center — lift and turn, don't stir. This protects the delicate Seeraga Samba grains.",
                ta: "மூடியை திறக்கவும் — அற்புதமான நெய், புதினா மற்றும் முந்திரி வாசனை அறை முழுவதும் பரவும். தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். இது மென்மையான சீரக சம்பா தானியங்களை காப்பாற்றும்.",
              },
            },
            {
              step: 21,
              description: {
                en: "Serve this luxurious Dindigul Nei Soru steaming hot. The classic Dindigul pairings: a fiery Chicken Sukka (dry chicken roast) or a traditional Dalcha (mutton-and-toor-dal stew). For a vegetarian feast, pair with brinjal kurma. A wedge of lemon and a few extra ghee-roasted cashews on top complete the Jaffer Catering presentation.",
                ta: "இந்த ஆடம்பரமான திண்டுக்கல் நெய் சோறை சூடாக பரிமாறவும். கிளாசிக் திண்டுக்கல் சேர்க்கைகள்: காரமான சிக்கன் சுக்கா (உலர் கோழி வறுவல்) அல்லது பாரம்பரிய தால்சா (ஆட்டிறைச்சி-துவரம் பருப்பு குழம்பு). சைவ விருந்துக்கு கத்திரிக்காய் குருமாவுடன் சேர்க்கவும். மேலே ஒரு துண்டு எலுமிச்சை மற்றும் சில கூடுதல் நெய்-வறுத்த முந்திரி — ஜாஃபர் கேட்டரிங் வழங்கல் முழுமை.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Dindigul Nei Soru recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
