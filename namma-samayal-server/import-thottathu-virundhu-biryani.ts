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
  // Marination
  { slug: "country-chicken", name: "Country Chicken (Naattu Kozhi)", ta: "நாட்டு கோழி", quantity: "1", unit: "kg" },
  { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste (for marinade + main)", ta: "இஞ்சி பூண்டு விழுது (மரினேட் + மசாலா)", quantity: "1 tbsp (marinade) + 3 tbsp (main)", unit: "" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1 handful (marinade) + 1 large handful (main)", unit: "" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli)", ta: "கொத்தமல்லி", quantity: "1 handful (marinade) + 1 large handful (main)", unit: "" },
  { slug: "garam-masala", name: "Homemade Garam Masala", ta: "வீட்டு கரம் மசாலா", quantity: "1", unit: "tsp (for marinade)" },
  { slug: "curd", name: "Curd (for marination)", ta: "தயிர் (மரினேட்டுக்கு)", quantity: "2", unit: "tbsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder (for marination)", ta: "மஞ்சள் தூள் (மரினேட்டுக்கு)", quantity: "1/2", unit: "tsp" },

  // Biryani base
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "1", unit: "kg" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, finely chopped)", ta: "சின்ன வெங்காயம் (நன்கு நறுக்கியது)", quantity: "300", unit: "g" },
  { slug: "tomato", name: "Tomato (finely chopped)", ta: "தக்காளி (நன்கு நறுக்கியது)", quantity: "4", unit: "nos" },
  { slug: "green-chilli", name: "Green Chilli (slit)", ta: "பச்சை மிளகாய் (கீறியது)", quantity: "5-6", unit: "nos" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "1.5", unit: "tbsp" },
  { slug: "cinnamon", name: "Cinnamon (Pattai)", ta: "இலவங்கப்பட்டை", quantity: "2-3", unit: "small pieces" },
  { slug: "cloves", name: "Cloves (Kirambu)", ta: "கிராம்பு", quantity: "5-6", unit: "nos" },
  { slug: "cardamom", name: "Cardamom (Yelakkai)", ta: "ஏலக்காய்", quantity: "4-5", unit: "nos" },
  { slug: "bay-leaf", name: "Bay Leaf (Briyani Leaf)", ta: "பிரியாணி இலை", quantity: "2-3", unit: "nos" },
  { slug: "star-anise", name: "Star Anise (Anasipoo)", ta: "அன்னாசிப்பூ", quantity: "1", unit: "small piece", categorySlug: "spices-masalas" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "150", unit: "ml" },
  { slug: "ghee", name: "Ghee (split into 2 phases)", ta: "நெய் (2 கட்டங்களாக பிரிக்கப்பட்டது)", quantity: "100", unit: "ml (50 ml + 50 ml)" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "thottathu-virundhu-vayirukku-idhama-biryani";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "poultry" }) || await Category.findOne();
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
        en: "Thottathu Virundhu 'Vayirukku Idhama' Naattu Kozhi Biryani (Stomach-Soothing Country Chicken Biryani)",
        ta: "தோட்டத்து விருந்து 'வயிற்றுக்கு இதமா' நாட்டு கோழி பிரியாணி",
      },
      slug,
      description: {
        en: "A 15-year-old home-style country chicken biryani from Thottathu Virundhu (Erode), famously known as 'Vayirukku Idhama' — soothing to the stomach. Unlike commercial hotel biryanis that leave you bloated with nenju erichal (heartburn) an hour later, this Kavithamani Akka recipe digests effortlessly because of two key techniques: (1) the chicken is pre-marinated for 30+ minutes with curd, fresh ginger-garlic, mint, coriander and homemade garam masala BEFORE it touches the biryani pot — which both tenderizes the tough naattu kozhi and infuses flavor deep into the bones; (2) the 100 ml of ghee is split into TWO phases — 50 ml fried with the whole spices at the start, and the remaining 50 ml drizzled fresh over the rice right before dum so the pure ghee aroma doesn't burn off during the long boil. The signature Kongu hospitality dish — 'Rendu kozhiya pudingada!' (Catch two chickens!) is the immediate Kongu response when relatives drop by unannounced.",
        ta: "ஈரோடு தோட்டத்து விருந்தின் 15 ஆண்டு பழமையான வீட்டு பாணி நாட்டு கோழி பிரியாணி — 'வயிற்றுக்கு இதமா' என்று பிரபலம். வணிக ஹோட்டல் பிரியாணிகள் சாப்பிட்ட ஒரு மணி நேரத்தில் வயிறு கனத்து நெஞ்செரிச்சல் தருகின்றன — ஆனால் இந்த கவிதாமணி அக்காவின் சமையல் எளிதாக ஜீரணமாகும். இரண்டு முக்கிய நுட்பங்களே காரணம்: (1) கோழி பிரியாணி பானையை தொடுவதற்கு முன்பே, 30+ நிமிடம் தயிர், புதிய இஞ்சி-பூண்டு, புதினா, கொத்தமல்லி மற்றும் வீட்டு கரம் மசாலாவில் முன்-மரினேட் செய்யப்படுகிறது — இது கடினமான நாட்டு கோழியை மிருதுவாக்கி, எலும்புகளுக்குள்ளும் சுவையை பதிய வைக்கிறது; (2) 100 மிலி நெய் இரண்டு கட்டங்களாக பிரிக்கப்பட்டுள்ளது — 50 மிலி ஆரம்பத்தில் முழு மசாலாக்களுடன் வறுக்க, மீதி 50 மிலி தம் வைக்கும் முன் அரிசிக்கு மேலே புதியதாக ஊற்றப்படுகிறது — இதனால் நெய்யின் தூய்மையான வாசனை நீண்ட கொதிநிலையில் எரிந்து போகாது. கொங்கு வீடுகளில் திடீரென உறவினர்கள் வந்தால், உடனடி உற்சாக எதிர்வினை 'ரெண்டு கோழியா புடிங்கடா!' (இரண்டு கோழி பிடியுங்கள்!) — இந்த சிறப்பு பிரியாணியே விருந்தினர் வரவேற்பு உணவு.",
      },
      speciality: {
        en: "Four Thottathu Virundhu signatures define this biryani: (1) The 'Vayirukku Idhama' Guarantee — explicitly designed not to cause bloating or nenju erichal (heartburn); the gentler oil/ghee ratio and full-cooked masala make this a digestion-friendly biryani that you can actually eat at night and still sleep well. (2) The Pre-Marination Secret — most biryanis dump raw chicken straight into the masala pot, but naattu kozhi has tough meat; here, the chicken sits 30+ minutes in curd, ginger-garlic, mint, coriander and homemade garam masala before the pot, which softens the meat AND drives flavor into the bones. (3) The Double-Ghee Technique — 100 ml ghee split into 2 phases (50 ml fried with whole spices at start; 50 ml drizzled fresh over the rice right at the dum stage); the second pour preserves the pure ghee aroma that would otherwise burn off during long boiling. (4) The Kongu Hospitality Story — 'Rendu kozhiya pudingada!' (Catch two chickens!) is the spontaneous Kongu reaction when guests turn up unannounced, and this is the exact biryani that gets cooked.",
        ta: "தோட்டத்து விருந்தின் நான்கு தனிச்சிறப்புகள்: (1) 'வயிற்றுக்கு இதமா' உத்தரவாதம் — வயிறு கனம் அல்லது நெஞ்செரிச்சல் வராதபடி வடிவமைக்கப்பட்டது; சமன் செய்யப்பட்ட எண்ணெய்/நெய் விகிதம் மற்றும் முழுமையாக வேக வைக்கப்பட்ட மசாலா இதை ஜீரண நட்பு பிரியாணியாக ஆக்குகிறது — இரவில் சாப்பிட்டாலும் தூக்கம் கெடாது. (2) முன்-மரினேட் ரகசியம் — பெரும்பாலான பிரியாணிகள் பச்சை கோழியை நேரடியாக மசாலா பானையில் சேர்க்கின்றன, ஆனால் நாட்டு கோழியின் இறைச்சி கடினமானது; இங்கே, கோழி 30+ நிமிடம் தயிர், இஞ்சி-பூண்டு, புதினா, கொத்தமல்லி, வீட்டு கரம் மசாலாவில் ஊறுகிறது — இறைச்சி மிருதுவாகும், எலும்புகளுக்குள் சுவை இறங்கும். (3) இரட்டை-நெய் நுட்பம் — 100 மிலி நெய் 2 கட்டங்களாக பிரிக்கப்பட்டுள்ளது (50 மிலி ஆரம்பத்தில் முழு மசாலாக்களுடன்; 50 மிலி தம் வைக்கும் முன் அரிசிக்கு மேலே புதியதாக); இரண்டாம் ஊற்று நெய்யின் தூய வாசனையை நீண்ட கொதிநிலையில் எரியாமல் காக்கிறது. (4) கொங்கு விருந்தோம்பல் கதை — விருந்தினர் திடீரென வந்தால் 'ரெண்டு கோழியா புடிங்கடா!' (இரண்டு கோழி பிடியுங்கள்!) என்பதே உடனடி கொங்கு எதிர்வினை — அதே நேரத்தில் சமைக்கப்படும் பிரியாணி இதுதான்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 45,
      cookingTime: 80,
      totalTime: 125,
      servings: 8,
      difficulty: "hard",
      source: "youtube",
      tags: [
        "non-veg",
        "biryani",
        "naatu-kozhi-biryani",
        "country-chicken-biryani",
        "mutton-biryani",
        "seeraga-samba",
        "dum-biryani",
        "pre-marinated",
        "double-ghee",
        "rice",
        "thottathu-virundhu",
        "kavithamani-akka",
        "kongu",
        "erode",
        "tamil-nadu",
        "home-style",
        "vayirukku-idhama",
        "stomach-friendly",
        "digestion-friendly",
        "traditional",
        "feast",
        "virundhu",
      ],
      searchKeywords: [
        "thottathu virundhu biryani",
        "vayirukku idhama biryani",
        "stomach soothing biryani",
        "no heartburn biryani",
        "naatu kozhi biryani",
        "country chicken biryani",
        "kavithamani akka biryani",
        "தோட்டத்து விருந்து பிரியாணி",
        "வயிற்றுக்கு இதமா பிரியாணி",
        "rendu kozhiya pudingada",
        "pre marinated biryani",
        "double ghee biryani",
        "seeraga samba mutton biryani",
        "erode home style biryani",
        "chef deena thottathu virundhu",
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
          title: { en: "The Crucial Pre-Marination", ta: "முக்கிய முன்-மரினேட் படி" },
          steps: [
            {
              step: 1,
              description: {
                en: "Clean the 1 kg of bone-in country chicken thoroughly. Cut into medium biryani pieces. Drain well.",
                ta: "1 கிலோ எலும்பு கொண்ட நாட்டு கோழியை நன்கு சுத்தம் செய்யவும். நடுத்தர பிரியாணி அளவு துண்டுகளாக வெட்டி, தண்ணீர் வடியவிடவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "In a large bowl, combine the chicken with 1 tablespoon of ginger-garlic paste, a handful of finely chopped mint, a handful of finely chopped coriander leaves, ½ teaspoon of turmeric powder, 2 tablespoons of curd, a pinch of salt, and 1 teaspoon of homemade garam masala.",
                ta: "ஒரு பெரிய பாத்திரத்தில், கோழியுடன் 1 ஸ்பூன் இஞ்சி-பூண்டு விழுது, ஒரு கைப்பிடி நன்கு நறுக்கிய புதினா, ஒரு கைப்பிடி நன்கு நறுக்கிய கொத்தமல்லி, ½ ஸ்பூன் மஞ்சள் தூள், 2 ஸ்பூன் தயிர், சிறிது உப்பு மற்றும் 1 ஸ்பூன் வீட்டு கரம் மசாலாவை சேர்க்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Massage the marinade deeply into every piece — get under the skin if there's any, into the bone crevices. Cover and let it rest at room temperature for at least 30 minutes (or up to 2 hours in the fridge). This step is non-negotiable: it softens the tough naattu kozhi meat AND drives flavor deep into the bones — something raw chicken in a pot can never achieve.",
                ta: "மரினேட்டை ஒவ்வொரு துண்டிலும் ஆழமாக தேய்த்து கலக்கவும் — தோல் இருந்தால் அதன் கீழும், எலும்பு பிளவுகளிலும் சேருமாறு. மூடி அறை வெப்பநிலையில் குறைந்தது 30 நிமிடம் (அல்லது குளிர்சாதனத்தில் 2 மணி நேரம் வரை) ஓய்வு கொடுக்கவும். இந்த படி கண்டிப்பாக தவிர்க்க கூடாது: இது கடினமான நாட்டு கோழியை மிருதுவாக்கி, எலும்புகளுக்குள் சுவையை பதிய வைக்கும் — பானையில் பச்சை கோழியை சேர்த்து இதை அடைய முடியாது.",
              },
            },
            {
              step: 4,
              description: {
                en: "While the chicken marinates: wash the 1 kg of Seeraga Samba rice gently 2-3 times and soak in fresh water for EXACTLY 20 minutes. Peel and finely chop the 300g of small onions. Finely chop the 4 tomatoes. Slit the 5-6 green chillies. Pick and roughly chop the large handfuls of mint and coriander for the main pot.",
                ta: "கோழி மரினேட்டில் இருக்கும்போது: 1 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை கழுவி, சரியாக 20 நிமிடம் சுத்தமான தண்ணீரில் ஊறவைக்கவும். 300 கிராம் சின்ன வெங்காயத்தை தோல் சீவி நன்கு நறுக்கவும். 4 தக்காளியை நன்கு நறுக்கவும். 5-6 பச்சை மிளகாயை கீறவும். மசாலா பானைக்கான பெரிய கைப்பிடி புதினா மற்றும் கொத்தமல்லியை எடுத்து பெரிய துண்டுகளாக நறுக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Sauté & Masala Base (First Ghee Phase)", ta: "வதக்கல் மற்றும் மசாலா அடிப்படை (முதல் நெய் கட்டம்)" },
          steps: [
            {
              step: 5,
              description: {
                en: "Heat a heavy-bottomed biryani dekchi over medium-high heat. Pour in the 150 ml of groundnut oil along with HALF the ghee — exactly 50 ml. Reserve the other 50 ml for the dum stage; do NOT use it yet.",
                ta: "ஒரு தடிமனான பிரியாணி தேக்சி பாத்திரத்தை மிதமான-உயர் தீயில் சூடாக்கவும். 150 மிலி கடலை எண்ணெய் மற்றும் பாதி நெய் — சரியாக 50 மிலி — ஊற்றவும். மீதி 50 மிலி நெய்யை தம் கட்டத்துக்கு தனியாக வைக்கவும்; இப்போது பயன்படுத்த வேண்டாம்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Once hot, add the whole spices — cinnamon pieces, cloves, cardamom, bay leaves and the small piece of star anise. Let them crackle and bloom in the fat for 30-60 seconds.",
                ta: "எண்ணெய் சூடாகும் போது, முழு மசாலாக்களை சேர்க்கவும் — இலவங்கப்பட்டை, கிராம்பு, ஏலக்காய், பிரியாணி இலை மற்றும் ஒரு சிறு துண்டு அன்னாசிப்பூ. 30-60 விநாடிகள் வாசனை வெளிப்பட விடவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Toss in the 300g of finely chopped small onions. Sauté patiently on medium heat, stirring often, until they turn a deep caramelized golden-brown — typically 12-15 minutes. Don't shortcut this; the color and sweet depth of the entire biryani depends on it.",
                ta: "300 கிராம் நறுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, ஆழமான பழுப்பு பொன்னிறம் வரும் வரை — சுமார் 12-15 நிமிடம் — பொறுமையாக வதக்கவும். குறுக்கு வழி எடுக்க வேண்டாம்; முழு பிரியாணியின் நிறமும் இனிமையும் இதை சார்ந்தே உள்ளது.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the slit green chillies and the remaining 3 tablespoons of ginger-garlic paste. Sauté vigorously for 2 minutes until the raw, pungent smell completely vanishes.",
                ta: "கீறிய பச்சை மிளகாய் மற்றும் மீதமுள்ள 3 ஸ்பூன் இஞ்சி-பூண்டு விழுதை சேர்க்கவும். பச்சை வாசனை முற்றிலும் போகும் வரை 2 நிமிடம் வேகமாக வதக்கவும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Add the large handfuls of fresh mint and coriander leaves. Stir for 30-60 seconds so the herbal oils release into the fat.",
                ta: "ஒரு பெரிய கைப்பிடி புதினா மற்றும் கொத்தமல்லியை சேர்க்கவும். இலைகளின் வாசனை எண்ணெயில் கலக்க 30-60 விநாடிகள் கிளறவும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Add the chopped tomatoes, 1½ tablespoons red chilli powder, and crystal salt to taste. Sauté on medium-high heat until the tomatoes break down completely and the oil starts separating at the edges — about 6-8 minutes.",
                ta: "நறுக்கிய தக்காளி, 1½ ஸ்பூன் மிளகாய் தூள் மற்றும் தேவையான கல் உப்பு சேர்க்கவும். மிதமான-உயர் தீயில், தக்காளி முற்றிலும் குழைந்து, ஓரத்தில் எண்ணெய் பிரிய ஆரம்பிக்கும் வரை — சுமார் 6-8 நிமிடம் — வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Marinated Naattu Kozhi", ta: "மரினேட் செய்த நாட்டு கோழி வேக வைத்தல்" },
          steps: [
            {
              step: 11,
              description: {
                en: "Add the pre-marinated country chicken (along with ALL the marinade liquid clinging to it — that's pure flavor) into the rich masala base. Stir thoroughly so every piece is fully coated.",
                ta: "முன்-மரினேட் செய்த நாட்டு கோழியை (அதனுடன் ஒட்டியுள்ள மரினேட் சாறு உட்பட — அதுவே அசலான சுவை) செழுமையான மசாலா அடிப்படையில் சேர்க்கவும். ஒவ்வொரு துண்டிலும் மசாலா முழுமையாக படியும்படி நன்கு கலக்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Sauté the chicken in the masala on medium-high heat for 5-10 minutes, turning often — the meat will firm up, change color and start releasing its own juices.",
                ta: "மிதமான-உயர் தீயில் அடிக்கடி புரட்டி, கோழியை மசாலாவில் 5-10 நிமிடம் வதக்கவும் — இறைச்சி இறுகி, நிறம் மாறி, தனது சாற்றை வெளியேற்ற ஆரம்பிக்கும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Pour in the measured 1.5-1.75 liters of water — the higher end if the rice is older and drier. The water amount accounts for the stock the chicken will release. Cover the vessel and bring to a rolling boil, then let the chicken cook vigorously for 25-35 minutes — until tender and 80-90% cooked.",
                ta: "1.5-1.75 லிட்டர் தண்ணீர் ஊற்றவும் — அரிசி பழையதாக, காய்ந்ததாக இருந்தால் அதிக அளவை எடுத்துக் கொள்ளவும். கோழி வெளியேற்றும் சாற்றையும் கணக்கில் கொண்ட அளவு. பாத்திரத்தை மூடி, நன்கு கொதிக்க விடவும். பின் மிதமான-உயர் தீயில், கோழி மிருதுவாகி 80-90% வரை வேகும் வரை — 25-35 நிமிடம் — நன்கு கொதிக்க விடவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Adding the Rice & The Double-Ghee Finish", ta: "அரிசி சேர்த்தல் மற்றும் இரட்டை-நெய் முடிப்பு" },
          steps: [
            {
              step: 14,
              description: {
                en: "Critical salt check: taste the boiling broth. It should taste DISTINCTLY salty — slightly saltier than a normal soup. The rice will absorb a lot of this salt when it cooks; under-seasoning here = bland biryani. Adjust crystal salt now.",
                ta: "மிக முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். தெளிவாக உப்பு சுவை — சாதாரண சூப்பை விட சற்று அதிக உப்பு — இருக்க வேண்டும். அரிசி வேக வேக இந்த உப்பை நிறைய உள்ளீர்க்கும்; குறைவாக இருந்தால் சுவையற்ற பிரியாணி கிடைக்கும். இப்போது கல் உப்பை சரிசெய்யவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice. Gently slide the rice into the rapidly boiling chicken broth — don't dump it in. Mix once gently from the bottom; the small grains break easily.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுமையாக வடிக்கவும். கொதிக்கும் கோழி சாற்றில் அரிசியை மெதுவாக சேர்க்கவும் — வேகமாக போட வேண்டாம். அடியிலிருந்து ஒரு முறை மெதுவாக கலக்கவும்; சிறிய தானியங்கள் எளிதில் உடையும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Cook uncovered on a medium-high flame until about 75% of the water is absorbed and the rice grains start peeking through the surface — usually 8-12 minutes. This is the dum-ready signal.",
                ta: "மிதமான-உயர் தீயில் மூடாமல், சுமார் 75% தண்ணீர் உள்ளீர்க்கப்பட்டு, அரிசி தானியங்கள் மேற்பரப்பில் தெரிய ஆரம்பிக்கும் வரை — சுமார் 8-12 நிமிடம் — வேக விடவும். இதுவே தம் வைக்க தயார் என்பதற்கான அடையாளம்.",
              },
            },
            {
              step: 17,
              description: {
                en: "THE SECRET STEP — the second ghee phase: drizzle the reserved 50 ml of ghee EVENLY over the top of the simmering rice. Don't stir it in; just let it sit on top. This fresh, un-boiled ghee will steam-infuse during dum and keeps its pure aroma intact — the signature 'Vayirukku Idhama' fragrance that ordinary biryanis lose to the boil.",
                ta: "ரகசிய படி — இரண்டாம் நெய் கட்டம்: சேமித்து வைத்த 50 மிலி நெய்யை அரிசிக்கு மேலே சீராக ஊற்றவும். கலக்க வேண்டாம்; மேலே அப்படியே இருக்க விடவும். இந்த புதிய, கொதிக்காத நெய் தம்மில் ஆவியாக கலந்து, தனது தூய வாசனையை இழக்காமல் தங்கும் — இதுவே சாதாரண பிரியாணிகள் கொதிநிலையில் இழந்துவிடும் 'வயிற்றுக்கு இதமா' அடையாள வாசனை.",
              },
            },
            {
              step: 18,
              description: {
                en: "Lower the flame to the absolute minimum (a steady simmer). Cover the vessel with a very tight-fitting lid. Place a heavy weight on top of the lid (or seal the edges with a roll of wheat dough). Leave it on dum for 15 to 20 minutes, undisturbed.",
                ta: "தீயை மிக குறைந்த அளவுக்கு குறைக்கவும் (சிறிய நிலையான கொதிநிலை). பாத்திரத்தை மிக இறுக்கமான மூடியால் மூடவும். மூடியின் மேல் ஒரு கனமான பாரம் வைக்கவும் (அல்லது கோதுமை மாவு பிசைந்து ஓரத்தில் ஒட்டி காற்று வெளியேறாமல் முத்திரை இடவும்). 15 முதல் 20 நிமிடம் தொடாமல் தம்மில் வைக்கவும்.",
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
                en: "Turn off the heat. Let the biryani rest with the lid still tightly sealed for another 10 minutes — the trapped ghee aroma settles into every grain.",
                ta: "அடுப்பை அணைக்கவும். மூடியை இறுக்கமாக மூடிய நிலையில் இன்னும் 10 நிமிடம் ஓய்வு கொடுக்கவும் — அடைபட்ட நெய் வாசனை ஒவ்வொரு தானியத்திலும் நிலையாகும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Open the lid — the incredible aroma of the locked-in ghee and spices will fill the room. Using a flat ladle (not a spoon), gently fluff the biryani from the edges inward toward the center — lift and turn, don't stir. This protects the delicate Seeraga Samba grains and distributes the chicken evenly.",
                ta: "மூடியை திறக்கவும் — அடைபட்ட நெய் மற்றும் மசாலாக்களின் அற்புதமான வாசனை அறை முழுவதும் பரவும். தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். இது மென்மையான சீரக சம்பா தானியங்களை காப்பாற்றும், கோழியும் சீராக கலக்கும்.",
              },
            },
            {
              step: 21,
              description: {
                en: "Serve this stomach-soothing, ghee-fragrant Thottathu Virundhu biryani piping hot with a cool onion raita and a spicy chicken side gravy. The proof of the 'Vayirukku Idhama' claim: even after a generous helping, you should feel comfortable an hour later — not bloated, no nenju erichal.",
                ta: "இந்த வயிற்றுக்கு இதமான, நெய் வாசனை கொண்ட தோட்டத்து விருந்து பிரியாணியை, குளிர்ந்த வெங்காய ரெய்தா மற்றும் ஒரு காரமான கோழி குழம்புடன் சூடாக பரிமாறவும். 'வயிற்றுக்கு இதமா' என்பதன் சாட்சி: தாராளமாக சாப்பிட்ட பிறகும், ஒரு மணி நேரம் கழித்து வயிறு கனத்தோ, நெஞ்செரிச்சலோ வராமல், சௌகரியமாக இருக்க வேண்டும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Thottathu Virundhu Vayirukku Idhama Biryani recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
