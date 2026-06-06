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
  { slug: "dry-coconut-kopparai", name: "Dry Coconut (Kopparai Thengai / Copra, chopped small)", ta: "கொப்பரை தேங்காய் (சிறிய துண்டுகளாக)", quantity: "1", unit: "cup", categorySlug: "nuts-seeds" },
  { slug: "garlic", name: "Garlic (raw, peeled)", ta: "பூண்டு (பச்சை, தோல் சீவியது)", quantity: "10-15", unit: "cloves" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies", ta: "காய்ந்த மிளகாய்", quantity: "6-8", unit: "nos" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { slug: "gingelly-oil-sesame-oil", name: "Gingelly Oil (Nallennai, raw cold-pressed)", ta: "எள்ளெண்ணெய் (மரச்செக்கு, பச்சை)", quantity: "generous", unit: "(for mixing & serving)" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "thottathu-virundhu-thengai-poondu-idicha-podi";
    const existing = await Recipe.findOne({ slug });
    if (existing) {
      console.log(`Recipe with slug "${slug}" already exists. Skipping insert. _id=${existing._id}`);
      return;
    }

    const user = await User.findOne();
    if (!user) throw new Error("No user found");

    const fallbackCategory = await Category.findOne({ slug: "spices-masalas" }) || await Category.findOne();
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
        en: "Thottathu Virundhu Thengai Poondu Idicha Podi (Fireless Coconut Garlic Pounded Podi)",
        ta: "தோட்டத்து விருந்து தேங்காய் பூண்டு இடிச்ச பொடி",
      },
      slug,
      description: {
        en: "A zero-stove, no-cook, no-roast Kongu side podi from Kavithamani Akka at Thottathu Virundhu (Erode) — ready in exactly 3-4 minutes from start to finish. Just 4 raw ingredients (dry copra coconut, raw garlic, dry red chillies, salt) coarsely pulsed together in a bone-dry mixer jar, then served with a generous pour of raw cold-pressed gingelly oil mixed in at the plate. The signature Kongu 'unexpected-guest lifesaver' — if relatives drop by and you have no side dishes, you pound this podi, make a few hot dosas, and they walk out talking about it for days. The running joke at the restaurant: 'Dosa kanakku illa' — when this podi is served, customers stop counting how many dosas they've eaten and only count the podi.",
        ta: "ஈரோடு தோட்டத்து விருந்தின் கவிதாமணி அக்காவின் முற்றிலும் அடுப்பு இல்லாத, சமைக்காத, வறுக்காத கொங்கு தொட்டுக்கொள்ளும் பொடி — ஆரம்பம் முதல் முடிவு வரை சரியாக 3-4 நிமிடம். வெறும் 4 பச்சை பொருட்கள் (கொப்பரை தேங்காய், பச்சை பூண்டு, காய்ந்த மிளகாய், உப்பு) எலும்பு வறண்ட மிக்ஸியில் கரகரப்பாக மட்டும் அரைக்கப்படுகின்றன — பிறகு தட்டில் தாராளமான மரச்செக்கு பச்சை எள்ளெண்ணெய் கலந்து பரிமாறப்படுகிறது. திடீர் விருந்தினர் வந்தால் வேறு சைடு டிஷ் இல்லையா? இந்த பொடியை இடித்து, சில சூடான தோசை செய்து கொடுத்தால், அவர்கள் பல நாட்கள் இந்த பொடியை மறக்க மாட்டார்கள் — இதுவே கொங்கு விருந்தோம்பல் ரகசிய ஆயுதம். கடையின் வேடிக்கையான கூற்று: 'தோசை கணக்கு இல்ல' — இந்த பொடி பரிமாறப்பட்டால், வாடிக்கையாளர்கள் சாப்பிட்ட தோசையின் எண்ணிக்கையை விட பொடியின் எண்ணிக்கையை மட்டுமே கணக்கிடுவார்கள்.",
      },
      speciality: {
        en: "Four signatures define this Idicha Podi: (1) Zero-Stove Magic (Aduppu Illama) — no cooking, no roasting, no stove at all; 3-4 minutes from raw ingredients to plate. The only Kongu side dish you can make during a power cut or on a gas-empty day. (2) The Unexpected-Guest Lifesaver — designed for exactly the moment when relatives drop by unannounced and you have nothing prepared; pound this podi, make a few dosas, and Kongu hospitality is preserved. (3) The Raw Garlic Tingle (Veru-veruppu) — since garlic is used 100% raw, it gives a brilliant lingering spicy tingle on the tongue, which the rich dry copra balances perfectly so even kids keep eating. (4) The 'Dosa Kanakku Illa' Effect — the restaurant's running joke: customers stop counting dosas and only count podi servings. Critical rule: must use DRY copra (kopparai), NEVER fresh wet coconut; fresh coconut has moisture that ruins the texture and kills shelf life.",
        ta: "இந்த இடிச்ச பொடியின் நான்கு தனிச்சிறப்புகள்: (1) அடுப்பு இல்லாத மாயம் — சமைப்பதில்லை, வறுப்பதில்லை, அடுப்பே தேவையில்லை; பச்சை பொருட்களிலிருந்து தட்டுக்கு வர 3-4 நிமிடம். மின்வெட்டின் போது அல்லது சிலிண்டர் காலியான நாளில் கூட செய்யக்கூடிய ஒரே கொங்கு தொட்டுக்கொள்ளி. (2) திடீர் விருந்தினர் காப்பாளர் — உறவினர்கள் அறிவிக்காமல் வரும்போது, எதுவும் தயாராக இல்லாத தருணத்துக்காகவே வடிவமைக்கப்பட்டது; இந்த பொடியை இடித்து, சில தோசை செய்தாலே கொங்கு விருந்தோம்பல் காப்பாற்றப்படும். (3) பச்சை பூண்டு வெறுவெறுப்பு — பூண்டு 100% பச்சையாக பயன்படுத்தப்படுவதால், நாக்கில் நீடித்த காரமான வெறுவெறுப்பு கிடைக்கும்; கொப்பரை தேங்காயின் செழுமை இதை சரியாக சமன் செய்வதால் குழந்தைகள் கூட சாப்பிடுவதை நிறுத்த மாட்டார்கள். (4) 'தோசை கணக்கு இல்ல' விளைவு — கடையின் வேடிக்கை: வாடிக்கையாளர்கள் தோசை எண்ணிக்கையை மறந்து, பொடி எண்ணிக்கையை மட்டுமே கணக்கிடுகின்றனர். கட்டாய விதி: கண்டிப்பாக கொப்பரை (காய்ந்த தேங்காய்) மட்டுமே பயன்படுத்த வேண்டும், புதிய ஈரமான தேங்காய் ஒருபோதும் வேண்டாம்; புதிய தேங்காயில் ஈரப்பதம் இருப்பதால், பதம் கெடும், சேமிக்கவும் முடியாது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 4,
      cookingTime: 0,
      totalTime: 4,
      servings: 8,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "veg",
        "vegan",
        "podi",
        "milagai-podi",
        "idicha-podi",
        "thengai-poondu-podi",
        "side-dish",
        "no-cook",
        "no-stove",
        "fireless",
        "raw",
        "dry-coconut",
        "kopparai",
        "garlic-podi",
        "kongu",
        "erode",
        "tamil-nadu",
        "thottathu-virundhu",
        "kavithamani-akka",
        "quick-recipe",
        "guest-friendly",
        "dosa-side",
        "idli-side",
        "shelf-stable",
      ],
      searchKeywords: [
        "thengai poondu podi",
        "thengai poondu idicha podi",
        "coconut garlic podi",
        "fireless podi",
        "no cook podi",
        "தேங்காய் பூண்டு பொடி",
        "தேங்காய் பூண்டு இடிச்ச பொடி",
        "கொப்பரை பொடி",
        "kopparai podi",
        "kavithamani akka podi",
        "thottathu virundhu podi",
        "kongu podi",
        "instant podi",
        "dosa milagai podi alternative",
        "chef deena podi",
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
          title: { en: "The Setup (Bone-Dry Rule)", ta: "தயாரிப்பு (எலும்பு வறட்டு விதி)" },
          steps: [
            {
              step: 1,
              description: {
                en: "Traditionally this is an Idicha Podi (pounded podi) made in a stone mortar and pestle (idikal), but a standard electric mixer jar works perfectly. If you do have an idikal, use it — the slightly coarser texture is better.",
                ta: "பாரம்பரியமாக இது 'இடிச்ச பொடி' — அம்மிக்கல்லில் இடிப்பதே வழக்கம், ஆனால் சாதாரண மின்சார மிக்ஸி கூட சரியாக வேலை செய்யும். இடிக்கல் இருந்தால் அதையே பயன்படுத்தவும் — சற்று கரகரப்பான பதம் சிறந்தது.",
              },
            },
            {
              step: 2,
              description: {
                en: "Critical rule: ensure your mixer jar (or mortar) is COMPLETELY DRY. There must not be a single drop of water inside. Even a small amount of moisture will turn the podi into a paste instead of a powder and ruin both the texture and the shelf life. Wipe with a dry kitchen towel if you just washed it.",
                ta: "கட்டாய விதி: மிக்ஸி பாட்டில் (அல்லது அம்மிக்கல்) முற்றிலும் வறண்டே இருக்க வேண்டும். உள்ளே ஒரு துளி தண்ணீர் கூட இருக்க கூடாது. சிறிது ஈரம் இருந்தாலும் பொடி தூளாக மாறாமல், விழுதாக மாறிவிடும் — பதமும் சேமிப்பு கால அளவும் கெடும். இப்போதுதான் கழுவியிருந்தால், வரண்ட துணியால் முழுமையாக துடைக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Critical ingredient rule: use ONLY dry copra (kopparai thengai) chopped into small pieces — NEVER fresh wet coconut. Fresh coconut contains moisture that will spoil the podi within hours and ruin the dry pounded texture entirely.",
                ta: "கட்டாய பொருள் விதி: சிறிய துண்டுகளாக நறுக்கிய கொப்பரை தேங்காய் மட்டுமே பயன்படுத்தவும் — புதிய ஈரமான தேங்காயை ஒருபோதும் பயன்படுத்த வேண்டாம். புதிய தேங்காயில் ஈரப்பதம் இருப்பதால் சில மணி நேரத்தில் பொடி கெட்டுவிடும், வறட்டு இடித்த பதமும் முற்றிலும் இழக்கப்படும்.",
              },
            },
          ],
        },
        {
          type: "preparation",
          title: { en: "The Initial Crush", ta: "முதல் அரைப்பு" },
          steps: [
            {
              step: 4,
              description: {
                en: "Drop the 6-8 dry red chillies and the crystal salt directly into the dry mixer jar (or mortar). Don't add the coconut and garlic yet — chillies first, alone with salt.",
                ta: "6-8 காய்ந்த மிளகாய் மற்றும் கல் உப்பை மட்டும் வரண்ட மிக்ஸியில் (அல்லது அம்மிக்கல்லில்) சேர்க்கவும். தேங்காய் மற்றும் பூண்டு இப்போது சேர்க்க வேண்டாம் — மிளகாய் + உப்பு மட்டும் முதலில்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Pulse the mixer in short bursts (or pound with the pestle) until the chillies break down into a coarse chilli-flake/powder texture. Trick: grinding the salt along with the chillies acts as a natural abrasive and helps the chillies grind faster and more evenly.",
                ta: "மிக்ஸியை குறுகிய பர்ஸ்ட்களில் பல்ஸ் செய்யவும் (அல்லது உலக்கையால் இடிக்கவும்) — மிளகாய் கரகரப்பான மிளகாய் தூளாக உடைய வேண்டும். ரகசியம்: உப்பை மிளகாயுடன் சேர்த்து அரைப்பது இயற்கையான உராய்வாக செயல்படும், மிளகாய் வேகமாகவும் சீராகவும் அரையும்.",
              },
            },
          ],
        },
        {
          type: "preparation",
          title: { en: "The Magic Blend", ta: "முக்கிய அரைப்பு" },
          steps: [
            {
              step: 6,
              description: {
                en: "Now add the 1 cup of chopped dry coconut (kopparai) and the 10-15 cloves of raw peeled garlic directly into the coarse chilli powder.",
                ta: "இப்போது 1 கப் நறுக்கிய கொப்பரை தேங்காய் மற்றும் 10-15 பச்சை தோல் சீவிய பூண்டை, கரகரப்பான மிளகாய் தூளில் நேரடியாக சேர்க்கவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Pulse the mixer in SHORT BURSTS only (whip mode). Critical: do NOT run the mixer continuously. Continuous running heats up the coconut and forces it to release its natural oil, which turns the entire mixture into a sticky paste rather than a dry crumbly podi.",
                ta: "மிக்ஸியை குறுகிய பர்ஸ்ட்களில் மட்டுமே பல்ஸ் செய்யவும் (விப் மோடு). மிக முக்கியம்: மிக்ஸியை தொடர்ந்து இயக்க வேண்டாம். தொடர்ந்து இயக்கினால் தேங்காய் சூடாகி, அதன் இயற்கையான எண்ணெய்யை வெளியேற்றும் — முழு கலவையும் வறட்டு கரகரப்பான பொடிக்கு பதிலாக ஒட்டும் விழுதாக மாறிவிடும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Texture check: you want a slightly coarse, CRUMBLY texture where the small moisture from the raw garlic just barely binds the dry coconut and chilli powder together — no more. Stop pulsing the moment the garlic disappears into the mixture; if you see oil sheen forming, you've gone too far.",
                ta: "பதம் சரிபார்ப்பு: கரகரப்பான, பொருக்கான பதம் வேண்டும் — பச்சை பூண்டில் இருக்கும் சிறு ஈரம், வறண்ட தேங்காய் மற்றும் மிளகாய் தூளை மிக மிக லேசாக மட்டுமே ஒன்றாக பிணைக்க வேண்டும் — அதற்கு மேல் இல்லை. பூண்டு கலவையில் காணாமல் போனவுடன் பல்ஸ் செய்வதை நிறுத்தவும்; எண்ணெய் தோன்ற ஆரம்பித்தால் அதிகமாக அரைத்துவிட்டீர்கள் என்று அர்த்தம்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Traditional Serving Method", ta: "பாரம்பரிய பரிமாறும் முறை" },
          steps: [
            {
              step: 9,
              description: {
                en: "Transfer the freshly pounded podi to an airtight glass or steel container. Properly made with bone-dry copra and a dry mixer, this podi keeps at room temperature for 3-5 days; refrigerated, it lasts 2-3 weeks.",
                ta: "புதிதாக இடித்த பொடியை காற்று புகாத கண்ணாடி அல்லது இரும்பு டப்பாவில் சேமிக்கவும். எலும்பு வறண்ட கொப்பரை மற்றும் வரண்ட மிக்ஸியில் சரியாக செய்திருந்தால், அறை வெப்பநிலையில் 3-5 நாட்கள்; குளிர்சாதனத்தில் 2-3 வாரங்கள் வரை கெடாமல் இருக்கும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "To serve: place a generous couple of spoonfuls of the podi directly on the eater's plate. Don't pre-mix the oil into the whole batch — that ruins the shelf life. Oil goes in plate-by-plate, fresh.",
                ta: "பரிமாற: ஒரு சில ஸ்பூன் தாராளமான பொடியை சாப்பிடுபவரின் தட்டிலேயே நேரடியாக வைக்கவும். மொத்த பொடியில் முன்கூட்டியே எண்ணெய் கலக்க வேண்டாம் — சேமிப்பு கெட்டுவிடும். ஒவ்வொரு தட்டிலும் புதியதாக எண்ணெய் ஊற்றுவதே சரியான முறை.",
              },
            },
            {
              step: 11,
              description: {
                en: "Make a small well in the center of the podi mound and pour a LIBERAL amount of raw, cold-pressed gingelly oil (nallennai) over it. Don't be stingy with the oil — it's the carrier that ties the chilli, coconut and garlic together and softens the raw garlic kick.",
                ta: "பொடி குவியலின் மையத்தில் சிறு பள்ளம் செய்து, தாராளமான மரச்செக்கு பச்சை எள்ளெண்ணெய் (நல்லெண்ணெய்) ஊற்றவும். எண்ணெயில் கஞ்சத்தனம் வேண்டாம் — மிளகாய், தேங்காய், பூண்டு ஆகியவற்றை ஒன்றாக இணைத்து, பச்சை பூண்டின் காரத்தை மென்மையாக்கும் ஊடகம் இதுவே.",
              },
            },
            {
              step: 12,
              description: {
                en: "Mix the podi and oil with your fingers right on the plate into a thick paste. Serve immediately with steaming hot crispy dosas or incredibly soft mallipoo idlies. The Kongu warning: 'Dosa kanakku illa' — make extra dosas, because once people taste this they will stop counting.",
                ta: "தட்டிலேயே, விரல்களால் பொடியையும் எண்ணெயையும் கலந்து கெட்டியான விழுதாக மாற்றவும். உடனடியாக சூடான மொறுமொறுப்பான தோசை அல்லது மிக மிருதுவான மல்லிப்பூ இட்லியுடன் பரிமாறவும். கொங்கு எச்சரிக்கை: 'தோசை கணக்கு இல்ல' — கூடுதலான தோசை செய்து வைக்கவும், ஏனெனில் இந்த பொடியை சுவைத்தவுடன் மக்கள் எண்ணுவதை நிறுத்திவிடுவார்கள்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Thengai Poondu Idicha Podi recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
