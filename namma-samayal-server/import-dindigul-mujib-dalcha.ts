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
  // The base
  { slug: "toor-dal", name: "Toor Dal (Thuvaram Paruppu)", ta: "துவரம் பருப்பு", quantity: "200", unit: "g" },
  { slug: "chana-dal", name: "Bengal Gram (Kadalai Paruppu) — gives the thick non-watery body", ta: "கடலை பருப்பு — கெட்டிப்பதம் கொடுக்கும்", quantity: "100", unit: "g" },
  { slug: "mutton-bones", name: "Mutton Bones (with ribs / marrow)", ta: "ஆட்டு எலும்புகள் (விலா எலும்பு / மஜ்ஜை)", quantity: "250-300", unit: "g", categorySlug: "red-meat" },
  { slug: "mutton-fat", name: "Mutton Fat (Kozhuppu)", ta: "ஆட்டு கொழுப்பு", quantity: "(part of the 250-300g bones)", unit: "" },
  { slug: "turmeric-powder", name: "Turmeric Powder (for boiling dal)", ta: "மஞ்சள் தூள் (பருப்பு வேக்க)", quantity: "1", unit: "small pinch" },
  { slug: "groundnut-oil", name: "Oil (for boiling dal, prevents frothing)", ta: "எண்ணெய் (பருப்பு பொங்காமல் இருக்க)", quantity: "1", unit: "tbsp (+ generous for main)" },

  // Vegetables & aromatics
  { slug: "pachai-kathirikai", name: "Green Brinjal (Pachai Kathirikai, Kottapatti) — KEY Dindigul signature", ta: "பச்சை கத்திரிக்காய் (கொட்டப்பட்டி) — திண்டுக்கல் தனிச்சிறப்பு", quantity: "1", unit: "kg", categorySlug: "vegetables" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, coarse paste)", ta: "சின்ன வெங்காயம் (கரகரப்பு விழுது)", quantity: "100", unit: "g" },
  { slug: "tomato", name: "Tomato (finely chopped)", ta: "தக்காளி (நன்கு நறுக்கியது)", quantity: "2", unit: "nos" },
  { slug: "garlic", name: "Garlic Paste (freshly ground) — 2:1 vs ginger (Dindigul rule)", ta: "பூண்டு விழுது — இஞ்சியை விட 2:1", quantity: "50", unit: "g" },
  { slug: "ginger", name: "Ginger Paste (freshly ground)", ta: "இஞ்சி விழுது", quantity: "25", unit: "g" },
  { slug: "coriander-leaves", name: "Coriander Leaves", ta: "கொத்தமல்லி", quantity: "1", unit: "handful" },

  // Spices & liquids
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "8", unit: "g (~1 tbsp)" },
  { slug: "coriander-powder", name: "Coriander Powder (Malli Thool)", ta: "கொத்தமல்லி தூள்", quantity: "8", unit: "g" },
  { slug: "garam-masala", name: "Garam Masala (added LAST for fresh aroma)", ta: "கரம் மசாலா (கடைசியில் சேர்க்க — புதிய வாசனை)", quantity: "1", unit: "tsp" },
  { slug: "tamarind", name: "Tamarind (Puli, thick juice extracted)", ta: "புளி (கெட்டியான சாறு)", quantity: "50", unit: "g" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "dindigul-mujib-mutton-dalcha";
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
        en: "Dindigul Mujib Mutton Dalcha (The Signature Biryani Side)",
        ta: "திண்டுக்கல் முஜிப் ஆட்டிறைச்சி தால்சா (அசலான பிரியாணி பக்க உணவு)",
      },
      title: "Dindigul Mujib Mutton Dalcha",
      slug,
      description: {
        en: "The legendary mutton dalcha from Mujib Biryani in Dindigul — the side dish that elevates a Dindigul biryani above any raita or brinjal kurma. Toor dal + chana dal are boiled together with 250-300g of mutton bones, ribs, and kozhuppu (mutton fat) so the dal stock itself becomes a rich, marrow-laced meat broth. The dalcha is then built on raw, locally-grown Pachai Kathirikai (Kottapatti green brinjals) — these specific brinjals dissolve completely into the gravy while leaving their soft skins intact, naturally thickening the dalcha without any flour or coconut. Strict Dindigul commercial rules: ZERO sambar powder (uses separate chilli/coriander/turmeric instead), NO tempering (everything goes raw into the pot under cold-pressed groundnut oil), and the garam masala is added AT THE VERY END for fresh-bloom aroma. Poured generously over hot Seeraga Samba biryani.",
        ta: "திண்டுக்கல் முஜிப் பிரியாணியின் புகழ்பெற்ற ஆட்டிறைச்சி தால்சா — எந்த ரெய்தாவையும், கத்திரிக்காய் குருமாவையும் விட திண்டுக்கல் பிரியாணியை உயர்த்தும் பக்க உணவு. துவரம் பருப்பு + கடலை பருப்புகள் 250-300 கிராம் ஆட்டு எலும்புகள், விலா எலும்புகள், மற்றும் கொழுப்புடன் சேர்த்து வேக வைக்கப்படுகின்றன — பருப்பு சாறு செழுமையான, மஜ்ஜை கலந்த இறைச்சி சாறாக மாறுகிறது. பின் தால்சா, உள்ளூரில் வளரும் பச்சை கத்திரிக்காய் (கொட்டப்பட்டி) மீது கட்டப்படுகிறது — இந்த குறிப்பிட்ட கத்திரிக்காய்கள் தோல் கெடாமல் முற்றிலும் குழம்பில் கரைந்து, மாவு அல்லது தேங்காய் இல்லாமலேயே தால்சாவை இயற்கையாக கெட்டியாக்குகின்றன. கட்டாய திண்டுக்கல் வணிக விதிகள்: சாம்பார் தூள் கிடையாது (தனித்தனியாக மிளகாய்/கொத்தமல்லி/மஞ்சள்), தாளிப்பு கிடையாது (எல்லாம் பச்சையாக மரச்செக்கு கடலை எண்ணெய்க்கு கீழ் பானையில்), மற்றும் கரம் மசாலா கடைசியில் சேர்க்கப்படுகிறது — புதிய மலர் வாசனைக்காக. சூடான சீரக சம்பா பிரியாணியின் மேல் தாராளமாக ஊற்றி பரிமாறவும்.",
      },
      speciality: {
        en: "Four uncompromising Dindigul commercial rules define Mujib's mutton dalcha: (1) The Ultimate Biryani Pair — Dindigul's identity dish for biryani is NOT raita or katarikai chops; it is dalcha. Mr. Mujib insists this thick, meaty pour transforms Seeraga Samba biryani in a way raita never can. (2) The Pachai Kathirikai Secret — the dish ONLY works with the specific small green Pachai Kathirikai grown in Kottapatti near Dindigul. Their flesh dissolves completely into the gravy (no need for flour, coconut, or pottu kadalai) while the soft skins stay intact for texture. Regular purple brinjals don't break down the same way. (3) The Zero Sambar Powder + Zero Tempering Rules — dalcha looks like a meat sambar but is strictly NOT one. NO sambar powder (uses separate chilli + coriander + turmeric instead), and NO tempering at all (everything goes into the pot raw under raw cold-pressed groundnut oil, no mustard-seed-fry first). (4) The Mutton Fat + Bone Infusion — the dal isn't just boiled in plain water. 250-300g of mutton bones, ribs, and kozhuppu (mutton fat) cook ALONGSIDE the dal, so the dal stock itself becomes a marrow-rich meat broth. This is what gives Mujib's dalcha its luxurious, almost-mutton-curry mouthfeel.",
        ta: "முஜிப்பின் ஆட்டிறைச்சி தால்சாவின் நான்கு கட்டாய திண்டுக்கல் வணிக விதிகள்: (1) அசலான பிரியாணி இணை — திண்டுக்கல்லின் பிரியாணிக்கான அடையாள உணவு ரெய்தா அல்லது கத்திரிக்காய் சாப்ஸ் அல்ல; அது தால்சா. திரு. முஜிப் கூறுகிறார்: இந்த கெட்டியான, இறைச்சி தால்சா சீரக சம்பா பிரியாணியை ரெய்தா மாற்ற முடியாத வகையில் மாற்றுகிறது. (2) பச்சை கத்திரிக்காய் ரகசியம் — உணவு கொட்டப்பட்டியில் வளரும் குறிப்பிட்ட சிறிய பச்சை கத்திரிக்காயுடன் மட்டுமே சரியாக வேலை செய்கிறது. அதன் சதை குழம்பில் முற்றிலும் கரைகிறது (மாவு, தேங்காய் அல்லது பொட்டுக்கடலை தேவையில்லை); மென்மையான தோல் பதத்துக்காக கெடாமல் இருக்கிறது. சாதாரண ஊதா கத்திரிக்காய் இதே போல உடைய மாட்டாது. (3) சாம்பார் தூள் இல்லை + தாளிப்பு இல்லை விதிகள் — தால்சா இறைச்சி சாம்பார் போல தோன்றினாலும், கண்டிப்பாக அல்ல. சாம்பார் தூள் இல்லை (அதற்கு பதிலாக தனித்தனியாக மிளகாய் + கொத்தமல்லி + மஞ்சள் தூள்), தாளிப்பும் இல்லை (எல்லாம் பச்சையாக மரச்செக்கு கடலை எண்ணெய்க்கு கீழ் பானையில், கடுகு வறுப்பு இல்லை). (4) ஆட்டு கொழுப்பு + எலும்பு இணைப்பு — பருப்பு வெறும் தண்ணீரில் வேக வைக்கப்படவில்லை. 250-300 கிராம் ஆட்டு எலும்புகள், விலா, மற்றும் கொழுப்பு பருப்புடன் சேர்ந்து வேக்கின்றன — பருப்பு சாறே மஜ்ஜை நிறைந்த இறைச்சி சாறாக மாறுகிறது. இதுவே முஜிப் தால்சாவுக்கு ஆடம்பரமான, கிட்டத்தட்ட-ஆட்டிறைச்சி-கறி வாய் உணர்வை தருகிறது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        city: "Dindigul",
      },
      prepTime: 20,
      cookingTime: 75,
      totalTime: 95,
      servings: 10,
      difficulty: "medium",
      source: "youtube",
      tags: [
        "non-veg",
        "dalcha",
        "mutton-dalcha",
        "biryani-side",
        "biryani-pair",
        "dindigul",
        "mujib-biryani",
        "pachai-kathirikai",
        "green-brinjal",
        "kottapatti",
        "mutton-bones",
        "mutton-fat",
        "kozhuppu",
        "no-sambar-powder",
        "no-tempering",
        "commercial-recipe",
        "shop-recipe",
        "tamil-nadu",
        "feast",
        "virundhu",
        "iconic",
      ],
      searchKeywords: [
        "dindigul dalcha",
        "mujib dalcha",
        "mutton dalcha",
        "தால்சா",
        "திண்டுக்கல் தால்சா",
        "biryani dalcha",
        "biryani side dish",
        "pachai kathirikai dalcha",
        "kottapatti brinjal",
        "mutton bone dalcha",
        "no sambar powder dalcha",
        "no tempering dalcha",
        "commercial dalcha recipe",
        "chef deena dalcha",
        "dindigul mujib dalcha",
        "seeraga samba biryani dalcha",
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
                en: "Wash the 200g toor dal and 100g Bengal gram (chana dal) together under running water until the water runs clear. The chana dal is what gives this dalcha its thick, non-watery commercial body — don't substitute or skip it.",
                ta: "200 கிராம் துவரம் பருப்பு மற்றும் 100 கிராம் கடலை பருப்பை ஓடும் தண்ணீரில் தண்ணீர் தெளிவாகும் வரை கழுவவும். கடலை பருப்புதான் இந்த தால்சாவுக்கு கெட்டியான, நீர்த்த இல்லாத வணிக பதம் தருகிறது — அதை மாற்றவோ தவிர்க்கவோ வேண்டாம்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Clean the 250-300g of mutton bones (use a mix: marrow bones for richness + rib bones for meat + some kozhuppu/mutton fat for the signature flavor). Rinse and drain.",
                ta: "250-300 கிராம் ஆட்டு எலும்புகளை சுத்தம் செய்யவும் (கலவையாக: மஜ்ஜை எலும்புகள் செழுமைக்கு + விலா எலும்புகள் இறைச்சிக்கு + சிறிது கொழுப்பு தனிச்சிறப்பு சுவைக்கு). கழுவி வடிக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Cut the 1 kg of Pachai Kathirikai (green brinjals) lengthwise into 4 long quarters each — don't cut all the way through the crown, leave the stem-end intact so the quarters stay connected during cooking and the skins can hold the dissolved flesh inside.",
                ta: "1 கிலோ பச்சை கத்திரிக்காயை ஒவ்வொன்றையும் நீளவாக்கில் 4 பகுதிகளாக கீறவும் — காம்பின் முடிவுக்கு முன்பு நிறுத்தவும், காம்பு பகுதிகளை இணைத்து வைத்திருக்க வேண்டும். இதனால் சமையலின் போது பகுதிகள் இணைந்திருந்து, கரைந்த சதையை தோல் உள்ளே வைத்திருக்கும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Grind a COARSE small-onion paste from 100g of peeled shallots (not smooth — leave it slightly grainy for texture). Grind a FRESH garlic paste from 50g of garlic. Grind a SEPARATE fresh ginger paste from 25g of ginger — Dindigul's 2:1 garlic-to-ginger ratio applies here too. Finely chop the 2 tomatoes. Roughly chop a handful of coriander leaves. Soak the 50g of tamarind in warm water for 10 minutes and extract a thick juice.",
                ta: "100 கிராம் தோல் சீவிய சின்ன வெங்காயத்தை கரகரப்பான விழுதாக அரைக்கவும் (மிருதுவாக அல்ல — பதத்துக்காக சற்று கரகரப்பாக). 50 கிராம் பூண்டை புதிய விழுதாக அரைக்கவும். 25 கிராம் இஞ்சியை தனியாக புதிய விழுதாக அரைக்கவும் — திண்டுக்கல்லின் 2:1 பூண்டு-இஞ்சி விகிதம் இங்கும் பொருந்தும். 2 தக்காளியை நன்கு நறுக்கவும். ஒரு கைப்பிடி கொத்தமல்லியை பெரிய துண்டுகளாக நறுக்கவும். 50 கிராம் புளியை சூடான தண்ணீரில் 10 நிமிடம் ஊறவைத்து கெட்டியான சாறு எடுக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Boiling the Dal Base (with Mutton Bones)", ta: "பருப்பு + ஆட்டு எலும்பு வேக வைத்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "In a large vessel, bring about 1.5 liters of water to a rolling boil.",
                ta: "ஒரு பெரிய பாத்திரத்தில் சுமார் 1.5 லிட்டர் தண்ணீர் நன்கு கொதிக்க விடவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Add the washed toor dal + chana dal mixture, the 250-300g of mutton bones + ribs + kozhuppu, a small pinch of turmeric, and a tablespoon of oil (the oil prevents the dal from frothing over). DO NOT add salt yet — salt at this stage toughens the bones.",
                ta: "கழுவிய துவரம் பருப்பு + கடலை பருப்பு கலவை, 250-300 கிராம் ஆட்டு எலும்பு + விலா + கொழுப்பு, ஒரு சிறிய சிட்டிகை மஞ்சள், மற்றும் ஒரு ஸ்பூன் எண்ணெய் (எண்ணெய் பருப்பு பொங்காமல் தடுக்கும்) சேர்க்கவும். இப்போது உப்பு சேர்க்க வேண்டாம் — இந்த நிலையில் உப்பு எலும்புகளை கடினமாக்கும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Boil this mixture vigorously on medium-high heat for 45-60 minutes (or in a pressure cooker for 5-6 whistles) until the dal is COMPLETELY soft and mashed AND the mutton bones release their marrow and fat into the broth. Set aside without straining — you'll add the entire dal + bone + fat mixture to the dalcha later.",
                ta: "மிதமான-உயர் தீயில் 45-60 நிமிடம் (அல்லது குக்கரில் 5-6 விசில்) நன்கு கொதிக்க விடவும் — பருப்பு முற்றிலும் மிருதுவாகி குழைய, ஆட்டு எலும்புகள் மஜ்ஜை மற்றும் கொழுப்பை சாற்றில் வெளியேற்ற வேண்டும். வடிக்காமல் தனியாக வைக்கவும் — முழு பருப்பு + எலும்பு + கொழுப்பு கலவையையும் பின்னர் தால்சாவில் சேர்ப்போம்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Building the Masala Base (NO Tempering!)", ta: "மசாலா அடிப்படை கட்டமைத்தல் (தாளிப்பு இல்லை!)" },
          steps: [
            {
              step: 8,
              description: {
                en: "CRITICAL DINDIGUL RULE: this dalcha requires ZERO tempering. No mustard seeds first, no frying in hot oil first. Everything is assembled directly RAW in the pot. Don't skip this rule — it's the technique that separates Dindigul dalcha from a generic mutton sambar.",
                ta: "கட்டாய திண்டுக்கல் விதி: இந்த தால்சாவுக்கு தாளிப்பு கிடையாது. முதலில் கடுகு வறுத்தல் கிடையாது, சூடான எண்ணெயில் வறுத்தல் கிடையாது. எல்லாமே பானையில் நேரடியாக பச்சையாக சேர்க்கப்படுகிறது. இந்த விதியை தவிர்க்க வேண்டாம் — இதுவே திண்டுக்கல் தால்சாவை சாதாரண ஆட்டிறைச்சி சாம்பாரிலிருந்து வேறுபடுத்தும் நுட்பம்.",
              },
            },
            {
              step: 9,
              description: {
                en: "In a large COLD cooking pot (not preheated), layer these in order: the slit Pachai Kathirikai pieces, the chopped tomatoes, and the coarse small-onion paste.",
                ta: "ஒரு பெரிய குளிர்ந்த பாத்திரத்தில் (முன் சூடாக்க வேண்டாம்), இந்த வரிசையில் அடுக்கவும்: கீறிய பச்சை கத்திரிக்காய் துண்டுகள், நறுக்கிய தக்காளி, மற்றும் கரகரப்பான சின்ன வெங்காய விழுது.",
              },
            },
            {
              step: 10,
              description: {
                en: "Add the freshly ground 50g garlic paste and 25g ginger paste on top.",
                ta: "மேலே 50 கிராம் புதிய பூண்டு விழுது மற்றும் 25 கிராம் இஞ்சி விழுதை சேர்க்கவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Sprinkle in the 8g red chilli powder, 8g coriander powder, and a small pinch of turmeric (NO sambar powder — this is the Dindigul commercial rule). Add the handful of roughly chopped fresh coriander leaves.",
                ta: "8 கிராம் மிளகாய் தூள், 8 கிராம் கொத்தமல்லி தூள், மற்றும் ஒரு சிறிய சிட்டிகை மஞ்சள் தூளை தூவவும் (சாம்பார் தூள் இல்லை — இது திண்டுக்கல் வணிக விதி). பெரிய துண்டுகளாக நறுக்கிய புதிய கொத்தமல்லியையும் சேர்க்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Pour a GENEROUS amount of RAW cold-pressed groundnut oil directly over these raw ingredients (about 4-5 tablespoons). Mix everything together with a ladle (or your clean hands — Dindigul tradition) so the oil and spices coat every brinjal piece. The oil should look like a layer floating on the vegetables before heating.",
                ta: "தாராளமான பச்சை மரச்செக்கு கடலை எண்ணெயை இந்த பச்சை பொருட்களின் மேல் நேரடியாக ஊற்றவும் (சுமார் 4-5 ஸ்பூன்). எண்ணெய் மற்றும் மசாலா ஒவ்வொரு கத்திரிக்காய் துண்டிலும் படிய, ஒரு கரண்டியால் (அல்லது சுத்தமான கைகளால் — திண்டுக்கல் பாரம்பரியம்) கலக்கவும். சூடாக்குவதற்கு முன், எண்ணெய் காய்கறிகளின் மேல் ஒரு அடுக்காக மிதக்க வேண்டும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Initial Cook (Brinjals Dissolve)", ta: "ஆரம்ப சமையல் (கத்திரிக்காய் கரைதல்)" },
          steps: [
            {
              step: 13,
              description: {
                en: "Add JUST ENOUGH water to cook the brinjals — about 1.5-2 cups. Don't add too much; the boiled dal mixture will add a lot more liquid in the next stage.",
                ta: "கத்திரிக்காய் வேக போதிய தண்ணீரை மட்டும் சேர்க்கவும் — சுமார் 1.5-2 கப். அதிகம் சேர்க்க வேண்டாம்; வேக வைத்த பருப்பு கலவை அடுத்த கட்டத்தில் நிறைய திரவம் சேர்க்கும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Place the pot on the stove and turn on the heat to medium-high. Let the brinjals BOIL in this spice-infused water for about 20 minutes — they should become incredibly soft and START dissolving into the gravy, while the skins stay intact. The Pachai Kathirikai's flesh-breaks-down-but-skin-holds property is what naturally thickens the dalcha.",
                ta: "பாத்திரத்தை அடுப்பில் வைத்து, மிதமான-உயர் தீயை இயக்கவும். கத்திரிக்காயை இந்த மசாலா-கலந்த தண்ணீரில் சுமார் 20 நிமிடம் கொதிக்க விடவும் — அவை மிருதுவாகி, குழம்பில் கரைய ஆரம்பிக்க வேண்டும், ஆனாலும் தோல் கெடாமல் இருக்க வேண்டும். பச்சை கத்திரிக்காயின் சதை-கரைகிறது-தோல்-தாங்குகிறது பண்புதான் தால்சாவை இயற்கையாக கெட்டியாக்குகிறது.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Adding the Dal + Bones", ta: "பருப்பு + எலும்பு சேர்த்தல்" },
          steps: [
            {
              step: 15,
              description: {
                en: "Once the brinjals are perfectly soft and dissolving, pour the entire boiled dal + mutton bone + kozhuppu mixture (from step 7) directly into the pot. Include the broth, the bones, the marrow, and the dissolved fat — all of it.",
                ta: "கத்திரிக்காய் முற்றிலும் மிருதுவாகி கரைய ஆரம்பித்தவுடன், படி 7-இல் வேக வைத்த முழு பருப்பு + ஆட்டு எலும்பு + கொழுப்பு கலவையையும் பானையில் நேரடியாக ஊற்றவும். சாறு, எலும்புகள், மஜ்ஜை, கரைந்த கொழுப்பு — அனைத்தையும் சேர்க்கவும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Stir thoroughly to combine. Add crystal salt to taste — now is the right time, after the bones have finished releasing their marrow.",
                ta: "சேர்ப்பதை நன்கு கலக்கவும். தேவையான கல் உப்பு சேர்க்கவும் — எலும்புகள் மஜ்ஜையை வெளியேற்றி முடித்த பிறகு, இப்போதுதான் சரியான நேரம்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Let the dalcha come to a vigorous, rolling boil for 10-15 minutes until it THICKENS noticeably and the oil begins to float to the top as a clear layer. The brinjal-dal-bone mixture should now look like a rich, glossy, deeply orange-brown gravy.",
                ta: "தால்சாவை 10-15 நிமிடம் நன்கு கொதிக்க விடவும் — அது தெளிவாக கெட்டியாகி, மேலே எண்ணெய் தெளிவான அடுக்காக மிதக்க ஆரம்பிக்கும். கத்திரிக்காய்-பருப்பு-எலும்பு கலவை இப்போது செழுமையான, பளபளக்கும், ஆழமான ஆரஞ்சு-பழுப்பு குழம்பாக காட்சியளிக்க வேண்டும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Tamarind + Garam Masala Finish", ta: "புளி + கரம் மசாலா முடிப்பு" },
          steps: [
            {
              step: 18,
              description: {
                en: "CRITICAL TIMING: only NOW — once the dalcha has thickened correctly — add the thick tamarind extract (from step 4). Adding it earlier would tighten the dal and prevent it from thickening; adding it now lets the tamarind sit on top of an already-rich body.",
                ta: "மிக முக்கியமான நேரம்: இப்போது மட்டுமே — தால்சா சரியாக கெட்டியாகியதும் — படி 4-இல் தயாரித்த கெட்டியான புளிக்கரைசலை சேர்க்கவும். முன்னதாக சேர்த்தால் பருப்பை இறுக்கி, கெட்டியாகாமல் தடுத்துவிடும்; இப்போது சேர்ப்பதால் புளி ஏற்கனவே செழுமையான பதத்தில் அமரும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Let the dalcha boil for just 2 to 3 more minutes — the raw smell of the tamarind must completely disappear. Stop boiling here; over-boiling makes the dalcha bitter.",
                ta: "தால்சாவை மேலும் 2-3 நிமிடம் மட்டுமே கொதிக்க விடவும் — புளியின் பச்சை வாசனை முற்றிலும் போக வேண்டும். இங்கு கொதிக்க விடுவதை நிறுத்தவும்; அதிகம் கொதித்தால் தால்சா கசக்கும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Turn off the heat. NOW — at the very end, off the heat — sprinkle the 1 tsp of garam masala over the surface and give it one final gentle mix. Critical: adding the garam masala at the end (NOT during boiling) keeps its aroma powerful, fresh and floral. Boiled garam masala loses its top notes.",
                ta: "அடுப்பை அணைக்கவும். இப்போது — கடைசியில், அடுப்பு அணைத்த நிலையில் — 1 ஸ்பூன் கரம் மசாலாவை மேற்பரப்பில் தூவி, ஒரு கடைசி முறை மெதுவாக கலக்கவும். மிக முக்கியம்: கரம் மசாலாவை கடைசியில் சேர்ப்பது (கொதிக்கும் போது அல்ல) அதன் வாசனையை சக்தி வாய்ந்த, புதிய, மலர் வாசனையாக வைக்கிறது. கொதிக்க விட்ட கரம் மசாலா அதன் மேல் வாசனைகளை இழக்கிறது.",
              },
            },
            {
              step: 21,
              description: {
                en: "Serve this incredibly rich, tangy, meaty Dindigul Dalcha POURED generously over a hot plate of Seeraga Samba biryani. Don't eat it in a separate bowl alongside — the Mujib way is to ladle it directly onto the rice so the dalcha soaks into the grains and the marrow gravy coats every biryani bite. A wedge of lemon and a few onion-mint slices on the side complete the Dindigul presentation.",
                ta: "இந்த அற்புதமான செழுமையான, புளிப்பு, இறைச்சி நிறைந்த திண்டுக்கல் தால்சாவை சூடான சீரக சம்பா பிரியாணி தட்டின் மேல் தாராளமாக ஊற்றி பரிமாறவும். தனி பாத்திரத்தில் சேர்த்து சாப்பிட வேண்டாம் — முஜிப் முறை, தால்சாவை நேரடியாக சாதத்தில் ஊற்றுவது, இதனால் தால்சா தானியங்களில் ஊறி, மஜ்ஜை குழம்பு ஒவ்வொரு பிரியாணி கடியிலும் படியும். ஒரு துண்டு எலுமிச்சை மற்றும் சில வெங்காய-புதினா துண்டுகளை பக்கத்தில் வைத்தால் — திண்டுக்கல் வழங்கல் முழுமை.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Dindigul Mujib Dalcha recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
