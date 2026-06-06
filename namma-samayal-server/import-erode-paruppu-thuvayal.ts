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
  { slug: "toor-dal", name: "Broken Toor Dal (Kurunai)", ta: "துவரம் பருப்பு குருணை", quantity: "1", unit: "cup" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "100-150", unit: "g" },
  { slug: "garlic", name: "Garlic", ta: "பூண்டு", quantity: "6-8", unit: "cloves" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "6-8", unit: "nos" },
  { slug: "cumin-seeds", name: "Cumin Seeds", ta: "சீரகம்", quantity: "1", unit: "tsp" },
  { slug: "tamarind", name: "Tamarind (gooseberry-sized)", ta: "புளி (நெல்லிக்காய் அளவு)", quantity: "1", unit: "small piece" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "2", unit: "tbsp" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-aaya-paruppu-thuvayal";
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
        en: "Erode Aaya's Paruppu Thuvayal (Broken Toor Dal Chutney)",
        ta: "ஈரோடு ஆயா பருப்பு துவையல்",
      },
      slug,
      description: {
        en: "A nearly-forgotten Kongu village classic — a thick, rustic toor dal chutney built from kurunai (the tiny broken bits of toor dal that traditional farmers couldn't sell as premium whole dal). Decades ago, village grandmothers refused to waste the kurunai and instead boiled it soft, then ground it together with sautéed shallots, garlic, cumin, dry red chillies, curry leaves and a tiny gooseberry-sized piece of tamarind into a thick thuvayal. Eaten by mixing into hot white rice with either ghee (for kids) or raw cold-pressed groundnut oil (for elders). Highly nutritious, deeply comforting, and a piece of Kongu food history that modern generations have almost completely forgotten.",
        ta: "கிட்டத்தட்ட மறக்கப்பட்டுவிட்ட பாரம்பரிய கொங்கு கிராமத்து உணவு — பழைய நாளில் விவசாயிகள் முழு துவரம் பருப்பை சுத்தம் செய்யும் போது உடைந்து விழும் சிறு துகள்கள் ('குருணை') கொண்டு செய்யப்படும் கெட்டியான பருப்பு துவையல். அந்த குருணையை வீணாக்காமல், கிராமத்து பாட்டிகள் மிருதுவாக வேக வைத்து, வதங்கிய சின்ன வெங்காயம், பூண்டு, சீரகம், காய்ந்த மிளகாய், கருவேப்பிலை மற்றும் ஒரு நெல்லிக்காய் அளவு புளியுடன் சேர்த்து கெட்டியான துவையலாக அரைத்தனர். சூடான வெள்ளை சாதத்தில் கலந்து, குழந்தைகளுக்கு நெய் சேர்த்தும், பெரியவர்களுக்கு மரச்செக்கு கடலை எண்ணெயுடன் சேர்த்தும் சாப்பிடப்படுகிறது. ஊட்டச்சத்து நிறைந்த, ஆறுதலான, நவீன தலைமுறை மறந்துவிட்ட கொங்கு உணவு வரலாற்றின் ஒரு பகுதி.",
      },
      speciality: {
        en: "Four traditional points define this thuvayal: (1) The Kurunai magic — built specifically from BROKEN toor dal bits, not premium whole dal; village mothers refused to waste these tiny pieces and turned them into something legendary. (2) The Forgotten Classic — almost no one under 40 still makes this; it was a Kongu staple decades ago. (3) The Stone-Grinder Childhood Memory — after the thuvayal was ground in an ammikkal (stone mortar), mothers would toss a handful of hot rice into the grinder, swirl it to wipe up every last bit of chutney clinging to the stone, and feed that single bite to the kids — an unmatched flavor that no modern mixer can replicate. (4) The Ghee vs. Groundnut Oil Rule — strictly: kids eat it with hot ghee on white rice; elders eat it with RAW cold-pressed groundnut oil on white rice. No tempering needed — it's eaten as a rustic rice-mix paste, never as a sambar or gravy.",
        ta: "பாரம்பரிய பருப்பு துவையலின் நான்கு சிறப்புகள்: (1) குருணை மாயம் — முழு துவரம் பருப்பல்ல, பருப்பு உடைந்து வரும் சிறு துகள்களிலிருந்தே செய்யப்படுகிறது; கிராமத்து பாட்டிகள் இந்த துகள்களை வீணாக்க மறுத்து, சிறப்பான உணவாக மாற்றினர். (2) மறக்கப்பட்ட கிளாசிக் — 40 வயதுக்குக் கீழ் உள்ளவர்கள் கிட்டத்தட்ட யாரும் இதை இன்னும் செய்வதில்லை; பல தசாப்தங்களுக்கு முன் கொங்கு வீடுகளில் தினமும் இருந்தது. (3) அம்மிக்கல் குழந்தைப்பருவ நினைவு — அம்மிக்கல்லில் துவையல் அரைத்த பின், அதே கல்லில் ஒரு கைப்பிடி சூடான சாதத்தை போட்டு, கல்லில் ஒட்டிய துவையலை சாதத்தில் கலந்து குழந்தைகளுக்கு கொடுப்பார்கள் — மிக்ஸி எப்போதும் அந்த சுவையை தர முடியாது. (4) நெய் vs கடலை எண்ணெய் விதி — கண்டிப்பாக: குழந்தைகளுக்கு சூடான நெய் சேர்த்து வெள்ளை சாதத்தில்; பெரியவர்களுக்கு மரச்செக்கு பச்சை கடலை எண்ணெய் சேர்த்து வெள்ளை சாதத்தில். தாளிப்பு தேவையில்லை — இது சாம்பார் அல்லது குழம்பு அல்ல, சாதத்தில் பிசையும் கெட்டியான துவையல்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 10,
      cookingTime: 25,
      totalTime: 35,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "veg",
        "vegan",
        "thuvayal",
        "thogayal",
        "chutney",
        "paruppu-thuvayal",
        "toor-dal",
        "kurunai",
        "rice-mix",
        "side-dish",
        "erode",
        "kongu",
        "tamil-nadu",
        "traditional",
        "forgotten-classic",
        "rustic",
        "no-tempering",
        "nutritious",
      ],
      searchKeywords: [
        "paruppu thuvayal",
        "paruppu thogayal",
        "broken toor dal chutney",
        "kurunai thuvayal",
        "பருப்பு துவையல்",
        "துவரம் பருப்பு குருணை",
        "erode aaya thuvayal",
        "kongu paruppu thuvayal",
        "chef deena paruppu thuvayal",
        "ammikkal thuvayal",
        "forgotten kongu recipe",
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
          title: { en: "Cooking the Dal (Kurunai)", ta: "குருணை வேக வைத்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Wash the 1 cup of broken toor dal (kurunai) thoroughly under running water 2-3 times to remove dust and husk fragments. (If you don't have kurunai, take regular whole toor dal and dry-roast it briefly or crush it lightly before washing.)",
                ta: "1 கப் உடைந்த துவரம் பருப்பை (குருணை) ஓடும் தண்ணீரில் 2-3 முறை நன்கு கழுவவும் — தூசு மற்றும் உமி துகள்கள் நீங்க வேண்டும். (குருணை இல்லையென்றால், சாதாரண முழு துவரம் பருப்பை சிறிது வறுத்து அல்லது லேசாக நசுக்கிய பின் கழுவவும்.)",
              },
            },
            {
              step: 2,
              description: {
                en: "Place the washed dal in a heavy-bottomed vessel or pressure cooker. Add just enough water to submerge it — not too much, you want a thick consistency. Boil until the dal is completely soft and tender but NOT entirely dissolved into a soup. Broken dal cooks much faster than whole dal — usually 8-12 minutes in an open pot or 2-3 whistles in a cooker. Set aside.",
                ta: "கழுவிய பருப்பை தடிமனான பாத்திரம் அல்லது குக்கரில் சேர்க்கவும். மூழ்கும் அளவு மட்டுமே தண்ணீர் ஊற்றவும் — அதிகம் வேண்டாம், கெட்டியான பதம் வேண்டும். பருப்பு மிருதுவாக வேக வேண்டும், ஆனால் சூப் போல முழுமையாக கரைய கூடாது. முழு பருப்பை விட உடைந்த பருப்பு வேகமாக வேகும் — திறந்த பானையில் 8-12 நிமிடம் அல்லது குக்கரில் 2-3 விசில். தனியாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Aromatics", ta: "வாசனை வதக்கல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat a heavy pan or small clay pot over medium heat and pour in the 2 tablespoons of groundnut oil.",
                ta: "ஒரு தடிமனான கடாய் அல்லது சிறிய மண்சட்டியை மிதமான தீயில் சூடாக்கி, 2 ஸ்பூன் கடலை எண்ணெய் ஊற்றவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Once the oil is hot, add the 1 tsp of cumin seeds and let them splutter and release their aroma.",
                ta: "எண்ணெய் சூடாகும் போது, 1 ஸ்பூன் சீரகம் சேர்த்து வெடிக்க விடவும், வாசனை வெளிப்படும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Add the 6-8 dry red chillies and roast them briefly in the hot oil — 20-30 seconds, until they puff up and turn slightly darker. Don't burn them.",
                ta: "6-8 காய்ந்த மிளகாய் சேர்த்து சூடான எண்ணெயில் 20-30 விநாடிகள் மட்டும் வறுக்கவும் — பருத்து சற்று கருப்பாக ஆகும். கருக விட வேண்டாம்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Toss in the peeled small onions, the 6-8 garlic cloves, and the generous handful of curry leaves. Sauté everything patiently on medium heat until the small onions turn soft, translucent, and develop a slight golden color — about 5-7 minutes.",
                ta: "தோல் சீவிய சின்ன வெங்காயம், 6-8 பூண்டு பற்கள் மற்றும் ஒரு கைப்பிடி கருவேப்பிலையை சேர்க்கவும். மிதமான தீயில், சின்ன வெங்காயம் மிருதுவாகி, பளபளப்பாகி, லேசான பொன்னிறம் வரும் வரை — சுமார் 5-7 நிமிடம் — பொறுமையாக வதக்கவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Drop the small gooseberry-sized piece of tamarind directly into the pan and turn off the heat immediately. The residual heat will soften the tamarind without browning it.",
                ta: "ஒரு நெல்லிக்காய் அளவு புளியை நேரடியாக கடாயில் சேர்த்து, உடனே அடுப்பை அணைக்கவும். மீதமுள்ள வெப்பத்தில் புளி பழுப்பாகாமல், மிருதுவாகும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Traditional Grind", ta: "பாரம்பரிய அரைத்தல்" },
          steps: [
            {
              step: 8,
              description: {
                en: "Let the sautéed onion-chilli-tamarind mixture cool down completely to room temperature. Grinding hot ingredients turns the thuvayal into an oily mess rather than a clean coarse paste.",
                ta: "வதங்கிய வெங்காயம்-மிளகாய்-புளி கலவையை அறை வெப்பநிலை வரும் வரை முழுமையாக ஆற விடவும். சூடாக இருக்கும் போது அரைத்தால் துவையல் கெட்டியான கரகரப்பான பதத்துக்கு பதிலாக எண்ணெய் கலந்த விழுதாக மாறிவிடும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "In a mixer jar (or a traditional ammikkal stone mortar if you have one), first add the cooled sautéed onion-chilli mixture along with crystal salt to taste. Pulse for a coarse grind — don't make it smooth.",
                ta: "ஒரு மிக்ஸியில் (அல்லது பாரம்பரிய அம்மிக்கல் இருந்தால் அதிலேயே), முதலில் ஆறிய வதங்கிய வெங்காயம்-மிளகாய் கலவையை தேவையான கல் உப்புடன் சேர்க்கவும். கரகரப்பாக மட்டுமே அரைக்கவும் — மிருதுவாக்க வேண்டாம்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Now add the boiled broken toor dal into the mixer. Grind everything together into a THICK, coarse paste — thuvayal consistency. Critical: do NOT add water (or add only a tiny splash if the mixer can't move). This is not a sambar or gravy — it must be thick enough to hold its shape when scooped with a spoon.",
                ta: "இப்போது வேக வைத்த உடைந்த துவரம் பருப்பை மிக்ஸியில் சேர்க்கவும். அனைத்தையும் சேர்த்து கெட்டியான, கரகரப்பான பதம் — துவையல் பதம் — வரும் வரை அரைக்கவும். மிக முக்கியம்: தண்ணீர் சேர்க்க வேண்டாம் (மிக்ஸி திரும்ப மறுத்தால் மட்டுமே ஒரு துளி). இது சாம்பாரோ குழம்போ அல்ல — ஸ்பூனால் எடுத்தால் அதன் வடிவம் கெடாமல் இருக்கும் அளவுக்கு கெட்டியாக இருக்க வேண்டும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Optional traditional touch: if you ground it in an ammikkal, before scraping the thuvayal out, throw a small handful of HOT white rice into the empty stone bowl and swirl it around to wipe up every last bit of thuvayal clinging to the stone — give that single bite to a child. Erode Aaya says that bite tastes unmatched, and chef Deena agrees.",
                ta: "பாரம்பரிய விருப்ப தொடுதல்: அம்மிக்கல்லில் அரைத்திருந்தால், துவையலை எடுப்பதற்கு முன், காலியான கல்லில் ஒரு கைப்பிடி சூடான வெள்ளை சாதத்தை போட்டு, கல்லில் ஒட்டியுள்ள ஒவ்வொரு துகள் துவையலையும் சாதத்துடன் கலந்து — அந்த ஒரு வாய் சாதத்தை குழந்தைக்கு கொடுங்கள். ஈரோடு ஆயா மற்றும் சமையற்காரர் டீனா இருவருமே சொல்கிறார்கள்: அந்த ஒரு வாய் சுவைக்கு ஈடு இல்லை.",
              },
            },
          ],
        },
        {
          type: "serving",
          title: { en: "Serving it Right (Ghee vs Groundnut Oil Rule)", ta: "சரியாக பரிமாறுதல் (நெய் vs கடலை எண்ணெய் விதி)" },
          steps: [
            {
              step: 12,
              description: {
                en: "Transfer the thick paruppu thuvayal to a bowl. No tempering needed — this is the rustic, original village version. Tempering is a modern addition this dish doesn't want.",
                ta: "கெட்டியான பருப்பு துவையலை ஒரு பாத்திரத்தில் சேர்க்கவும். தாளிப்பு தேவையில்லை — இது அசலான கிராமத்து பதிப்பு. தாளிப்பு இந்த உணவுக்கு வேண்டாத நவீன சேர்க்கை.",
              },
            },
            {
              step: 13,
              description: {
                en: "Serve alongside steaming hot plain white rice. Make a small well in a mound of hot rice, drop a generous dollop of the thuvayal into the well — and then apply the strict Kongu rule:",
                ta: "சூடான வெள்ளை சாதத்துடன் பரிமாறவும். ஒரு குவியல் சூடான சாதத்தில் சிறிய பள்ளம் செய்து, அதில் தாராளமாக துவையலை சேர்க்கவும் — பின் கொங்கு கட்டாய விதியை பின்பற்றவும்:",
              },
            },
            {
              step: 14,
              description: {
                en: "FOR KIDS — pour a generous spoonful of hot ghee (nei) over the thuvayal and mix well; the ghee gives it a rich, comforting, child-friendly flavor.",
                ta: "குழந்தைகளுக்கு — துவையலின் மேல் தாராளமான ஒரு ஸ்பூன் சூடான நெய் ஊற்றி நன்கு கலக்கவும்; நெய் இதற்கு செழுமையான, ஆறுதலான, குழந்தைகளுக்கு ஏற்ற சுவையை தரும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "FOR ELDERS — pour RAW, cold-pressed groundnut oil (kadalai ennai) over the thuvayal and mix. Do not heat the oil; raw cold-pressed oil takes the rustic flavor to another level entirely. This is the elder's bite — non-negotiable in Kongu households.",
                ta: "பெரியவர்களுக்கு — துவையலின் மேல் பச்சை, மரச்செக்கு கடலை எண்ணெய் ஊற்றி கலக்கவும். எண்ணெயை சூடாக்க வேண்டாம்; பச்சை மரச்செக்கு எண்ணெய் கிராமத்து சுவையை வேறு ஒரு உயரத்துக்கு கொண்டு செல்லும். இது கொங்கு வீடுகளில் பெரியவர்களின் கட்டாய விதி.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Paruppu Thuvayal recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
