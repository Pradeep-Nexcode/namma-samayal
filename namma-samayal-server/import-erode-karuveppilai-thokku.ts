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
  { slug: "curry-leaves", name: "Fresh Curry Leaves (washed and FULLY dried)", ta: "கருவேப்பிலை (கழுவி, முற்றிலும் வடித்தது)", quantity: "2-3", unit: "large handfuls" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, peeled)", ta: "சின்ன வெங்காயம் (தோல் சீவியது)", quantity: "1", unit: "handful" },
  { slug: "coriander-seeds", name: "Whole Coriander Seeds (Muzhu Dhaniya)", ta: "முழு கொத்தமல்லி விதை", quantity: "1", unit: "tbsp" },
  { slug: "cumin-seeds", name: "Cumin Seeds (Seeragam — STAR spice, anti-acidity hack)", ta: "சீரகம் (முக்கிய பொருள் — அமிலத்தடுப்பு ரகசியம்)", quantity: "1.5-2", unit: "tbsp" },
  { slug: "black-pepper", name: "Black Pepper (Milagu)", ta: "மிளகு", quantity: "1", unit: "tsp" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "5-7", unit: "nos" },
  { slug: "tamarind", name: "Tamarind (medium gooseberry-sized piece)", ta: "புளி (நெல்லிக்காய் அளவு)", quantity: "1", unit: "medium piece" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { slug: "gingelly-oil-sesame-oil", name: "Gingelly Oil (Nallennai) — for roasting + raw drizzle on rice", ta: "எள்ளெண்ணெய் (நல்லெண்ணெய்) — வறுக்க + சாதத்தில் பச்சை ஊற்ற", quantity: "2-3", unit: "tbsp" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-aaya-karuveppilai-thokku";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "herbs-leaves" }) || await Category.findOne();
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
        en: "Erode Aaya's Karuveppilai Thokku (Curry Leaves Chutney)",
        ta: "ஈரோடு ஆயா கருவேப்பிலை தொக்கு",
      },
      slug,
      description: {
        en: "A traditional Kongu summer chutney from Erode Aaya (Grandma Palaniyamma) — built almost entirely around 2-3 large handfuls of fresh curry leaves, slow-roasted in gingelly oil with whole coriander, a heavy dose of cumin (the anti-acidity star), black pepper and dry red chillies, then stone-ground (ammikkal) into a thick, deliberately COARSE thokku — never a smooth paste. The chutney solves three real problems at once: (1) most tamarind chutneys cause heartburn — Aaya's generous cumin completely prevents it; (2) modern recipes add urad dal for bulk — Aaya forbids it because urad turns curry leaves slimy and ruins the rustic texture; (3) curry leaves are cooling for the body in summer heat and famously rich in iron + scalp-strengthening compounds (hair-fall remedy). Best eaten the village way — a hot mound of plain white rice, a well in the center, a spoonful of thokku, and a drizzle of raw cold-pressed gingelly oil mixed in by hand.",
        ta: "ஈரோடு ஆயா (பாலனியம்மா பாட்டியின்) பாரம்பரிய கொங்கு கோடைகால சட்னி — 2-3 பெரிய கைப்பிடி புதிய கருவேப்பிலையை எள்ளெண்ணெயில் மெதுவாக வறுத்து, முழு கொத்தமல்லி, அதிக சீரகம் (அமிலத்தடுப்பு முக்கிய பொருள்), மிளகு, காய்ந்த மிளகாயுடன் சேர்த்து, அம்மிக்கல்லில் கெட்டியான, வேண்டுமென்றே கரகரப்பான தொக்காக அரைக்கப்படுகிறது — மிருதுவான விழுது அல்ல. மூன்று உண்மையான பிரச்சினைகளை ஒரே நேரத்தில் தீர்க்கிறது: (1) பெரும்பாலான புளி சட்னிகள் நெஞ்செரிச்சல் தரும் — ஆயாவின் அதிக சீரகம் இதை முற்றிலும் தடுக்கிறது; (2) நவீன சட்னிகள் உளுந்தை கெட்டியாக்க சேர்க்கின்றன — ஆயா இதை தடை செய்கிறார், ஏனெனில் உளுந்து கருவேப்பிலையை வழவழப்பாக்கி கிராமத்து பதத்தை கெடுக்கும்; (3) கருவேப்பிலை கோடை வெப்பத்தில் உடலுக்கு குளிர்ச்சி, இரும்புச்சத்து நிறைந்தது, தலைமுடி உதிர்தலை தடுக்கும். கிராமத்து முறையில் சாப்பிடுவதே சிறந்தது — சூடான வெள்ளை சாதத்தில் பள்ளம் செய்து, ஒரு ஸ்பூன் தொக்கு வைத்து, பச்சை மரச்செக்கு எள்ளெண்ணெய் ஊற்றி கையால் பிசைந்து சாப்பிடவும்.",
      },
      speciality: {
        en: "Four Erode Aaya signatures define this thokku: (1) The Anti-Acidity Cumin Hack — most tamarind-based chutneys cause heartburn (nenjerichal); Aaya's secret is a heavily generous 1½-2 tablespoons of cumin seeds (seeragam), which completely prevents heartburn AND adds an incredibly refreshing aromatic flavor that makes you want to eat more. This is non-negotiable. (2) The 'No Urad Dal' Rule — Aaya strictly forbids urad dal in this recipe (unlike modern city versions); urad dal makes the curry leaves turn slimy (vala-valappa) and ruins the rustic texture entirely. (3) The Stone-Ground Coarse Texture (Kora-Korappa) — never a smooth paste; grind only to 80-90% so the thokku stays slightly coarse and grainy. The traditional ammikkal (stone mortar) gives the best texture; if using mixer, pulse don't run continuously. Coarseness is the whole reason it pairs with idli/dosa/rice. (4) The Summer Health Powerhouse — curry leaves are cooling for the body, rich in iron, and famously prevent hair fall and promote thick hair growth. This recipe is designed as a summer staple, not a one-off side.",
        ta: "ஈரோடு ஆயாவின் நான்கு தனிச்சிறப்புகள்: (1) அமிலத்தடுப்பு சீரக ரகசியம் — பெரும்பாலான புளி சட்னிகள் நெஞ்செரிச்சல் தரும்; ஆயாவின் ரகசியம், மிகவும் தாராளமான 1½-2 ஸ்பூன் சீரகம் — இது நெஞ்செரிச்சலை முற்றிலும் தடுக்கும், மேலும் ஒரு புத்துணர்ச்சியான வாசனை சுவையை சேர்க்கும், இன்னும் சாப்பிட தோன்றும். இதில் பேச்சுவார்த்தை இல்லை. (2) 'உளுந்து இல்லை' விதி — நகர பதிப்புகளில் இருந்து வேறுபட்டு, ஆயா இந்த உணவில் உளுந்தை கண்டிப்பாக தடை செய்கிறார்; உளுந்து கருவேப்பிலையை வழவழப்பாக்கி (வளவளப்ப), முழு கிராமத்து பதத்தையும் கெடுக்கும். (3) அம்மிக்கல் கரகரப்பு பதம் — மிருதுவான விழுதாக ஒருபோதும் அரைக்க வேண்டாம்; வெறும் 80-90% மட்டுமே அரைக்கவும், சற்று கரகரப்பாக (கொர-கொரப்ப) இருக்க. பாரம்பரிய அம்மிக்கல் சிறந்த பதத்தை தரும்; மிக்ஸியில் என்றால், தொடர்ந்து இயக்காமல் பல்ஸ் செய்யவும். இந்த கரகரப்பே இதை இட்லி/தோசை/சாதத்துடன் சரியாக பொருந்த வைக்கிறது. (4) கோடைகால சக்தி உணவு — கருவேப்பிலை உடலுக்கு குளிர்ச்சி, இரும்புச்சத்து நிறைந்தது, தலைமுடி உதிர்தலை தடுத்து அடர்த்தியாக வளர உதவும். இது ஒரு கோடைகால அன்றாட உணவாக வடிவமைக்கப்பட்டுள்ளது, ஒரு முறை செய்யும் சைடு டிஷ் அல்ல.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 10,
      cookingTime: 15,
      totalTime: 25,
      servings: 6,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "veg",
        "vegan",
        "thokku",
        "chutney",
        "thogayal",
        "karuveppilai-thokku",
        "curry-leaves-chutney",
        "side-dish",
        "rice-mix",
        "idli-side",
        "dosa-side",
        "summer-recipe",
        "cooling",
        "iron-rich",
        "hair-fall-remedy",
        "anti-acidity",
        "no-urad-dal",
        "coarse-ground",
        "ammikkal",
        "stone-ground",
        "no-tempering",
        "erode",
        "kongu",
        "tamil-nadu",
        "traditional",
        "rustic",
        "health-food",
        "ayurvedic",
      ],
      searchKeywords: [
        "karuveppilai thokku",
        "karuveppilai chutney",
        "curry leaves thokku",
        "curry leaves chutney",
        "கருவேப்பிலை தொக்கு",
        "கருவேப்பிலை சட்னி",
        "erode aaya thokku",
        "palaniyamma karuveppilai",
        "hair fall remedy chutney",
        "iron rich chutney",
        "summer chutney",
        "anti acidity chutney",
        "no urad dal thokku",
        "chef deena karuveppilai",
        "kongu karuveppilai",
        "rice mix thokku",
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
                en: "Pick 2-3 large handfuls of fresh curry leaves off their stems. Wash them gently 2 times in cold water to remove dust, then spread them on a kitchen towel and pat or air-dry them COMPLETELY. Critical: any leftover moisture will turn the chutney into a paste during roasting and ruin the rustic coarse texture.",
                ta: "2-3 பெரிய கைப்பிடி புதிய கருவேப்பிலையை காம்பிலிருந்து பிரிக்கவும். குளிர்ந்த தண்ணீரில் 2 முறை மெதுவாக கழுவி, தூசு நீக்கவும். பின் சமையலறை துண்டில் பரப்பி, ஈரம் இல்லாமல் முற்றிலும் காய வைக்கவும். மிக முக்கியம்: சிறிது ஈரம் இருந்தாலும், வறுக்கும் போது சட்னி விழுதாக மாறி, கரகரப்பான கிராமத்து பதம் கெடும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Peel a handful of small onions and keep them whole. Have the tamarind (medium gooseberry-sized piece) ready, the whole spices measured out, and a separate cooling plate ready for the roasted items.",
                ta: "ஒரு கைப்பிடி சின்ன வெங்காயத்தை தோல் சீவி முழுதாக வைக்கவும். புளி (நெல்லிக்காய் அளவு துண்டு) தயாராக வைக்கவும், முழு மசாலாக்களை அளவீடு செய்து வைக்கவும், வறுத்தவற்றை ஆற வைக்க தனி தட்டு ஒன்றை தயார் செய்து வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Roasting the Spices", ta: "மசாலா வறுத்தல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat a heavy-bottomed iron pan or small clay pot over LOW flame. Add 1 tablespoon of cold-pressed gingelly oil. Don't use high heat for this entire dish — burnt spices = bitter thokku.",
                ta: "ஒரு தடிமனான இரும்பு கடாய் அல்லது சிறு மண்சட்டியை குறைந்த தீயில் சூடாக்கவும். 1 ஸ்பூன் மரச்செக்கு எள்ளெண்ணெய் சேர்க்கவும். முழு உணவிற்கும் அதிக தீ பயன்படுத்த வேண்டாம் — கருகிய மசாலா = கசக்கும் தொக்கு.",
              },
            },
            {
              step: 4,
              description: {
                en: "Add the 1 tablespoon whole coriander seeds, the heavy 1½-2 tablespoons of cumin seeds (this is the anti-acidity star — don't reduce), and 1 teaspoon black pepper.",
                ta: "1 ஸ்பூன் முழு கொத்தமல்லி விதை, அதிக 1½-2 ஸ்பூன் சீரகம் (இது அமிலத்தடுப்பு முக்கிய பொருள் — குறைக்க வேண்டாம்), மற்றும் 1 ஸ்பூன் மிளகு சேர்க்கவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Toss in the 5-7 dry red chillies. Roast everything together patiently on a low flame, stirring continuously, until the whole spices turn deeply aromatic and slightly golden — about 3-5 minutes. Don't burn them; over-roasted spices ruin the dish.",
                ta: "5-7 காய்ந்த மிளகாயை சேர்க்கவும். குறைந்த தீயில் தொடர்ந்து கிளறி, மசாலாக்கள் ஆழமான வாசனை வீசி, லேசான பொன்னிறம் வரும் வரை — சுமார் 3-5 நிமிடம் — பொறுமையாக ஒன்றாக வறுக்கவும். கருக விட வேண்டாம்; அதிகம் வறுத்தால் உணவு கெடும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Transfer all the roasted spices to a separate plate to cool completely. Don't grind them hot — they'd turn to oily paste instead of dry coarse powder.",
                ta: "வறுத்த மசாலாக்களை அனைத்தையும் ஒரு தனி தட்டுக்கு மாற்றி, முற்றிலும் ஆற விடவும். சூடாக இருக்கும்போது அரைக்க வேண்டாம் — காய்ந்த கரகரப்பு தூளுக்கு பதிலாக எண்ணெய் கலந்த விழுதாக மாறிவிடும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Onions & Tamarind", ta: "வெங்காயம் மற்றும் புளி வதக்கல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "In the same pan, add a few drops of oil only if needed. Drop in the handful of peeled small onions and sauté on a low-medium flame until they soften and turn translucent — about 4-5 minutes. Don't brown them — that comes from a deeper sauté, not what's wanted here.",
                ta: "அதே கடாயில், தேவைப்பட்டால் சில துளி எண்ணெய் சேர்க்கவும். ஒரு கைப்பிடி தோல் சீவிய சின்ன வெங்காயத்தை சேர்த்து, குறைந்த-மிதமான தீயில், மிருதுவாகி, பளபளப்பாகும் வரை — சுமார் 4-5 நிமிடம் — வதக்கவும். பழுப்பாக்க வேண்டாம் — அது ஆழமான வதக்குதலில் வரும், இங்கு வேண்டியதில்லை.",
              },
            },
            {
              step: 8,
              description: {
                en: "Just before turning off the heat for this step, drop the medium gooseberry-sized piece of tamarind directly into the hot pan with the onions. The residual heat will soften the tamarind slightly without browning it. Transfer the sautéed onions + tamarind to the same cooling plate as the spices.",
                ta: "இந்த படியின் இறுதியில், அடுப்பை அணைப்பதற்கு சற்று முன், நெல்லிக்காய் அளவு புளியை வெங்காயத்துடன் சூடான கடாயில் நேரடியாக சேர்க்கவும். மீதமுள்ள வெப்பத்தில் புளி பழுப்பாகாமல், லேசாக மிருதுவாகும். வதங்கிய வெங்காயம் + புளியை, மசாலா ஆற வைத்த அதே தட்டுக்கு மாற்றவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Wilting the Curry Leaves", ta: "கருவேப்பிலை வாட்டுதல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Add another tablespoon of gingelly oil to the pan over medium-low heat.",
                ta: "அதே கடாயில், மிதமான-குறைந்த தீயில், மற்றொரு ஸ்பூன் எள்ளெண்ணெய் சேர்க்கவும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Drop in the completely-dried fresh curry leaves all at once. Sauté them continuously on medium-low flame, tossing every few seconds.",
                ta: "முற்றிலும் காய்ந்த புதிய கருவேப்பிலையை அனைத்தையும் ஒரே நேரத்தில் சேர்க்கவும். மிதமான-குறைந்த தீயில், சில விநாடிகளுக்கு ஒருமுறை புரட்டி, தொடர்ந்து வதக்கவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "You want the leaves to SHRINK, wilt, and turn slightly crispy while keeping their vibrant dark green color — about 2-3 minutes. Critical: do NOT let them turn brown or black. Burnt curry leaves = bitter thokku, irreversibly.",
                ta: "இலைகள் சுருங்கி, வாடி, லேசாக மொறுமொறுப்பாக மாற வேண்டும் — ஆனாலும் அவற்றின் அடர் பச்சை நிறம் இழக்க கூடாது — சுமார் 2-3 நிமிடம். மிக முக்கியம்: அவை பழுப்பு அல்லது கருப்பாக மாற கூடாது. கருகிய கருவேப்பிலை = கசக்கும் தொக்கு, திருத்த முடியாது.",
              },
            },
            {
              step: 12,
              description: {
                en: "Turn off the heat and let the leaves cool to room temperature on the same plate.",
                ta: "அடுப்பை அணைத்து, இலைகளை அறை வெப்பநிலைக்கு அதே தட்டில் ஆற விடவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Traditional Grind (Layered Pulse)", ta: "பாரம்பரிய அரைத்தல் (அடுக்கு பல்ஸ்)" },
          steps: [
            {
              step: 13,
              description: {
                en: "Best method: a traditional stone mortar (ammikkal/sekku) — that's the authentic way and gives the perfect coarse texture. If using a mixer, ensure the jar is COMPLETELY DRY.",
                ta: "சிறந்த முறை: பாரம்பரிய அம்மிக்கல்/செக்கு — அதுவே அசலான முறை, சரியான கரகரப்பு பதம் தரும். மிக்ஸி பயன்படுத்தினால், பாட்டில் முற்றிலும் வரண்டே இருக்க வேண்டும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Add the cooled roasted dry spices + red chillies + crystal salt to taste FIRST. Pulse them briefly into a coarse powder (not a fine powder). Order matters: spices first, leaves last.",
                ta: "முதலில் ஆறிய வறுத்த காய்ந்த மசாலா + காய்ந்த மிளகாய் + தேவையான கல் உப்பு ஐ சேர்க்கவும். அவற்றை சுருக்கமாக பல்ஸ் செய்து கரகரப்பான தூளாக மாற்றவும் (மிருதுவான தூள் அல்ல). வரிசை முக்கியம்: முதலில் மசாலா, கடைசியில் இலைகள்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Next, add the sautéed small onions and the softened tamarind. Pulse again briefly to incorporate them — still keep it coarse.",
                ta: "அடுத்து, வதங்கிய சின்ன வெங்காயம் மற்றும் மிருதுவான புளியை சேர்க்கவும். அவை கலக்கும் வரை மீண்டும் சுருக்கமாக பல்ஸ் செய்யவும் — இன்னும் கரகரப்பாகவே வைக்கவும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Finally, add the cooled, wilted curry leaves. Pulse carefully — add only a VERY tiny splash of water if absolutely necessary for the mixer to move. CRUCIAL: the final texture should be THICK, slightly coarse (kora-korappa), grain-like — 80-90% ground at most, NEVER a smooth watery paste. Stop pulsing the moment everything is incorporated.",
                ta: "கடைசியாக, ஆறிய, வாடிய கருவேப்பிலையை சேர்க்கவும். கவனமாக பல்ஸ் செய்யவும் — மிக்ஸி நகர மிக மிக சிறிய தண்ணீர் மட்டுமே சேர்க்கவும், அதுவும் கட்டாயமாக தேவைப்பட்டால் மட்டுமே. மிக முக்கியம்: இறுதி பதம் கெட்டியாக, சற்று கரகரப்பாக (கொர-கொரப்ப), தூள் போல — அதிகபட்சம் 80-90% மட்டுமே அரைய வேண்டும், ஒருபோதும் மிருதுவான நீர்த்த விழுதாக அல்ல. அனைத்தும் கலந்தவுடன் பல்ஸ் செய்வதை நிறுத்தவும்.",
              },
            },
          ],
        },
        {
          type: "serving",
          title: { en: "Serving it Right (No Tempering!)", ta: "சரியாக பரிமாறுதல் (தாளிப்பு இல்லை!)" },
          steps: [
            {
              step: 17,
              description: {
                en: "Transfer the thokku to a clean bowl. NO tempering needed — the gingelly oil during the roast already does that job, and adding more would dull the freshness.",
                ta: "தொக்கை ஒரு சுத்தமான பாத்திரத்துக்கு மாற்றவும். தாளிப்பு தேவையில்லை — வறுக்கும்போது சேர்த்த எள்ளெண்ணெய் அந்த வேலையை ஏற்கனவே செய்துவிட்டது, மேலும் சேர்த்தால் புதுமை மங்கிவிடும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "THE BEST way to eat it (Erode Aaya's specific instruction): take a plate of STEAMING HOT plain white rice. Make a small well in the center of the rice mound. Add a large spoonful of the coarse karuveppilai thokku into the well. Pour a drizzle of RAW (unheated) cold-pressed gingelly oil over the thokku. Mix it all together with your fingers — the heat from the rice releases the curry-leaf aroma, and the raw gingelly oil ties everything together.",
                ta: "சாப்பிட சிறந்த முறை (ஈரோடு ஆயாவின் குறிப்பிட்ட அறிவுரை): சூடான, வேக வைத்த சாதாரண வெள்ளை சாதத்தை எடுக்கவும். சாத குவியலின் மையத்தில் சிறு பள்ளம் செய்யவும். அந்த பள்ளத்தில் ஒரு பெரிய ஸ்பூன் கரகரப்பான கருவேப்பிலை தொக்கை சேர்க்கவும். தொக்கின் மேல் பச்சை (சூடாக்காத) மரச்செக்கு எள்ளெண்ணெய் ஊற்றவும். விரல்களால் அனைத்தையும் கலந்து சாப்பிடவும் — சாதத்தின் வெப்பம் கருவேப்பிலையின் வாசனையை வெளிக்கொண்டு வரும், பச்சை எள்ளெண்ணெய் எல்லாவற்றையும் இணைக்கும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Also pairs phenomenally as a thick spread inside crispy dosas (no chutney needed alongside!), with soft mallipoo idlies, or smeared on hot ghee chapathis. Stored in an airtight container with a clean dry spoon, it keeps 3-5 days at room temperature or 2-3 weeks refrigerated.",
                ta: "மற்ற சேர்க்கைகள்: மொறுமொறுப்பான தோசையின் உள்ளே கெட்டியான தொக்காக (வேறு சட்னி தேவையில்லை!), மென்மையான மல்லிப்பூ இட்லியுடன், அல்லது சூடான நெய் சப்பாத்தியில் தடவி. சுத்தமான வரண்ட ஸ்பூன் கொண்டு காற்று புகாத டப்பாவில் சேமித்தால், அறை வெப்பநிலையில் 3-5 நாட்கள், குளிர்சாதனத்தில் 2-3 வாரங்கள் கெடாமல் இருக்கும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Karuveppilai Thokku recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
