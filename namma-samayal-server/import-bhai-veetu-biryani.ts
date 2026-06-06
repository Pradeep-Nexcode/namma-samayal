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
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "1", unit: "kg" },
  { slug: "mutton", name: "Mutton (bone-in)", ta: "ஆட்டிறைச்சி (எலும்புடன்)", quantity: "1", unit: "kg" },
  { slug: "big-onion", name: "Big Onion (Bellary / Pallari)", ta: "பெரிய வெங்காயம்", quantity: "400", unit: "g" },
  { slug: "tomato", name: "Tomato", ta: "தக்காளி", quantity: "300", unit: "g" },
  { slug: "ginger", name: "Ginger (for fresh paste)", ta: "இஞ்சி", quantity: "100", unit: "g" },
  { slug: "garlic", name: "Garlic (for fresh paste)", ta: "பூண்டு", quantity: "100", unit: "g" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1", unit: "handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli)", ta: "கொத்தமல்லி", quantity: "1", unit: "handful" },
  { slug: "curd", name: "Curd (Thayir)", ta: "தயிர்", quantity: "50", unit: "ml" },
  { slug: "lemon", name: "Lemon", ta: "எலுமிச்சை", quantity: "1/2", unit: "no (juiced)" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder (Standard)", ta: "மிளகாய் தூள் (சாதாரண)", quantity: "10", unit: "g" },
  { slug: "kashmiri-chilli-powder", name: "Kashmiri Chilli Powder", ta: "காஷ்மீர் மிளகாய் தூள்", quantity: "10", unit: "g", categorySlug: "ground-spices" },
  { slug: "cinnamon", name: "Cinnamon (Pattai)", ta: "இலவங்கப்பட்டை", quantity: "2-3", unit: "small pieces" },
  { slug: "cloves", name: "Cloves (Kirambu)", ta: "கிராம்பு", quantity: "5-6", unit: "nos" },
  { slug: "cardamom", name: "Cardamom (Yelakkai)", ta: "ஏலக்காய்", quantity: "4-5", unit: "nos" },
  { slug: "groundnut-oil", name: "Refined Oil / Groundnut Oil", ta: "சுத்திகரிக்கப்பட்ட எண்ணெய் / கடலை எண்ணெய்", quantity: "200", unit: "ml" },
  { slug: "ghee", name: "Ghee (Nei)", ta: "நெய்", quantity: "50", unit: "ml" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "bhai-veetu-biryani-muslim-wedding-style";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "red-meat" }) || await Category.findOne({ slug: "meat" }) || await Category.findOne();
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
        en: "Bhai Veetu Biryani (Tamil Muslim Wedding-Style Mutton Biryani)",
        ta: "பாய் வீட்டு பிரியாணி (தமிழ் முஸ்லிம் கல்யாண பிரியாணி)",
      },
      slug,
      description: {
        en: "The legendary Tamil Muslim wedding-style mutton biryani built on the master biryani cooks' (Bhais') precision formula: for every 1 kg of Seeraga Samba rice — exactly 400g big onions, 300g tomatoes, 100g ginger, 100g garlic, 50g curd, 250 ml oil + ghee, and 1.1-1.25 L water. Zero green chillies (a strict authentic-Tamil-Muslim wedding rule). The mutton is slow-cooked into a thick thokku-style gravy before the rice is added, so every meat fibre is fully seasoned. The vibrant red color comes entirely from Kashmiri + standard chilli powders. Finished on tight dum with a 10-15 minute rest before opening.",
        ta: "தமிழ் முஸ்லிம் கல்யாண பாணி ஆட்டிறைச்சி பிரியாணியின் ரகசிய சூத்திரம் — பாய்கள் (மாஸ்டர் சமையல்காரர்கள்) மனப்பாடம் செய்த அளவீடு: 1 கிலோ சீரக சம்பா அரிசிக்கு — 400 கிராம் பெரிய வெங்காயம், 300 கிராம் தக்காளி, 100 கிராம் இஞ்சி, 100 கிராம் பூண்டு, 50 கிராம் தயிர், 250 மிலி எண்ணெய் + நெய், 1.1-1.25 லிட்டர் தண்ணீர். பச்சை மிளகாய் ஒரு துளியும் இல்லை — இது அசலான தமிழ் முஸ்லிம் கல்யாண பிரியாணி விதி. அரிசி சேர்ப்பதற்கு முன், ஆட்டிறைச்சி கெட்டியான தொக்கு பதம் வரும் வரை மெதுவாக வேக வைக்கப்படுகிறது — ஒவ்வொரு இறைச்சி நாரும் முழுமையான மசாலா சுவையை உள்ளீர்க்கும். வெளிறிய சிவப்பு நிறம் காஷ்மீர் + சாதாரண மிளகாய் தூளால் மட்டுமே வரும். தம்மிலிருந்து எடுத்த பிறகு 10-15 நிமிடம் ஓய்வு கட்டாயம்.",
      },
      speciality: {
        en: "Three Bhai signatures: (1) ZERO green chillies — strictly forbidden in authentic Tamil Muslim wedding biryani; green chillies overpower the Seeraga Samba fragrance and skew the spice profile. Heat + color come ONLY from standard red chilli powder + Kashmiri chilli powder. (2) The Bhai precision formula — per 1 kg rice: 400g big onions, 300g tomato, 100g ginger, 100g garlic, 50g curd, 250 ml oil+ghee combined, 1.1-1.25 L water. Memorize and scale. (3) The mutton thokku stage — mutton is cooked down with onions and tomatoes into a deeply concentrated thokku BEFORE water and rice go in; this means every meat fiber is fully seasoned by the time it sits next to rice, not blanded by dilution.",
        ta: "மூன்று பாய் அடையாளங்கள்: (1) பச்சை மிளகாய் சுத்தமாக இல்லை — அசலான தமிழ் முஸ்லிம் கல்யாண பிரியாணியில் கண்டிப்பாக சேர்க்க கூடாது; பச்சை மிளகாய் சீரக சம்பாவின் வாசனையை அழித்து, மசாலா ருசி கெடுக்கும். காரமும் நிறமும் — சாதாரண மிளகாய் தூள் + காஷ்மீர் மிளகாய் தூள் மட்டுமே. (2) பாய் அளவீட்டு சூத்திரம் — 1 கிலோ அரிசிக்கு: 400 கிராம் பெரிய வெங்காயம், 300 கிராம் தக்காளி, 100 கிராம் இஞ்சி, 100 கிராம் பூண்டு, 50 கிராம் தயிர், 250 மிலி எண்ணெய்+நெய், 1.1-1.25 லிட்டர் தண்ணீர். மனப்பாடம் செய்து அளவை மாற்றவும். (3) ஆட்டிறைச்சி தொக்கு படி — தண்ணீர் மற்றும் அரிசி சேர்ப்பதற்கு முன், ஆட்டிறைச்சி வெங்காயம்-தக்காளியுடன் வேக வைக்கப்பட்டு ஆழமாக ஒன்றிய தொக்கு பதம் வரும்; இதனால் ஒவ்வொரு இறைச்சி நாரும் அரிசிக்கு பக்கத்தில் வரும் முன்பே முழு சுவை பெற்றிருக்கும், தண்ணீரால் கரைக்கப்படாது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
      },
      prepTime: 30,
      cookingTime: 90,
      totalTime: 120,
      servings: 8,
      difficulty: "hard",
      source: "youtube",
      tags: [
        "non-veg",
        "biryani",
        "mutton-biryani",
        "bhai-biryani",
        "tamil-muslim",
        "wedding-biryani",
        "kalyana-biryani",
        "seeraga-samba",
        "dum-biryani",
        "rice",
        "feast",
        "no-green-chilli",
        "kashmiri-chilli",
        "thokku-mutton",
        "tamil-nadu",
        "traditional",
      ],
      searchKeywords: [
        "bhai biryani",
        "bhai veetu biryani",
        "muslim wedding biryani",
        "tamil muslim biryani",
        "kalyana biryani",
        "mutton biryani",
        "seeraga samba mutton biryani",
        "பாய் வீட்டு பிரியாணி",
        "கல்யாண பிரியாணி",
        "no green chilli biryani",
        "kashmiri chilli biryani",
        "chef deena biryani",
        "bhai formula biryani",
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
          title: { en: "Prep (The Bhai Formula)", ta: "முன் தயாரிப்பு (பாய் சூத்திரம்)" },
          steps: [
            {
              step: 1,
              description: {
                en: "Wash the 1 kg of Seeraga Samba rice gently 2-3 times until the water runs clear. Soak in fresh water for EXACTLY 20 minutes — don't soak longer, Seeraga Samba grains are tiny and over-soaking will break them. Drain right before adding to broth.",
                ta: "1 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவவும். 20 நிமிடம் மட்டும் — அதிகமாகாமல் — சுத்தமான தண்ணீரில் ஊறவைக்கவும். சீரக சம்பா தானியங்கள் சிறியவை, அதிகம் ஊறவைத்தால் உடைந்துவிடும். சாற்றில் சேர்ப்பதற்கு சற்று முன்பே வடிக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Clean the 1 kg of bone-in mutton thoroughly. Cut into medium biryani pieces. Drain well.",
                ta: "1 கிலோ எலும்பு கொண்ட ஆட்டிறைச்சியை நன்கு சுத்தம் செய்யவும். நடுத்தர பிரியாணி அளவு துண்டுகளாக வெட்டவும். நன்கு வடிக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Peel and FINELY slice the 400g of big onions (Bellary/Pallari) — long thin slices, not chopped. The thin slices caramelize evenly and are the backbone of biryani color and sweetness. Finely chop the 300g of tomatoes.",
                ta: "400 கிராம் பெரிய வெங்காயத்தை (பெல்லாரி/பல்லாரி) தோல் சீவி நீளமாக மெல்லியதாக நறுக்கவும் — துண்டுகளாக நறுக்க வேண்டாம். மெல்லிய துண்டுகள் சீராக கருகி, பிரியாணியின் நிறம் மற்றும் இனிமைக்கு அடித்தளமாக இருக்கும். 300 கிராம் தக்காளியை நன்கு நறுக்கவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Grind a FRESH ginger paste from 100g of ginger. Grind a SEPARATE fresh garlic paste from 100g of garlic — keep them in two distinct piles, they will go into the pot at slightly different moments.",
                ta: "100 கிராம் இஞ்சியை புதிதாக விழுதாக அரைக்கவும். 100 கிராம் பூண்டை தனியாக புதிதாக விழுதாக அரைக்கவும் — இரண்டையும் தனித்தனியாக வைக்கவும், ஏனெனில் சற்றே வேறு நேரத்தில் சேர்க்க வேண்டும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Pick mint leaves off their stems and finely chop. Finely chop the coriander leaves. Whisk the 50 ml of curd until smooth. Juice the half lemon.",
                ta: "புதினா இலைகளை காம்பிலிருந்து பிரித்து நன்கு நறுக்கவும். கொத்தமல்லியையும் நன்கு நறுக்கவும். 50 மிலி தயிரை மிருதுவாக கடையவும். அரை எலுமிச்சையை பிழியவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Aromatic Tempering", ta: "வாசனை தாளிப்பு" },
          steps: [
            {
              step: 6,
              description: {
                en: "Heat a heavy-bottomed biryani vessel (dekchi or vara chatti) over medium-high heat. Pour in the 200 ml of refined/groundnut oil along with the 50 ml of ghee — a combined 250 ml of fat, which is the strict Bhai ratio for 1 kg rice. Don't reduce the fat amount; it carries the entire flavor architecture.",
                ta: "ஒரு தடிமனான பிரியாணி தேக்சி அல்லது 'வராசட்டி' பாத்திரத்தை மிதமான-உயர் தீயில் சூடாக்கவும். 200 மிலி எண்ணெய் மற்றும் 50 மிலி நெய் ஊற்றவும் — மொத்தம் 250 மிலி கொழுப்பு, இது 1 கிலோ அரிசிக்கான கட்டாய பாய் விகிதம். கொழுப்பு அளவை குறைக்க வேண்டாம்; அதுவே முழு சுவை அமைப்பையும் தாங்கி நிற்கிறது.",
              },
            },
            {
              step: 7,
              description: {
                en: "Once hot, add the whole spices — cinnamon pieces, cloves and cardamom pods. Let them crackle and bloom in the fat for 30-60 seconds.",
                ta: "எண்ணெய் சூடாகும் போது, முழு மசாலாக்களை சேர்க்கவும் — இலவங்கப்பட்டை, கிராம்பு மற்றும் ஏலக்காய். 30-60 விநாடிகள் வாசனை வெளிப்பட விடவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the 400g of finely sliced big onions. THE most critical step: sauté continuously on medium heat, stirring often, until they turn a DEEP caramelized golden-brown — typically 15-20 minutes. Don't shortcut this. The depth of color and sweetness of the entire biryani depends on how well these onions brown — under-browned onions = pale, flavorless biryani.",
                ta: "400 கிராம் மெல்லியதாக நறுக்கிய பெரிய வெங்காயத்தை சேர்க்கவும். மிக மிக முக்கியமான படி: மிதமான தீயில் தொடர்ந்து கிளறி, ஆழமான பழுப்பு பொன்னிறம் வரும் வரை — சுமார் 15-20 நிமிடம் — பொறுமையாக வதக்கவும். குறுக்கு வழி எடுக்க வேண்டாம். முழு பிரியாணியின் நிற ஆழமும் இனிமையும், இந்த வெங்காயம் எவ்வளவு நன்கு கருகுகிறது என்பதையே சார்ந்து உள்ளது — போதிய கருகாவிட்டால், வெளிறிய சுவையற்ற பிரியாணி கிடைக்கும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Building the Thokku Base", ta: "தொக்கு அடிப்படை கட்டமைத்தல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Once the onions are beautifully browned, add the fresh GARLIC paste FIRST and sauté for 1-2 minutes until the raw smell of garlic disappears.",
                ta: "வெங்காயம் அழகாக கருகியதும், புதிய பூண்டு விழுதை முதலில் சேர்த்து, பச்சை வாசனை போகும் வரை 1-2 நிமிடம் வதக்கவும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Follow with the fresh GINGER paste. Sauté another 1-2 minutes until the raw ginger smell also vanishes. (Adding garlic first, then ginger, is a Bhai technique — garlic needs slightly longer to cook out raw notes.)",
                ta: "உடனே புதிய இஞ்சி விழுதை சேர்க்கவும். பச்சை இஞ்சி வாசனையும் முற்றிலும் போகும் வரை மேலும் 1-2 நிமிடம் வதக்கவும். (முதலில் பூண்டு, பின்னர் இஞ்சி — இது பாய் நுட்பம்: பூண்டின் பச்சை வாசனை போக சற்று கூடுதல் நேரம் தேவை.)",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the chopped mint and coriander leaves. Stir for 30-60 seconds so the herbal oils release into the hot fat.",
                ta: "நறுக்கிய புதினா மற்றும் கொத்தமல்லியை சேர்க்கவும். இலைகளின் வாசனை சூடான எண்ணெயில் கலக்க 30-60 விநாடிகள் கிளறவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add the chopped tomatoes, the 10g standard red chilli powder, the 10g Kashmiri chilli powder, and crystal salt. Critical: NO green chillies — this is the authentic Tamil Muslim wedding rule. Sauté vigorously on medium-high heat until the tomatoes break down completely and form a thick, shiny paste with the oil starting to separate at the edges — about 7-10 minutes.",
                ta: "நறுக்கிய தக்காளி, 10 கிராம் சாதாரண மிளகாய் தூள், 10 கிராம் காஷ்மீர் மிளகாய் தூள் மற்றும் கல் உப்பு சேர்க்கவும். மிக முக்கியம்: பச்சை மிளகாய் சேர்க்க வேண்டாம் — இது அசலான தமிழ் முஸ்லிம் கல்யாண விதி. மிதமான-உயர் தீயில், தக்காளி முற்றிலும் குழைந்து, கெட்டியான பளபளக்கும் விழுதாக மாறி, ஓரத்தில் எண்ணெய் பிரிய ஆரம்பிக்கும் வரை — சுமார் 7-10 நிமிடம் — வேகமாக வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Slow Cooking the Mutton", ta: "ஆட்டிறைச்சி மெதுவாக வேக வைத்தல்" },
          steps: [
            {
              step: 13,
              description: {
                en: "Add the 1 kg of cleaned bone-in mutton pieces into the thick masala base. Stir thoroughly so every piece is coated. Let the meat roast in the spices on medium-high heat for 5-10 minutes, turning often — it should change color and start releasing its own juices.",
                ta: "1 கிலோ எலும்பு கொண்ட ஆட்டிறைச்சி துண்டுகளை கெட்டியான மசாலா அடிப்படையில் சேர்க்கவும். ஒவ்வொரு துண்டிலும் மசாலா முழுமையாக படியும்படி நன்கு கலக்கவும். மிதமான-உயர் தீயில் அடிக்கடி புரட்டி, இறைச்சி நிறம் மாறி தனது சாற்றை வெளியேற்ற ஆரம்பிக்கும் வரை — 5-10 நிமிடம் — வறுபட விடவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Turn the heat down to low. Stir in the whisked 50 ml of curd GRADUALLY — pouring it in slowly so the curd doesn't split. Mix until the masala is uniform and creamy-looking.",
                ta: "தீயை குறைக்கவும். கடைந்த 50 மிலி தயிரை மெதுவாக சேர்க்கவும் — தயிர் பிரிந்துவிடாமல் இருக்க, கொஞ்சம் கொஞ்சமாக ஊற்றவும். மசாலா சீராக கலக்கும் வரை நன்கு கலக்கவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Pour in the measured 1.1-1.25 liters of water (use 1.1 L for newer rice, up to 1.25 L for older drier rice). Cover the vessel and bring to a rolling boil, then let the mutton cook vigorously on medium-high heat for 30-45 minutes — until the meat is tender and 80-90% cooked.",
                ta: "அளவீடு செய்த 1.1-1.25 லிட்டர் தண்ணீரை ஊற்றவும் (புதிய அரிசிக்கு 1.1 லிட்டர், பழைய காய்ந்த அரிசிக்கு 1.25 லிட்டர் வரை). பாத்திரத்தை மூடி, நன்கு கொதிக்க விடவும். பின் மிதமான-உயர் தீயில், ஆட்டிறைச்சி மிருதுவாகி 80-90% வரை வேகும் வரை — 30-45 நிமிடம் — நன்கு கொதிக்க விடவும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Check: the broth should now look deeply red, a thick layer of flavored fat/oil should float on top, and the mutton should be soft enough to bite through with slight pressure. The last 10-20% of meat cooking will finish during rice cooking and dum.",
                ta: "சரிபார்க்கவும்: சாறு இப்போது ஆழமான சிவப்பு நிறமாக இருக்க வேண்டும், மேலே சுவையான கொழுப்பு/எண்ணெய் அடுக்கு அழகாக மிதக்க வேண்டும், மற்றும் ஆட்டிறைச்சியை சிறிது அழுத்தும் போது மிருதுவாக இருக்க வேண்டும். மீதம் 10-20% இறைச்சி வேக, அரிசி வேக வைக்கும் நிலையிலும் தம் நிலையிலும் முடியும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Rice & Dum Process", ta: "அரிசி மற்றும் தம் சமையல்" },
          steps: [
            {
              step: 17,
              description: {
                en: "Critical salt check: taste the boiling broth. It should taste DISTINCTLY salty — like seawater. The rice will absorb a lot of this salt as it cooks; under-seasoning here = bland biryani. Adjust crystal salt now, before the rice goes in.",
                ta: "மிக முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். தெளிவாக உப்பு சுவை — கடல்நீர் போல — இருக்க வேண்டும். அரிசி வேக வேக இந்த உப்பை நிறைய உள்ளீர்க்கும்; இங்கு குறைவாக இருந்தால் சுவையற்ற பிரியாணி கிடைக்கும். அரிசி சேர்ப்பதற்கு முன்பே கல் உப்பை சரிபார்த்து சரிசெய்யவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice. Gently slide the rice into the rapidly boiling mutton broth — don't dump it in or stir it vigorously, the small grains will break.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுமையாக வடிக்கவும். மெதுவாக, ஆட்டிறைச்சி கொதிக்கும் சாற்றில் அரிசியை சேர்க்கவும் — வேகமாக போட வேண்டாம், கடுமையாக கிளற வேண்டாம்; சிறிய தானியங்கள் உடைந்துவிடும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Squeeze the half lemon evenly over the top — this keeps grains separate and brightens the flavor. Give one very gentle mix from the bottom to bring mutton pieces up.",
                ta: "அரை எலுமிச்சையை மேலே சீராக பிழியவும் — இது தானியங்கள் ஒட்டாமல் தனித்தனியாக இருக்க உதவும், சுவையை பிரகாசமாக்கும். அடியிலிருந்து ஆட்டிறைச்சி துண்டுகளை மேலே கொண்டு வரும்படி ஒரு முறை மெதுவாக கலக்கவும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Let the rice cook on a medium-high flame, uncovered (or partially covered), until about 70-80% of the water is absorbed and the rice grains are visible at the surface — usually 8-12 minutes.",
                ta: "மிதமான-உயர் தீயில் மூடாமல் (அல்லது பகுதி மூடியுடன்), சுமார் 70-80% தண்ணீர் உள்ளீர்க்கப்பட்டு, அரிசி தானியங்கள் மேற்பரப்பில் தெரிய வரும் வரை — சுமார் 8-12 நிமிடம் — அரிசியை வேக விடவும்.",
              },
            },
            {
              step: 21,
              description: {
                en: "Lower the flame to the absolute minimum simmer. Cover the vessel with a very tight-fitting lid. Place a heavy weight on top of the lid (or seal the edges with a roll of wheat dough) — the goal is to trap ALL the steam.",
                ta: "அடுப்பின் தீயை மிக குறைந்த அளவுக்கு குறைக்கவும். பாத்திரத்தை மிக இறுக்கமான மூடியால் மூடவும். மூடியின் மேல் ஒரு கனமான பாரம் வைக்கவும் (அல்லது கோதுமை மாவு பிசைந்து ஓரத்தில் ஒட்டி காற்று வெளியேறாமல் முத்திரை இடவும்) — நோக்கம்: எந்த ஆவியும் வெளியேற கூடாது.",
              },
            },
            {
              step: 22,
              description: {
                en: "Leave it on dum for exactly 15 minutes, undisturbed. Do not lift the lid, do not stir, do not peek.",
                ta: "சரியாக 15 நிமிடம் தம்மில் தொடாமல் வைக்கவும். மூடியை திறக்க வேண்டாம், கிளற வேண்டாம், எட்டிப்பார்க்க வேண்டாம்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Fluffing and Resting", ta: "புரட்டுதல் மற்றும் ஓய்வு" },
          steps: [
            {
              step: 23,
              description: {
                en: "After exactly 15 minutes on dum, turn off the heat. CRITICAL: do NOT open the lid immediately. Let the vessel rest with the lid still tightly sealed for another 10-15 minutes — the trapped steam settles, the grains firm up, and the aroma sets evenly. Opening too early breaks the delicate Seeraga Samba grains.",
                ta: "சரியாக 15 நிமிடம் தம்முக்கு பிறகு, அடுப்பை அணைக்கவும். மிக முக்கியம்: உடனே மூடியை திறக்க வேண்டாம். பாத்திரத்தை அப்படியே மூடிய நிலையில் இன்னும் 10-15 நிமிடம் ஓய்வு கொடுக்கவும் — அடைபட்ட ஆவி நிலையாகி, தானியங்கள் இறுகி, வாசனை சீராக படியும். மிக சீக்கிரம் திறந்தால் மென்மையான சீரக சம்பா தானியங்கள் உடைந்துவிடும்.",
              },
            },
            {
              step: 24,
              description: {
                en: "Now open the lid — the aroma will fill the room. Using a flat ladle (not a spoon), gently fluff the biryani from the edges inward toward the center — lift and turn, don't stir. This protects the delicate grains and distributes mutton evenly.",
                ta: "இப்போது மூடியை திறக்கவும் — வாசனை அறை முழுவதும் பரவும். தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். இது மென்மையான தானியங்களை காப்பாற்றும், ஆட்டிறைச்சியும் சமமாக கலக்கும்.",
              },
            },
            {
              step: 25,
              description: {
                en: "Serve this masterclass Tamil Muslim wedding-style Bhai Veetu Biryani hot — paired with onion raita, brinjal curry (katarikai chops), and a wedge of lemon. This is the original kalyana panthi experience.",
                ta: "இந்த தமிழ் முஸ்லிம் கல்யாண பாணி பாய் வீட்டு பிரியாணியை — வெங்காய ரெய்தா, கத்திரிக்காய் சாப்ஸ் (கத்திரிக்காய் குழம்பு) மற்றும் ஒரு துண்டு எலுமிச்சையுடன் — சூடாக பரிமாறவும். இதுவே அசலான கல்யாண பந்தி அனுபவம்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Bhai Veetu Biryani recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
