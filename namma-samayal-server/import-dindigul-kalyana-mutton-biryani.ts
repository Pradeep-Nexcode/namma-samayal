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
  { slug: "mutton", name: "Mutton (bone-in biryani pieces, with a little fat)", ta: "ஆட்டிறைச்சி (எலும்பு உள்ள பிரியாணி துண்டுகள், சிறிது கொழுப்புடன்)", quantity: "1.5", unit: "kg" },
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "1.5", unit: "kg" },

  // Aromatic base (Dual Onion signature)
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, crushed) — 2:1 vs big onions", ta: "சின்ன வெங்காயம் (நசுக்கியது) — பெரிய வெங்காயத்தை விட 2:1", quantity: "300", unit: "g" },
  { slug: "big-onion", name: "Big Onion (Pallari, finely sliced)", ta: "பெரிய வெங்காயம் (மெல்லியதாக நறுக்கியது)", quantity: "150", unit: "g" },
  { slug: "tomato", name: "Tomato (finely chopped)", ta: "தக்காளி (நன்கு நறுக்கியது)", quantity: "200", unit: "g" },
  { slug: "garlic", name: "Garlic Paste (freshly ground) — 3:2 vs ginger", ta: "பூண்டு விழுது (புதிய) — இஞ்சியை விட 3:2", quantity: "150", unit: "g" },
  { slug: "ginger", name: "Ginger Paste (freshly ground)", ta: "இஞ்சி விழுது (புதிய)", quantity: "100", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli (slit)", ta: "பச்சை மிளகாய் (கீறியது)", quantity: "5", unit: "nos" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1", unit: "generous handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli)", ta: "கொத்தமல்லி", quantity: "1", unit: "generous handful" },

  // Fats, dairy, spices
  { slug: "groundnut-oil", name: "Groundnut Oil (Kadalai Ennai)", ta: "கடலை எண்ணெய்", quantity: "150", unit: "ml" },
  { slug: "ghee", name: "Ghee (Nei)", ta: "நெய்", quantity: "200", unit: "ml" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "10", unit: "g (~1 tbsp)" },
  { slug: "curd", name: "Curd (Thayir)", ta: "தயிர்", quantity: "100", unit: "g" },
  { slug: "cashew-nuts", name: "Cashew Nuts — fried in fat at start (royal signature)", ta: "முந்திரி — ஆரம்பத்தில் கொழுப்பில் வறுக்கப்படுகிறது (அரசியல் தனிச்சிறப்பு)", quantity: "50", unit: "g" },
  { slug: "cinnamon", name: "Cinnamon (Pattai)", ta: "இலவங்கப்பட்டை", quantity: "10", unit: "g" },
  { slug: "cardamom", name: "Cardamom (Yelakkai)", ta: "ஏலக்காய்", quantity: "5", unit: "g" },
  { slug: "cloves", name: "Cloves (Kirambu)", ta: "கிராம்பு", quantity: "2.5", unit: "g" },
  { slug: "crystal-salt", name: "Crystal Salt (Kalluppu)", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "dindigul-jaffer-kalyana-veetu-mutton-biryani";
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
        en: "Dindigul Jaffer Kalyana Veetu Mutton Biryani (Master Caterer's Wedding Biryani)",
        ta: "திண்டுக்கல் ஜாஃபர் கல்யாண வீட்டு ஆட்டிறைச்சி பிரியாணி (மாஸ்டர் கேட்டரர் கல்யாண பிரியாணி)",
      },
      title: "Dindigul Jaffer Kalyana Veetu Mutton Biryani",
      slug,
      description: {
        en: "The legendary Dindigul Muslim wedding-feast mutton biryani straight from Professor Mr. Yasin of Dindigul Jaffer Catering — three generations of mastery, scaled here for a 1.5 kg home batch. Built on four uncompromising rules: (1) the dual-onion signature (300g shallots + 150g big onions, 2:1 shallot-heavy) for both volume and the rustic Kongu sweetness, (2) the 3:2 garlic-to-ginger ratio (150g garlic + 100g ginger) that keeps Seeraga Samba grains delicate without ginger bitterness, (3) cashew nuts fried directly in the ghee + oil at the very start (50g pre-roasted in the fat) for a royal nutty undertone throughout the dish, and (4) NO masala powder shortcuts — heat from 5 slit green chillies + 10g red chilli powder only, depth from whole spices and the cashew-perfumed fat. Finished on banana-leaf-sealed dum for 20 minutes.",
        ta: "திண்டுக்கல் ஜாஃபர் கேட்டரிங்கின் பேராசிரியர் திரு. யாசின் நேரடியாக வழங்கும் புகழ்பெற்ற திண்டுக்கல் முஸ்லிம் கல்யாண-விருந்து ஆட்டிறைச்சி பிரியாணி — மூன்று தலைமுறை நிபுணத்துவம், 1.5 கிலோ வீட்டு அளவுக்கு அளவீடு செய்யப்பட்டது. நான்கு கட்டாய விதிகளில் கட்டப்பட்டது: (1) இரட்டை-வெங்காய தனிச்சிறப்பு (300 கிராம் சின்ன வெங்காயம் + 150 கிராம் பெரிய வெங்காயம், 2:1 சின்ன வெங்காயம் மேலதிகம்) — அளவுக்கும் கொங்கு கிராமத்து இனிமைக்கும், (2) 3:2 பூண்டு-இஞ்சி விகிதம் (150 கிராம் பூண்டு + 100 கிராம் இஞ்சி) — சீரக சம்பா தானியங்களை இஞ்சி கசப்பு இல்லாமல் மென்மையாக வைக்கும், (3) ஆரம்பத்திலேயே நெய் + எண்ணெயில் நேரடியாக வறுக்கப்படும் முந்திரி (50 கிராம் கொழுப்பில் முன் வறுக்கப்படுகிறது) — முழு உணவுக்கும் அரசியல் கொட்டை வாசனை, மற்றும் (4) மசாலா தூள் குறுக்கு வழி இல்லை — காரம் 5 கீறிய பச்சை மிளகாய் + 10 கிராம் மிளகாய் தூள் மட்டுமே, ஆழம் முழு மசாலா மற்றும் முந்திரி-வாசனை கொண்ட கொழுப்பிலிருந்தே. வாழை இலை-முத்திரை தம் 20 நிமிடம்.",
      },
      speciality: {
        en: "Four Jaffer Catering signatures define authentic Dindigul Kalyana Veetu Mutton Biryani: (1) The Dual-Onion Flavor Profile — most biryanis use ONLY big onions for volume or ONLY shallots for depth; Jaffer Catering uses BOTH in a precise 2:1 shallot-heavy ratio (300g shallots + 150g big onions). The big onions caramelize for color and body; the shallots dissolve into the gravy for that rustic Kongu sweetness. Drop either and you lose the Dindigul wedding identity. (2) The Golden 3:2 Garlic-to-Ginger Ratio — exactly 150g garlic vs 100g ginger. Master caterer wisdom: equal ginger ratios fight with delicate Seeraga Samba and leave a bitter, almost-medicinal finish in the rice; the deliberate garlic-heavy ratio keeps the base mellow and the rice clean-tasting. (3) The Royal Cashew Base — 50g of cashew nuts FRIED DIRECTLY in the ghee + groundnut oil at the very start, BEFORE the onions. This perfumes the ENTIRE fat layer with a nutty undertone that carries through every grain of rice — a wedding-feast trick most street biryani versions skip. (4) The Master Caterer's Touch — this is the exact wedding-batch formula from three generations of Jaffer Catering mastery, scaled precisely to a 1.5 kg home batch. The ratios are not approximate — they are commercially proven across thousands of wedding plates.",
        ta: "அசலான திண்டுக்கல் கல்யாண வீட்டு ஆட்டிறைச்சி பிரியாணியின் நான்கு ஜாஃபர் கேட்டரிங் தனிச்சிறப்புகள்: (1) இரட்டை-வெங்காய சுவை சுயவிவரம் — பெரும்பாலான பிரியாணிகள் அளவுக்கு பெரிய வெங்காயம் மட்டுமே அல்லது ஆழத்துக்கு சின்ன வெங்காயம் மட்டுமே பயன்படுத்துகின்றன; ஜாஃபர் கேட்டரிங் இரண்டையும் சரியான 2:1 சின்ன வெங்காயம்-மேலதிக விகிதத்தில் (300 கிராம் சின்ன வெங்காயம் + 150 கிராம் பெரிய வெங்காயம்) பயன்படுத்துகிறது. பெரிய வெங்காயம் நிறம் மற்றும் அளவுக்கு கருகுகிறது; சின்ன வெங்காயம் கிராமத்து கொங்கு இனிமைக்கு குழம்பில் கரைகிறது. ஏதேனும் ஒன்றை தவிர்த்தால் திண்டுக்கல் கல்யாண அடையாளம் இழக்கப்படும். (2) தங்க 3:2 பூண்டு-இஞ்சி விகிதம் — சரியாக 150 கிராம் பூண்டு எதிராக 100 கிராம் இஞ்சி. மாஸ்டர் கேட்டரர் ஞானம்: சம இஞ்சி விகிதம் மென்மையான சீரக சம்பாவுடன் சண்டையிட்டு, சாதத்தில் கசப்பான, கிட்டத்தட்ட-மருந்து போன்ற முடிவை விடும்; வேண்டுமென்றே பூண்டு-மேலதிக விகிதம் அடிப்படையை மென்மையாகவும், சாத்தை தூய்மையான சுவையாகவும் வைக்கிறது. (3) அரசியல் முந்திரி அடிப்படை — 50 கிராம் முந்திரி ஆரம்பத்திலேயே, வெங்காயம் சேர்ப்பதற்கு முன், நெய் + கடலை எண்ணெயில் நேரடியாக வறுக்கப்படுகிறது. இது முழு கொழுப்பு அடுக்கையும் கொட்டை வாசனையால் வாசனை மிக்கதாக்குகிறது — ஒவ்வொரு அரிசி தானியத்துக்கும் கொண்டு செல்லும். இது பெரும்பாலான தெரு பிரியாணி பதிப்புகள் தவிர்க்கும் கல்யாண-விருந்து சூட்சும். (4) மாஸ்டர் கேட்டரர் தொடுதல் — இது மூன்று தலைமுறைகளின் ஜாஃபர் கேட்டரிங் நிபுணத்துவத்திலிருந்து சரியான கல்யாண-தொகுதி சூத்திரம், 1.5 கிலோ வீட்டு அளவுக்கு துல்லியமாக அளவீடு செய்யப்பட்டது. விகிதங்கள் தோராயமானவை அல்ல — ஆயிரக்கணக்கான கல்யாண தட்டுகளில் வணிக ரீதியாக சோதிக்கப்பட்டவை.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        city: "Dindigul",
      },
      prepTime: 40,
      cookingTime: 90,
      totalTime: 130,
      servings: 12,
      difficulty: "hard",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=DqGl43TlGkg",
      },
      tags: [
        "non-veg",
        "biryani",
        "mutton-biryani",
        "dindigul",
        "kalyana-veetu",
        "kalyana-biryani",
        "wedding-biryani",
        "muslim-wedding",
        "jaffer-catering",
        "professor-yasin",
        "seeraga-samba",
        "dum-biryani",
        "dual-onion",
        "shallot-heavy",
        "cashew-base",
        "three-generations",
        "master-caterer",
        "feast",
        "virundhu",
        "tamil-nadu",
        "iconic",
        "traditional",
      ],
      searchKeywords: [
        "dindigul kalyana mutton biryani",
        "kalyana veetu biryani",
        "jaffer kalyana biryani",
        "professor yasin biryani",
        "wedding mutton biryani",
        "திண்டுக்கல் கல்யாண பிரியாணி",
        "ஜாஃபர் ஆட்டிறைச்சி பிரியாணி",
        "dindigul muslim wedding biryani",
        "kalyana biryani recipe",
        "seeraga samba mutton biryani",
        "tamil muslim wedding biryani",
        "cashew base mutton biryani",
        "chef deena dindigul mutton biryani",
        "dual onion biryani",
        "feast mutton biryani",
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
                en: "Wash the 1.5 kg of Seeraga Samba rice gently 2-3 times until the water runs clear. Soak in fresh water for 20-30 minutes. Drain just before adding to the broth.",
                ta: "1.5 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவவும். 20-30 நிமிடம் சுத்தமான தண்ணீரில் ஊறவைக்கவும். சாற்றில் சேர்ப்பதற்கு சற்று முன்பு வடிக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Clean the 1.5 kg of mutton thoroughly. Cut into medium biryani pieces — bone-in is essential for the marrow flavor, and a little fat marbling helps richness. Drain well.",
                ta: "1.5 கிலோ ஆட்டிறைச்சியை நன்கு சுத்தம் செய்யவும். நடுத்தர பிரியாணி துண்டுகளாக வெட்டவும் — மஜ்ஜை சுவைக்கு எலும்பு கட்டாயம், சிறிது கொழுப்பு கலந்திருந்தால் செழுமை அதிகரிக்கும். நன்கு வடிக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Peel the 300g of small onions and roughly crush them with the side of a knife (not finely chopped — coarse crush so they dissolve into the gravy naturally). Finely slice the 150g of big onions. Finely chop the 200g of tomatoes. Slit the 5 green chillies.",
                ta: "300 கிராம் சின்ன வெங்காயத்தை தோல் சீவி, கத்தியின் பக்கத்தால் கரகரப்பாக நசுக்கவும் (நன்கு நறுக்க வேண்டாம் — கரகரப்பாக நசுக்கினால் இயற்கையாக குழம்பில் கரையும்). 150 கிராம் பெரிய வெங்காயத்தை மெல்லியதாக நறுக்கவும். 200 கிராம் தக்காளியை நன்கு நறுக்கவும். 5 பச்சை மிளகாயை கீறவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Grind a FRESH garlic paste from 150g of garlic. Grind a SEPARATE fresh ginger paste from 100g of ginger. The 3:2 garlic-to-ginger ratio is the Dindigul wedding signature — equal ginger would leave a bitter finish in the delicate Seeraga Samba.",
                ta: "150 கிராம் பூண்டை புதிய விழுதாக அரைக்கவும். 100 கிராம் இஞ்சியை தனியாக புதிய விழுதாக அரைக்கவும். 3:2 பூண்டு-இஞ்சி விகிதம் திண்டுக்கல் கல்யாண தனிச்சிறப்பு — சம இஞ்சி மென்மையான சீரக சம்பாவில் கசப்பான முடிவை விடும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Pick the mint and coriander leaves off their stems and roughly chop. Whisk the 100g of curd until smooth.",
                ta: "புதினா மற்றும் கொத்தமல்லியை காம்பிலிருந்து பிரித்து பெரிய துண்டுகளாக நறுக்கவும். 100 கிராம் தயிரை மிருதுவாக கடையவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Royal Sauté (Cashew First!)", ta: "அரசியல் வதக்கல் (முதலில் முந்திரி!)" },
          steps: [
            {
              step: 6,
              description: {
                en: "Place a heavy-bottomed biryani dekchi over medium-high heat. Pour in the 150 ml of cold-pressed groundnut oil and the FULL 200 ml of pure ghee. The oil prevents the ghee from burning during the long sauté.",
                ta: "ஒரு தடிமனான பிரியாணி தேக்சியை மிதமான-உயர் தீயில் வைக்கவும். 150 மிலி மரச்செக்கு கடலை எண்ணெய் மற்றும் முழு 200 மிலி தூய நெய் ஊற்றவும். எண்ணெய் நீண்ட வதக்குதலில் நெய் கருகாமல் தடுக்கிறது.",
              },
            },
            {
              step: 7,
              description: {
                en: "Once the fat is hot, drop in the whole spices: 10g cinnamon, 5g cardamom, and 2.5g cloves. Let them crackle and bloom in the fat for 30-60 seconds.",
                ta: "கொழுப்பு சூடாகும் போது, முழு மசாலாக்களை சேர்க்கவும்: 10 கிராம் இலவங்கப்பட்டை, 5 கிராம் ஏலக்காய், மற்றும் 2.5 கிராம் கிராம்பு. 30-60 விநாடிகள் கொழுப்பில் வாசனை வெளிப்பட விடவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "ROYAL SIGNATURE STEP: add the 50g of cashew nuts NOW — before the onions. Roast them on medium heat for 2-3 minutes until they turn a beautiful golden brown. This 'pre-cashew' step is the Jaffer Catering trick that perfumes the ENTIRE fat with a nutty undertone — every grain of rice will carry it later.",
                ta: "அரசியல் தனிச்சிறப்பு படி: 50 கிராம் முந்திரியை இப்போது சேர்க்கவும் — வெங்காயத்துக்கு முன்பே. மிதமான தீயில் 2-3 நிமிடம் வறுக்கவும் — அழகான பொன்னிற பழுப்பு வரும் வரை. இந்த 'முதலில்-முந்திரி' படி ஜாஃபர் கேட்டரிங் சூட்சும் — முழு கொழுப்பையும் கொட்டை வாசனையால் வாசனை மிக்கதாக்குகிறது — ஒவ்வொரு அரிசி தானியமும் பின்னர் இதை சுமக்கும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Toss in the 150g of finely sliced big onions. Sauté patiently on medium heat, stirring often, until they turn TRANSLUCENT (about 7-9 minutes). Note: don't brown them deeply — Dindigul Kalyana biryani stays light golden, not dark like a Bhai-style biryani.",
                ta: "150 கிராம் மெல்லியதாக நறுக்கிய பெரிய வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, பளபளப்பாகும் வரை — சுமார் 7-9 நிமிடம் — பொறுமையாக வதக்கவும். குறிப்பு: ஆழமாக கருக்க வேண்டாம் — திண்டுக்கல் கல்யாண பிரியாணி பாய் பாணி பிரியாணி போல கருப்பாக இல்லாமல், லேசான பொன்னிறமாக இருக்கிறது.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Building the Mutton Masala Base (Dual Onion + 3:2 GG)", ta: "ஆட்டிறைச்சி மசாலா அடிப்படை (இரட்டை வெங்காயம் + 3:2 பூண்டு-இஞ்சி)" },
          steps: [
            {
              step: 10,
              description: {
                en: "DUAL-ONION TIME: add the FULL 300g of crushed small onions on top of the now-translucent big onions. Sauté for 3-4 minutes — the shallots will start dissolving into the fat while the big onions hold their slice shape. This dual texture is the Dindigul wedding signature.",
                ta: "இரட்டை-வெங்காய நேரம்: இப்போது பளபளக்கும் பெரிய வெங்காயத்தின் மேல் முழு 300 கிராம் நசுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். 3-4 நிமிடம் வதக்கவும் — சின்ன வெங்காயம் கொழுப்பில் கரைய ஆரம்பிக்கும், பெரிய வெங்காயம் தனது நறுக்கு வடிவத்தை தாங்கி நிற்கும். இந்த இரட்டை பதம் திண்டுக்கல் கல்யாண தனிச்சிறப்பு.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the freshly ground GARLIC paste FIRST (150g) — garlic first, ginger second is the Dindigul order. Sauté vigorously for 2-3 minutes until the raw garlic smell completely vanishes.",
                ta: "புதிய பூண்டு விழுதை முதலில் சேர்க்கவும் (150 கிராம்) — முதலில் பூண்டு, பின்னர் இஞ்சி என்பது திண்டுக்கல் வரிசை. பச்சை பூண்டு வாசனை முற்றிலும் போகும் வரை 2-3 நிமிடம் வேகமாக வதக்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Now add the freshly ground GINGER paste (100g). Sauté another 1-2 minutes until the raw ginger smell also disappears.",
                ta: "இப்போது புதிய இஞ்சி விழுதை (100 கிராம்) சேர்க்கவும். பச்சை இஞ்சி வாசனையும் முற்றிலும் போகும் வரை மேலும் 1-2 நிமிடம் வதக்கவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Drop in the 5 slit green chillies along with the full handfuls of fresh mint and coriander leaves. Let the herbs WILT into the hot, nut-infused ghee for 30-60 seconds — their oils release directly into the cashew-perfumed fat layer.",
                ta: "5 கீறிய பச்சை மிளகாயை, முழு கைப்பிடி புதினா மற்றும் கொத்தமல்லியுடன் சேர்க்கவும். மூலிகைகளை சூடான, முந்திரி-வாசனை கொண்ட நெய்யில் 30-60 விநாடிகள் வாட விடவும் — அவற்றின் எண்ணெய்கள் முந்திரி-வாசனை கொழுப்பு அடுக்கில் நேரடியாக வெளியேறும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Add the 200g of chopped tomatoes, the 10g of red chilli powder, and a generous handful of crystal salt. Sauté continuously on medium heat until the tomatoes break down COMPLETELY and the ghee floats to the surface as a clear glossy layer — about 6-8 minutes.",
                ta: "200 கிராம் நறுக்கிய தக்காளி, 10 கிராம் மிளகாய் தூள், மற்றும் தாராளமான கல் உப்பு சேர்க்கவும். மிதமான தீயில், தக்காளி முற்றிலும் குழைந்து, மேலே நெய் தெளிவான பளபளக்கும் அடுக்காக மிதக்கும் வரை — சுமார் 6-8 நிமிடம் — தொடர்ந்து வதக்கவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Lower the heat. Stir in the 100g of whisked curd GRADUALLY (so it doesn't split). Mix until the masala is uniform and creamy-looking.",
                ta: "தீயை குறைக்கவும். 100 கிராம் கடைந்த தயிரை மெதுவாக சேர்க்கவும் (பிரியாமல் இருக்க). மசாலா சீராக மற்றும் வெண்மை போன்று மாறும் வரை கலக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Mutton", ta: "ஆட்டிறைச்சி வேக வைத்தல்" },
          steps: [
            {
              step: 16,
              description: {
                en: "Add the FULL 1.5 kg of bone-in mutton pieces directly into this rich, cashew-perfumed masala base. Stir thoroughly so every piece is coated.",
                ta: "முழு 1.5 கிலோ எலும்பு கொண்ட ஆட்டிறைச்சி துண்டுகளை நேரடியாக இந்த செழுமையான, முந்திரி-வாசனை மசாலா அடிப்படையில் சேர்க்கவும். ஒவ்வொரு துண்டிலும் மசாலா படியும்படி நன்கு கலக்கவும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Sauté the meat vigorously for 10-15 minutes on medium-high heat, turning often, so the mutton SEARS and LOCKS IN the spices — it should change color from pink to deep brown and start releasing its own juices.",
                ta: "மிதமான-உயர் தீயில், அடிக்கடி புரட்டி, ஆட்டிறைச்சி வறுபட்டு, மசாலாக்களை உள்ளீர்க்க — இறைச்சி இளஞ்சிவப்பிலிருந்து ஆழமான பழுப்பாக நிறம் மாறி, தனது சாற்றை வெளியேற்ற ஆரம்பிக்கும் வரை — 10-15 நிமிடம் வேகமாக வதக்கவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Pour in enough water to cook the mutton — just enough to submerge it, with a couple of inches above. Cover the vessel and let it boil VIGOROUSLY on medium-high until the mutton is 80-90% tender. For bone-in mutton this typically takes 40-50 minutes; alternatively pressure-cook the masala-mutton mixture for 4-5 whistles to save time.",
                ta: "ஆட்டிறைச்சி வேக போதிய தண்ணீர் ஊற்றவும் — மூழ்கும் அளவு, மேலே சில அங்குலம் இருக்க. பாத்திரத்தை மூடி, ஆட்டிறைச்சி 80-90% மிருதுவாகும் வரை மிதமான-உயர் தீயில் நன்கு கொதிக்க விடவும். எலும்பு கொண்ட ஆட்டிறைச்சிக்கு வழக்கமாக 40-50 நிமிடம் ஆகும்; அல்லது நேரத்தை சேமிக்க, மசாலா-ஆட்டிறைச்சி கலவையை குக்கரில் 4-5 விசில் வேக வைக்கலாம்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Adjusting Stock & Adding Rice", ta: "சாறை சரிசெய்தல் + அரிசி சேர்த்தல்" },
          steps: [
            {
              step: 19,
              description: {
                en: "Once the mutton is tender, measure the remaining stock in the pot and TOP IT UP with enough boiling water to total the required rice-cooking liquid — roughly 2-2.5 liters total for 1.5 kg of Seeraga Samba (Seeraga Samba is small-grained and absorbs less water than regular rice).",
                ta: "ஆட்டிறைச்சி மிருதுவான பின், பாத்திரத்தில் மீதமுள்ள சாற்றை அளவீடு செய்து, அரிசி வேக தேவையான திரவத்துக்கு போதிய கொதிக்கும் தண்ணீரை சேர்க்கவும் — 1.5 கிலோ சீரக சம்பாவுக்கு மொத்தம் சுமார் 2-2.5 லிட்டர் (சீரக சம்பா சிறு தானியம், சாதாரண அரிசியை விட குறைவான தண்ணீர் உள்ளீர்க்கும்).",
              },
            },
            {
              step: 20,
              description: {
                en: "Critical salt check: taste the boiling broth. It must be slightly saltier than a normal soup — distinctly seawater-salty. The rice will absorb a lot of this salt as it cooks. Adjust crystal salt now.",
                ta: "மிக முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். சாதாரண சூப்பை விட சற்று அதிக உப்பு — தெளிவாக கடல்நீர் உப்பு — இருக்க வேண்டும். அரிசி வேக வேக இந்த உப்பை நிறைய உள்ளீர்க்கும். இப்போது கல் உப்பை சரிசெய்யவும்.",
              },
            },
            {
              step: 21,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice. Gently slide the rice into the boiling broth — don't dump it in. Mix once VERY gently from the bottom; Seeraga Samba grains break easily.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுமையாக வடிக்கவும். கொதிக்கும் சாற்றில் அரிசியை மெதுவாக சேர்க்கவும் — வேகமாக போட வேண்டாம். அடியிலிருந்து மிக மெதுவாக ஒரு முறை கலக்கவும்; சீரக சம்பாவின் தானியங்கள் எளிதில் உடையும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Masterful Dum", ta: "மாஸ்டர் தம்" },
          steps: [
            {
              step: 22,
              description: {
                en: "Cook on medium-high flame, UNCOVERED, until about 70-80% of the water has evaporated and the rice grains start peeking through the surface — usually 8-12 minutes for 1.5 kg of Seeraga Samba. This is the dum-ready signal.",
                ta: "மிதமான-உயர் தீயில் மூடாமல், சுமார் 70-80% தண்ணீர் ஆவியாகி, அரிசி தானியங்கள் மேற்பரப்பில் தெரிய ஆரம்பிக்கும் வரை — 1.5 கிலோ சீரக சம்பாவுக்கு வழக்கமாக 8-12 நிமிடம் — வேக விடவும். இதுவே தம் வைக்க தயார் என்பதற்கான அடையாளம்.",
              },
            },
            {
              step: 23,
              description: {
                en: "Lower the flame to the absolute minimum (a steady simmer). Seal the vessel tightly with a banana leaf placed under a heavy lid (traditional Jaffer Catering method) or with a tight lid + heavy weight + wheat-dough seal around the edges. Leave it on dum for EXACTLY 20 minutes, undisturbed.",
                ta: "தீயை மிக குறைந்த அளவுக்கு குறைக்கவும் (சிறிய நிலையான கொதிநிலை). கனமான மூடியின் கீழ் வாழை இலையை வைத்து பாத்திரத்தை இறுக்கமாக மூடவும் (பாரம்பரிய ஜாஃபர் கேட்டரிங் முறை) அல்லது இறுக்கமான மூடி + கனமான பாரம் + ஓரத்தில் கோதுமை மாவு முத்திரையால் மூடவும். சரியாக 20 நிமிடம் தொடாமல் தம்மில் வைக்கவும்.",
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
                en: "Turn off the heat. Let the vessel rest with the seal still intact for another 10 minutes — the trapped cashew-ghee-mutton aroma settles into every grain.",
                ta: "அடுப்பை அணைக்கவும். முத்திரையை அப்படியே வைத்து இன்னும் 10 நிமிடம் ஓய்வு கொடுக்கவும் — அடைபட்ட முந்திரி-நெய்-ஆட்டிறைச்சி வாசனை ஒவ்வொரு தானியத்திலும் நிலையாகும்.",
              },
            },
            {
              step: 25,
              description: {
                en: "Open the lid — the unmistakable wedding-feast aroma will fill the room (cashew + ghee + mutton marrow + cardamom + mint). Using a flat ladle (not a spoon), gently fluff the rice from the edges inward toward the center — lift and turn, don't stir. The delicate Seeraga Samba grains break if stirred.",
                ta: "மூடியை திறக்கவும் — தனிச்சிறப்பான கல்யாண-விருந்து வாசனை அறை முழுவதும் பரவும் (முந்திரி + நெய் + ஆட்டிறைச்சி மஜ்ஜை + ஏலக்காய் + புதினா). தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். மென்மையான சீரக சம்பா தானியங்கள் கிளறினால் உடையும்.",
              },
            },
            {
              step: 26,
              description: {
                en: "Serve this majestic Dindigul Kalyana Veetu Mutton Biryani steaming hot. The traditional Jaffer Catering wedding pairing: a cool onion-mint raita AND a generous pour of Dindigul Dalcha (the meat-bone-brinjal dal stew). A wedge of lemon, a few extra ghee-roasted cashews on top, and visible mutton pieces sticking up — that's the Kalyana Veetu presentation.",
                ta: "இந்த சிறப்பான திண்டுக்கல் கல்யாண வீட்டு ஆட்டிறைச்சி பிரியாணியை சூடாக பரிமாறவும். பாரம்பரிய ஜாஃபர் கேட்டரிங் கல்யாண சேர்க்கை: குளிர்ந்த வெங்காய-புதினா ரெய்தா மற்றும் தாராளமான திண்டுக்கல் தால்சா (இறைச்சி-எலும்பு-கத்திரிக்காய் பருப்பு குழம்பு). ஒரு துண்டு எலுமிச்சை, மேலே சில கூடுதல் நெய்-வறுத்த முந்திரி, மற்றும் தெரியும்படி ஆட்டிறைச்சி துண்டுகள் — அதுவே கல்யாண வீட்டு வழங்கல்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Dindigul Kalyana Veetu Mutton Biryani recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
