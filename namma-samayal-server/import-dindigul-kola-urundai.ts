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
  { slug: "mutton-mince", name: "Mutton Mince (Keema) — ideally with ~10% fat", ta: "ஆட்டிறைச்சி கீமா — சுமார் 10% கொழுப்பு கலந்தது", quantity: "500", unit: "g", categorySlug: "red-meat" },
  { slug: "fried-gram", name: "Roasted Gram (Pottu Kadalai) — natural binder", ta: "பொட்டுக்கடலை — இயற்கையான பிணைப்பான்", quantity: "1/2", unit: "cup" },
  { slug: "poppy-seeds", name: "Poppy Seeds (Kasagasa) — soaked", ta: "கசகசா — ஊறவைத்தது", quantity: "1", unit: "tbsp" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, finely chopped)", ta: "சின்ன வெங்காயம் (நன்கு நறுக்கியது)", quantity: "100", unit: "g" },
  { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste", ta: "இஞ்சி பூண்டு விழுது", quantity: "1", unit: "tbsp" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "5-6", unit: "nos" },
  { slug: "fennel-seeds", name: "Fennel Seeds (Sombu)", ta: "சோம்பு", quantity: "1", unit: "tsp" },
  { slug: "grated-coconut", name: "Grated Coconut", ta: "துருவிய தேங்காய்", quantity: "1/4", unit: "cup" },
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina)", ta: "புதினா", quantity: "1", unit: "handful (combined)" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli)", ta: "கொத்தமல்லி", quantity: "1", unit: "handful (combined)" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { slug: "groundnut-oil", name: "Groundnut Oil (for deep frying)", ta: "கடலை எண்ணெய் (பொரிக்க)", quantity: "for deep frying", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "dindigul-kola-urundai";
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
        en: "Dindigul Kola Urundai (Spiced Mutton Meatballs)",
        ta: "திண்டுக்கல் கொள உருண்டை",
      },
      title: "Dindigul Kola Urundai (Mutton Meatballs)",
      slug,
      description: {
        en: "The legendary Dindigul Kola Urundai — golden, crispy-outside, juicy-inside spiced mutton meatballs that have anchored Kongu and Dindigul cuisine for generations. Built on three commercial-craft rules: (1) a dry-roasted masala base of pottu kadalai (roasted gram), poppy seeds (kasagasa), fennel, dry red chillies and grated coconut ground to a fine powder — this powder is what binds the meatballs naturally without egg or flour, (2) the mutton mince is briefly re-pulsed in the mixer to make it smoother and more malleable so the urundai shape doesn't crack during frying, and (3) the deep-fry stays on MEDIUM heat throughout — too hot and the outside burns dark while the center stays raw; too low and the urundai soak oil and turn greasy. Serve as a crispy starter, drop into a spicy mutton kuzhambu, or pair with biryani.",
        ta: "புகழ்பெற்ற திண்டுக்கல் கொள உருண்டை — வெளியே மொறுமொறுப்பான, உள்ளே சதைப்பற்றான பொன்னிற காரமான ஆட்டிறைச்சி உருண்டைகள், தலைமுறை தலைமுறையாக கொங்கு மற்றும் திண்டுக்கல் சமையலின் தூணாக நிற்கின்றன. மூன்று வணிக-கைவினை விதிகளில் கட்டப்பட்டது: (1) பொட்டுக்கடலை, கசகசா, சோம்பு, காய்ந்த மிளகாய், துருவிய தேங்காய் வரண்டே வறுத்து மிருதுவான தூளாக அரைக்கப்படுகின்றன — இந்த தூள்தான் முட்டை அல்லது மாவு இல்லாமல் உருண்டைகளை இயற்கையாக பிணைக்கிறது, (2) ஆட்டிறைச்சி கீமாவை சிறிது நேரம் மிக்ஸியில் மீண்டும் பல்ஸ் செய்வது — இது மிருதுவாக, வளையக்கூடியதாக ஆக்கி, பொரிக்கும் போது உருண்டை வடிவம் வெடிக்காமல் இருக்கும், மற்றும் (3) மிதமான தீயில் பொரிப்பது — மிக சூடாக இருந்தால் வெளியே கருகி உள்ளே பச்சையாக இருக்கும்; குறைவாக இருந்தால் உருண்டை எண்ணெயை உள்ளீர்த்து கொழகொழப்பாகும். மொறுமொறுப்பான ஸ்டார்ட்டராக, காரமான ஆட்டிறைச்சி குழம்பில் சேர்த்து, அல்லது பிரியாணியுடன் பரிமாறவும்.",
      },
      speciality: {
        en: "Three Dindigul-craft rules define an authentic kola urundai: (1) The Spice-Binder Powder — instead of egg or maida (which most home cooks default to), Dindigul uses a dry-roasted powder of pottu kadalai (roasted gram) + kasagasa (poppy seeds) + fennel + dry red chillies + grated coconut. The pottu kadalai is the secret natural binder; it absorbs the mince juices and tightens the urundai without making them dense. The kasagasa adds the floral nuttiness that's the Dindigul aromatic signature. (2) The Mince Re-Pulse — Dindigul chefs put the already-minced meat back into the mixer for a few seconds. This breaks down any visible muscle strands and makes the keema silkier — the urundai then take a smoother, crack-free shape. Skip this and your urundai split open in the hot oil. (3) The Medium-Heat Fry — commercial Dindigul shops never fry kola urundai on high heat. Medium heat for the entire fry (turning often) gives a deep-dark-golden crust outside AND a fully cooked, still-juicy center. High heat = burnt-outside-raw-inside; low heat = oily greasy ball.",
        ta: "அசலான கொள உருண்டையின் மூன்று திண்டுக்கல்-கைவினை விதிகள்: (1) மசாலா-பிணைப்பு தூள் — பெரும்பாலான வீட்டு சமையற்காரர்கள் முட்டை அல்லது மைதா பயன்படுத்தும் போது, திண்டுக்கல் பொட்டுக்கடலை + கசகசா + சோம்பு + காய்ந்த மிளகாய் + துருவிய தேங்காய் வரண்டே வறுத்த தூளை பயன்படுத்துகிறது. பொட்டுக்கடலை ரகசிய இயற்கை பிணைப்பான்; கீமா சாற்றை உள்ளீர்த்து, உருண்டையை அடர்த்தியாக ஆக்காமல் இறுக்கமாக ஆக்குகிறது. கசகசா திண்டுக்கல் வாசனை தனிச்சிறப்பான மலர் கொட்டை வாசனையை சேர்க்கிறது. (2) கீமாவை மீண்டும் பல்ஸ் செய்தல் — திண்டுக்கல் சமையற்காரர்கள் ஏற்கனவே நறுக்கப்பட்ட இறைச்சியை சில விநாடிகளுக்கு மிக்ஸியில் மீண்டும் சேர்க்கின்றனர். இது தெரியும் தசை இழைகளை உடைத்து, கீமாவை மென்மையாக்குகிறது — உருண்டைகள் மிருதுவான, வெடிக்காத வடிவத்தை எடுக்கும். இதை தவிர்த்தால், உருண்டைகள் சூடான எண்ணெயில் பிளந்துவிடும். (3) மிதமான-தீ பொரிப்பு — வணிக திண்டுக்கல் கடைகள் கொள உருண்டையை அதிக தீயில் ஒருபோதும் பொரிப்பதில்லை. முழு பொரிப்புக்கும் மிதமான தீ (அடிக்கடி புரட்டி) — வெளியே ஆழமான-இருண்ட பொன்னிற கூடு மற்றும் முற்றிலும் வெந்த, இன்னும் சதைப்பற்றான மையம். அதிக தீ = வெளியே கருகி உள்ளே பச்சை; குறைந்த தீ = எண்ணெய் கொழகொழப்பு உருண்டை.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        city: "Dindigul",
      },
      prepTime: 30,
      cookingTime: 25,
      totalTime: 55,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=uL6fW28ivd8",
      },
      tags: [
        "non-veg",
        "mutton",
        "kola-urundai",
        "meatballs",
        "mutton-meatballs",
        "starter",
        "appetizer",
        "fritter",
        "deep-fried",
        "kongu",
        "dindigul",
        "tamil-nadu",
        "traditional",
        "iconic",
        "pottu-kadalai-binder",
        "kasagasa",
        "no-egg",
        "no-flour",
        "natural-binder",
        "biryani-side",
        "kuzhambu-ready",
      ],
      searchKeywords: [
        "kola urundai",
        "dindigul kola urundai",
        "mutton meatballs",
        "tamil mutton meatballs",
        "கொள உருண்டை",
        "திண்டுக்கல் கொள உருண்டை",
        "spiced mutton meatballs",
        "kongu mutton starter",
        "deep fried mutton balls",
        "pottu kadalai meatballs",
        "mutton koftay",
        "chef deena kola urundai",
        "no egg meatballs",
        "biryani side mutton balls",
        "kuzhambu meatballs",
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
                en: "Buy mutton mince (keema) that has approximately 10% fat — pure lean mince will make the urundai dry and crumbly; about 10% fat keeps them juicy without making them greasy. If buying lean, ask the butcher to mince in a small piece of fat with the meat.",
                ta: "சுமார் 10% கொழுப்பு கலந்த ஆட்டிறைச்சி கீமாவை வாங்கவும் — தூய மெலிந்த கீமா உருண்டையை காய்ந்து, உடையக்கூடியதாக ஆக்கும்; சுமார் 10% கொழுப்பு கொழகொழப்பாக ஆக்காமல் சதைப்பற்றாக வைக்கும். மெலிந்த இறைச்சியை வாங்கினால், சிறிது கொழுப்புடன் சேர்த்து நறுக்கி தர சொல்லவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Soak the 1 tablespoon of poppy seeds (kasagasa) in 3-4 tablespoons of warm water for 20 minutes. This softens them so they grind into a smoother paste later.",
                ta: "1 ஸ்பூன் கசகசாவை 3-4 ஸ்பூன் சூடான தண்ணீரில் 20 நிமிடம் ஊறவைக்கவும். இது அவற்றை மிருதுவாக்கி, பின்னர் மிருதுவான விழுதாக அரைக்க உதவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Finely chop the 100g of small onions, the handful each of mint and coriander leaves. The chop should be very fine — large pieces will make the urundai uneven and prone to cracking.",
                ta: "100 கிராம் சின்ன வெங்காயம், ஒரு கைப்பிடி புதினா மற்றும் கொத்தமல்லியை மிக நன்கு நறுக்கவும். நறுக்கு மிக நுணுக்கமாக இருக்க வேண்டும் — பெரிய துண்டுகள் உருண்டைகளை சீரற்றதாக்கி, வெடிக்க வைக்கும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Preparing the Spice-Binder Powder", ta: "மசாலா-பிணைப்பு தூள் தயாரிப்பு" },
          steps: [
            {
              step: 4,
              description: {
                en: "Heat a dry pan on a LOW flame. Add the ½ cup of pottu kadalai (roasted gram) and dry-roast for 30-60 seconds — they're already roasted, this is just to wake them up. Set aside.",
                ta: "வரண்ட கடாயை குறைந்த தீயில் சூடாக்கவும். ½ கப் பொட்டுக்கடலையை சேர்த்து 30-60 விநாடிகள் வரண்டே வறுக்கவும் — அவை ஏற்கனவே வறுக்கப்பட்டவை, இது அவற்றை எழுப்புவது மட்டுமே. தனியாக வைக்கவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "In the same dry pan, dry-roast the 1 teaspoon of fennel seeds (sombu) and the 5-6 dry red chillies on a low flame until fragrant — about 30-45 seconds. Don't burn the chillies; they should puff slightly. Cool together with the pottu kadalai.",
                ta: "அதே வரண்ட கடாயில், 1 ஸ்பூன் சோம்பு மற்றும் 5-6 காய்ந்த மிளகாயை குறைந்த தீயில் வாசனை வரும் வரை — சுமார் 30-45 விநாடிகள் — வறுக்கவும். மிளகாயை கருக விட வேண்டாம்; லேசாக பருக்க வேண்டும். பொட்டுக்கடலையுடன் சேர்த்து ஆற விடவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "In a DRY mixer jar, grind together: the roasted pottu kadalai, the roasted fennel + red chillies, the soaked poppy seeds (drained), and the ¼ cup of grated coconut. Grind into a FINE powder/coarse paste. This is your spice-binder — the pottu kadalai will absorb the mince juices and naturally tighten the urundai without egg or maida.",
                ta: "ஒரு வரண்ட மிக்ஸியில், சேர்த்து அரைக்கவும்: வறுத்த பொட்டுக்கடலை, வறுத்த சோம்பு + காய்ந்த மிளகாய், ஊறவைத்த கசகசா (வடித்தது), மற்றும் ¼ கப் துருவிய தேங்காய். மிருதுவான தூளாக/கரகரப்பான விழுதாக அரைக்கவும். இதுவே மசாலா-பிணைப்பான் — பொட்டுக்கடலை கீமா சாற்றை உள்ளீர்த்து, முட்டை அல்லது மைதா இல்லாமலேயே உருண்டையை இயற்கையாக இறுக்கமாக்கும்.",
              },
            },
          ],
        },
        {
          type: "preparation",
          title: { en: "Re-Pulsing the Mince + Mixing", ta: "கீமாவை மீண்டும் பல்ஸ் + கலத்தல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "RE-PULSE STEP: drop the 500g of mutton mince into a clean mixer jar and pulse for ONLY 5-10 SECONDS — short pulses, NOT continuous grinding. The goal is to break visible muscle strands so the keema becomes silkier and more malleable. Over-grinding turns it into paste and the urundai go dense.",
                ta: "மீண்டும்-பல்ஸ் படி: 500 கிராம் ஆட்டிறைச்சி கீமாவை சுத்தமான மிக்ஸியில் சேர்த்து, வெறும் 5-10 விநாடிகள் மட்டுமே பல்ஸ் செய்யவும் — குறுகிய பர்ஸ்ட்கள், தொடர்ந்து அரைப்பது அல்ல. நோக்கம்: தெரியும் தசை இழைகளை உடைத்து, கீமாவை மென்மையாக, வளையக்கூடியதாக ஆக்குவது. அதிகம் அரைத்தால் விழுதாகி, உருண்டைகள் அடர்த்தியாகும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "In a LARGE mixing bowl, combine: the re-pulsed mutton mince, the spice-binder powder from step 6, the 1 tablespoon of ginger-garlic paste, the finely chopped small onions, finely chopped mint + coriander leaves, ½ teaspoon turmeric powder, and crystal salt to taste.",
                ta: "ஒரு பெரிய பாத்திரத்தில் சேர்க்கவும்: மீண்டும்-பல்ஸ் செய்த ஆட்டிறைச்சி கீமா, படி 6-இல் தயாரித்த மசாலா-பிணைப்பு தூள், 1 ஸ்பூன் இஞ்சி-பூண்டு விழுது, நன்கு நறுக்கிய சின்ன வெங்காயம், நன்கு நறுக்கிய புதினா + கொத்தமல்லி, ½ ஸ்பூன் மஞ்சள் தூள், மற்றும் தேவையான கல் உப்பு.",
              },
            },
            {
              step: 9,
              description: {
                en: "Knead the mixture thoroughly with your hands for 3-5 minutes — really work it. The kneading does two things: distributes the spice-binder powder evenly through the meat, AND warms the mince slightly so the fat softens and binds. The mixture should look uniform, slightly tacky, and hold its shape when you press it. If it feels too wet, add 1-2 more tablespoons of pottu kadalai powder.",
                ta: "கையால் 3-5 நிமிடம் நன்கு பிசையவும் — உண்மையாகவே வேலை செய்யவும். பிசைதல் இரண்டு வேலைகள் செய்கிறது: மசாலா-பிணைப்பு தூளை இறைச்சி முழுவதும் சீராக பரப்புகிறது, மேலும் கையின் வெப்பத்தால் கீமாவை லேசாக சூடாக்கி, கொழுப்பு மென்மையாக்கி பிணைகிறது. கலவை சீராக, சற்று ஒட்டுவதாக, அழுத்தினால் வடிவத்தை தாங்குவதாக இருக்க வேண்டும். மிக ஈரமாக இருந்தால், 1-2 ஸ்பூன் பொட்டுக்கடலை தூள் மேலும் சேர்க்கவும்.",
              },
            },
          ],
        },
        {
          type: "preparation",
          title: { en: "Shaping the Urundai", ta: "உருண்டை வடிவம்" },
          steps: [
            {
              step: 10,
              description: {
                en: "Lightly grease both palms with a few drops of oil — this stops the meat from sticking and gives the urundai a clean smooth surface.",
                ta: "இரு கைகளிலும் சில துளி எண்ணெய் தடவவும் — இது இறைச்சி கையில் ஒட்டாமல் தடுக்கும் மற்றும் உருண்டைக்கு சுத்தமான மிருதுவான மேற்பரப்பை தரும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Pinch off a small portion of the mixture (about a lemon-size — roughly 30-40g per ball). Roll between your palms with FIRM pressure into a smooth, crack-free ball. Critical: if you see any surface cracks, the ball WILL split open in the hot oil. Smooth out every crack with extra pressure before moving on.",
                ta: "கலவையில் ஒரு சிறிய பகுதியை எடுக்கவும் (சுமார் எலுமிச்சை அளவு — ஒரு உருண்டைக்கு சுமார் 30-40 கிராம்). இறுக்கமான அழுத்தத்துடன் கைகளுக்கு இடையில் உருட்டி, மிருதுவான, வெடிப்பு இல்லாத உருண்டையாக ஆக்கவும். மிக முக்கியம்: மேற்பரப்பில் ஏதேனும் வெடிப்பு தெரிந்தால், சூடான எண்ணெயில் உருண்டை பிளந்துவிடும். தொடர்வதற்கு முன், ஒவ்வொரு வெடிப்பையும் கூடுதல் அழுத்தத்தால் மிருதுவாக்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Place the shaped urundai on a clean plate. Repeat with the rest of the mixture — you should get about 15-20 lemon-sized balls from 500g of mince. Cover the plate with a damp cloth so they don't dry out.",
                ta: "வடிவமைத்த உருண்டையை சுத்தமான தட்டில் வைக்கவும். மீதமுள்ள கலவையுடன் மீண்டும் செய்யவும் — 500 கிராம் கீமாவிலிருந்து சுமார் 15-20 எலுமிச்சை அளவு உருண்டைகள் கிடைக்க வேண்டும். அவை வரண்டுவிடாமல் இருக்க, தட்டை ஈரமான துணியால் மூடவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Deep-Frying on Medium Heat", ta: "மிதமான தீயில் பொரித்தல்" },
          steps: [
            {
              step: 13,
              description: {
                en: "Pour enough oil into a kadai or deep heavy-bottomed pan to submerge the urundai (about 2.5-3 inches deep). Heat on medium-high until the oil reaches around 160-170°C (320-340°F). Test: drop a tiny pinch of the meat mixture into the oil — it should sizzle steadily and rise to the surface within 5 seconds, but the oil should NOT smoke.",
                ta: "ஒரு கடாய் அல்லது ஆழமான தடிமனான பாத்திரத்தில் உருண்டைகள் மூழ்கும் அளவு எண்ணெய் ஊற்றவும் (சுமார் 2.5-3 அங்குலம் ஆழம்). எண்ணெய் சுமார் 160-170°C அடையும் வரை மிதமான-உயர் தீயில் சூடாக்கவும். சோதனை: இறைச்சி கலவையின் ஒரு சிறு துகளை எண்ணெயில் போடவும் — அது சீராக சீறி 5 விநாடிகளுக்குள் மேற்பரப்புக்கு வர வேண்டும், ஆனால் எண்ணெய் புகை எழ கூடாது.",
              },
            },
            {
              step: 14,
              description: {
                en: "Lower the flame to MEDIUM — this is the critical Dindigul rule. Gently slide 5-6 urundai into the hot oil at a time. Don't overcrowd the kadai (the oil temperature drops too much).",
                ta: "தீயை மிதமாக குறைக்கவும் — இது மிக முக்கியமான திண்டுக்கல் விதி. ஒரு முறையில் 5-6 உருண்டைகளை சூடான எண்ணெயில் மெதுவாக சேர்க்கவும். கடாயை அதிக கூட்டமாக்க வேண்டாம் (எண்ணெய் வெப்பநிலை அதிகம் குறையும்).",
              },
            },
            {
              step: 15,
              description: {
                en: "Fry on MEDIUM heat, turning the urundai gently every 1-2 minutes with a slotted spoon. Don't poke them with a fork — that creates holes through which the juices leak out. Total fry time: 6-9 minutes per batch.",
                ta: "மிதமான தீயில் பொரிக்கவும். துளையிட்ட ஸ்பூனால் ஒவ்வொரு 1-2 நிமிடத்துக்கும் உருண்டையை மெதுவாக புரட்டவும். முட்கரண்டியால் குத்த வேண்டாம் — அது துளைகள் உருவாக்கி, சாறு கசிய வைக்கும். மொத்த பொரிக்கும் நேரம்: ஒரு தொகுதிக்கு 6-9 நிமிடம்.",
              },
            },
            {
              step: 16,
              description: {
                en: "The urundai are DONE when: (a) the outside turns a DEEP DARK golden brown (not pale, not burnt black), (b) they feel firm to the touch with the slotted spoon, and (c) any juices that escape on the surface look CLEAR, not pink. Cut one open to confirm — the center should be cooked through but still moist.",
                ta: "உருண்டைகள் தயார் என்பது: (அ) வெளியே ஆழமான இருண்ட பொன்னிற பழுப்பு (வெளிறியதோ கருகிய கறுப்போ அல்ல), (ஆ) துளையிட்ட ஸ்பூனால் தொடுவதற்கு இறுக்கமாக இருப்பது, (இ) மேற்பரப்பில் வரும் சாறு தெளிவாக இருப்பது (இளஞ்சிவப்பு அல்ல). உறுதிப்படுத்த ஒன்றை வெட்டிப் பாருங்கள் — மையம் முற்றிலும் வெந்து இருக்க வேண்டும் ஆனாலும் ஈரமாக இருக்க வேண்டும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Transfer fried urundai onto kitchen paper or a wire rack to drain excess oil. Don't pile them — single layer so the steam doesn't make them soggy.",
                ta: "பொரித்த உருண்டைகளை சமையலறை காகிதம் அல்லது கம்பி தட்டில் வைத்து, கூடுதலான எண்ணெயை வடியவிடவும். அடுக்கி வைக்க வேண்டாம் — ஒரே அடுக்கில் வைக்கவும் — இல்லையென்றால் ஆவியால் உருண்டைகள் கொழகொழப்பாகும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Repeat in batches with the remaining urundai. Between batches, scoop out any floating debris from the oil with a strainer — burnt bits will stick to and darken later batches.",
                ta: "மீதமுள்ள உருண்டைகளுடன் தொகுதி தொகுதியாக மீண்டும் செய்யவும். தொகுதிகளுக்கு இடையில், எண்ணெயில் மிதக்கும் ஏதேனும் கசட்டை சல்லடையால் எடுத்து விடவும் — கருகிய துகள்கள் ஒட்டிக்கொண்டு, பின் தொகுதிகளை இருட்டாக்கும்.",
              },
            },
          ],
        },
        {
          type: "serving",
          title: { en: "Serving", ta: "பரிமாறுதல்" },
          steps: [
            {
              step: 19,
              description: {
                en: "Serve Kola Urundai THREE traditional ways: (a) AS A STARTER — hot off the oil with a wedge of lemon, sliced raw onion and mint chutney; (b) DROPPED INTO A KUZHAMBU — gently slip the fried urundai into a hot mutton or shallot kuzhambu for 5 minutes so they absorb the gravy without disintegrating; (c) AS A BIRYANI SIDE — serve 2-3 urundai per plate alongside Dindigul Mutton or Veg Dum Biryani for an iconic Kongu wedding-feast plate.",
                ta: "கொள உருண்டையை மூன்று பாரம்பரிய வழிகளில் பரிமாறவும்: (அ) ஸ்டார்ட்டராக — எண்ணெய்யிலிருந்து சூடாக, ஒரு துண்டு எலுமிச்சை, பச்சை வெங்காய துண்டுகள் மற்றும் புதினா சட்னியுடன்; (ஆ) குழம்பில் சேர்த்து — பொரித்த உருண்டைகளை சூடான ஆட்டிறைச்சி அல்லது சின்ன வெங்காய குழம்பில் 5 நிமிடம் மெதுவாக சேர்த்து, உடையாமல் குழம்பை உள்ளீர்க்க விடவும்; (இ) பிரியாணி சைடாக — திண்டுக்கல் ஆட்டிறைச்சி அல்லது சைவ தம் பிரியாணியுடன் ஒரு தட்டுக்கு 2-3 உருண்டைகள் பரிமாறவும், புகழ்பெற்ற கொங்கு கல்யாண-விருந்து தட்டுக்கு.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Dindigul Kola Urundai recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
