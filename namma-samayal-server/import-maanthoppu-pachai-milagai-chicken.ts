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
  { slug: "country-chicken", name: "Chicken (Naattu Kozhi or Broiler)", ta: "கோழி (நாட்டு கோழி அல்லது பாய்லர்)", quantity: "1", unit: "kg" },
  { slug: "green-chilli", name: "Thick Green Chillies (Hybrid / Gundu Pachai Milagai — NOT Neela Milagai)", ta: "தடிமனான பச்சை மிளகாய் (குண்டு / ஹைப்ரிட் — நீள மிளகாய் வேண்டாம்)", quantity: "200-250", unit: "g" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, finely chopped)", ta: "சின்ன வெங்காயம் (நன்கு நறுக்கியது)", quantity: "300-400", unit: "g" },
  { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste", ta: "இஞ்சி பூண்டு விழுது", quantity: "2", unit: "tbsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1-2", unit: "generous handfuls" },
  { slug: "groundnut-oil", name: "Groundnut Oil (cold-pressed, crucial for balancing chilli heat)", ta: "கடலை எண்ணெய் (மரச்செக்கு — மிளகாய் வெப்பத்தை சமன் செய்ய அவசியம்)", quantity: "4-5", unit: "tbsp" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "maanthoppu-virundhu-pachai-milagai-chicken";
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
        en: "Maanthoppu Virundhu Pachai Milagai Chicken (Kongu Green Chilli Chicken)",
        ta: "மான்தோப்பு விருந்து பச்சை மிளகாய் சிக்கன் (கொங்கு பச்சை மிளகாய் கோழி)",
      },
      slug,
      description: {
        en: "A shockingly minimalist Kongu chicken roast from Maanthoppu Virundhu (Erode) — Chef Deena calls it a 'Super Star' because it relies entirely on just 4-5 core ingredients: chicken, cold-pressed groundnut oil, small onions and hybrid green chillies. NO coriander powder, NO chilli powder, NO garam masala, NO tomato, NO coconut. The non-negotiable rule is the chilli: you must use thick, light-green hybrid (Gundu Pachai Milagai) chillies — NEVER the long thin dark-green Neela Milagai, which would make the dish unbearably spicy. The hybrid chillies are mild but moisture-rich and aromatic; they slow-roast alongside the shallots in groundnut oil until they completely melt down, mashing together with chicken juices into a thick, green-tinted natural thokku without any powders or tomatoes. Famous as the sinus-clearing 'Cold ellame paranthurum' (cold flies away!) cold remedy when paired with rasam rice.",
        ta: "ஈரோடு மான்தோப்பு விருந்தின் ஆச்சர்யமான எளிமையான கொங்கு கோழி வறுவல் — சமையற்காரர் டீனா இதை 'சூப்பர் ஸ்டார்' என்று அழைக்கிறார், ஏனெனில் வெறும் 4-5 முக்கிய பொருட்களில் மட்டுமே செய்யப்படுகிறது: கோழி, மரச்செக்கு கடலை எண்ணெய், சின்ன வெங்காயம், ஹைப்ரிட் பச்சை மிளகாய். கொத்தமல்லி தூள், மிளகாய் தூள், கரம் மசாலா, தக்காளி, தேங்காய் எதுவும் இல்லை. மிளகாய் தேர்வே மிக கட்டாய விதி: தடிமனான, வெளிர் பச்சை ஹைப்ரிட் (குண்டு பச்சை மிளகாய்) மட்டுமே — நீள மெல்லிய அடர் பச்சை 'நீள மிளகாயை' ஒருபோதும் பயன்படுத்த வேண்டாம், இல்லையென்றால் உணவு தாங்க முடியாத காரமாக மாறிவிடும். ஹைப்ரிட் மிளகாய் காரம் மிகவும் குறைவு, ஆனால் ஈரப்பதம் மற்றும் வாசனை அதிகம்; கடலை எண்ணெயில் சின்ன வெங்காயத்துடன் சேர்ந்து மெதுவாக வேக வைக்கப்படும்போது, முற்றிலும் கரைந்து, கோழி சாற்றுடன் கலந்து, தூள்களோ தக்காளியோ இல்லாமலேயே கெட்டியான, பச்சை நிற இயற்கையான தொக்கு உருவாக்குகின்றன. ரசம் சாதத்துடன் சேர்த்தால், 'கோல்ட் எல்லாமே பறந்துரும்' (சளி, மூக்கடைப்பு பறந்து விடும்) என்று புகழப்படும் சைனஸ் தீர்வாகும்.",
      },
      speciality: {
        en: "Four Maanthoppu Virundhu signatures define this dish: (1) The Super-Star Minimalism — only 4-5 core ingredients (chicken, groundnut oil, shallots, green chillies, salt + ginger-garlic + turmeric for the rest); ZERO coriander/chilli/garam masala powders, ZERO tomatoes, ZERO coconut. The dish proves Kongu cooking doesn't need volume to deliver flavor. (2) The Hybrid Chilli Rule — non-negotiable; use ONLY thick light-green Gundu Pachai Milagai (hybrid chillies), NEVER long thin dark-green Neela Milagai. Hybrid chillies have low heat but high moisture and aroma — they form the entire gravy base. Using the wrong chilli will either make the dish painfully spicy or watery and bitter. (3) The Illusory Gravy Magic — there's no tomato, no powder, no coconut to thicken the gravy, yet a rich green-tinted thokku forms. The secret: hybrid chillies + shallots, slow-roasted in groundnut oil, completely melt down and mash into chicken juices to self-form the natural thokku coating. (4) The Cold Remedy Pair — when this spicy aromatic chicken is eaten with hot tangy rasam rice, chefs swear 'cold ellame paranthurum' — your cold/congestion will fly away. The combination of capsaicin from green chilli + warming spices in rasam acts as a natural decongestant.",
        ta: "மான்தோப்பு விருந்தின் நான்கு தனிச்சிறப்புகள்: (1) சூப்பர் ஸ்டார் எளிமை — வெறும் 4-5 முக்கிய பொருட்கள் (கோழி, கடலை எண்ணெய், சின்ன வெங்காயம், பச்சை மிளகாய், உப்பு + இஞ்சி-பூண்டு + மஞ்சள் தூள்); எந்த கொத்தமல்லி/மிளகாய்/கரம் மசாலா தூளும் இல்லை, தக்காளி இல்லை, தேங்காய் இல்லை. கொங்கு சமையலுக்கு சுவைக்கு பெரிய பட்டியல் தேவையில்லை என்பதை இந்த உணவு நிரூபிக்கிறது. (2) ஹைப்ரிட் மிளகாய் விதி — பேச்சுவார்த்தைக்கு இடமில்லாதது; கட்டாயம் தடிமனான வெளிர் பச்சை குண்டு பச்சை மிளகாய் (ஹைப்ரிட்) மட்டுமே, நீள மெல்லிய அடர் பச்சை 'நீள மிளகாய்' ஒருபோதும் வேண்டாம். ஹைப்ரிட் மிளகாய் காரம் குறைவு, ஆனால் ஈரப்பதம் மற்றும் வாசனை அதிகம் — முழு குழம்பின் அடிப்படையும் இதுதான். தவறான மிளகாய் பயன்படுத்தினால் உணவு தாங்க முடியாத காரமாக அல்லது நீர்த்து கசக்கும். (3) மாயா குழம்பு மந்திரம் — தக்காளி, தூள், தேங்காய் எதுவும் கெட்டியாக்க இல்லாமலேயே, செழுமையான பச்சை நிற தொக்கு உருவாகிறது. ரகசியம்: ஹைப்ரிட் மிளகாய் + சின்ன வெங்காயம் கடலை எண்ணெயில் மெதுவாக வதங்கும்போது முற்றிலும் கரைந்து, கோழி சாற்றில் கலந்து, தானாகவே இயற்கையான தொக்கு கோட்டிங்கை உருவாக்கும். (4) சைனஸ் தீர்வு சேர்க்கை — காரமான, வாசனை மிக்க இந்த கோழியை சூடான புளிப்பான ரசம் சாதத்துடன் சாப்பிட்டால், சமையற்காரர்கள் சத்தியம் செய்கிறார்கள்: 'கோல்ட் எல்லாமே பறந்துரும்' — சளி, மூக்கடைப்பு பறந்து விடும். பச்சை மிளகாயின் காப்சைசின் + ரசத்தின் சூட்டு மசாலா இணைந்து இயற்கையான மூக்கடைப்பு நீக்கி ஆகின்றன.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 15,
      cookingTime: 45,
      totalTime: 60,
      servings: 4,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "non-veg",
        "chicken",
        "country-chicken",
        "naatu-kozhi",
        "pachai-milagai-chicken",
        "green-chilli-chicken",
        "thokku",
        "varuval",
        "roast",
        "side-dish",
        "erode",
        "kongu",
        "tamil-nadu",
        "maanthoppu-virundhu",
        "minimal-ingredients",
        "no-masala-powder",
        "no-tomato",
        "no-coconut",
        "hybrid-chilli",
        "cold-remedy",
        "sinus-clearing",
        "super-star",
        "traditional",
      ],
      searchKeywords: [
        "pachai milagai chicken",
        "green chilli chicken",
        "kongu pachai milagai kozhi",
        "பச்சை மிளகாய் சிக்கன்",
        "மான்தோப்பு விருந்து பச்சை மிளகாய் கோழி",
        "maanthoppu virundhu chicken",
        "hybrid chilli chicken",
        "gundu pachai milagai chicken",
        "cold remedy chicken",
        "sinus chicken",
        "chef deena maanthoppu chicken",
        "no masala chicken",
        "4 ingredient chicken",
        "minimalist chicken roast",
        "erode green chilli chicken",
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
          title: { en: "Prep (Critical Chilli Selection)", ta: "முன் தயாரிப்பு (மிக முக்கியமான மிளகாய் தேர்வு)" },
          steps: [
            {
              step: 1,
              description: {
                en: "CHILLI SELECTION (the make-or-break rule): you must use thick, light-green HYBRID chillies — Gundu Pachai Milagai — which are short, fat, and pale green. DO NOT use long, thin, dark-green Neela Milagai — they have intense capsaicin and will turn the dish painfully inedible. Test rule: if the chilli is darker than the leaf of a banana plant, do not use it.",
                ta: "மிளகாய் தேர்வு (வெற்றி-தோல்வி விதி): தடிமனான, வெளிர் பச்சை ஹைப்ரிட் மிளகாய் — குண்டு பச்சை மிளகாய் — ஐ மட்டுமே பயன்படுத்தவும்; இவை குட்டையான, தடிமனான, வெளிர் பச்சை நிறம் கொண்டவை. நீளமான, மெல்லிய, அடர் பச்சை 'நீள மிளகாயை' ஒருபோதும் பயன்படுத்த வேண்டாம் — இவற்றில் காரம் மிக அதிகம், உணவை தாங்க முடியாதபடி கசப்பாக்கும். சோதனை விதி: வாழை இலையை விட மிளகாய் அடர் பச்சையாக இருந்தால், அதை பயன்படுத்த வேண்டாம்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Clean the 1 kg of chicken (country chicken for the authentic Kongu version; broiler also works for a quicker version). Cut into small, bite-sized pieces with bones intact. Drain well.",
                ta: "1 கிலோ கோழியை சுத்தம் செய்யவும் (அசலான கொங்கு பாணிக்கு நாட்டு கோழி; விரைவு பதிப்புக்கு பாய்லர் பயன்படுத்தலாம்). எலும்புகளுடன் சிறிய, கடிக்கும் அளவு துண்டுகளாக வெட்டவும். நன்கு வடிக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Peel the 300-400g of small onions and finely chop them. Roughly chop or slit the 200-250g of hybrid green chillies — keep them somewhat large since they will completely melt down during cooking.",
                ta: "300-400 கிராம் சின்ன வெங்காயத்தை தோல் சீவி, நன்கு நறுக்கவும். 200-250 கிராம் ஹைப்ரிட் பச்சை மிளகாயை பெரிய துண்டுகளாக நறுக்கவும் அல்லது கீறவும் — வேக்கும் போது முற்றிலும் கரைந்துவிடும், எனவே சற்று பெரிய துண்டுகளாகவே வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Aromatic Sauté", ta: "வாசனை வதக்கல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Heat a heavy-bottomed cast-iron kadai or a traditional clay pot (manchatti) over medium heat. Pour in the 4-5 tablespoons of cold-pressed groundnut oil generously. The oil is non-negotiable here — it's the only thing balancing the heat of the chillies and carrying the entire flavor.",
                ta: "ஒரு தடிமனான இரும்பு கடாய் அல்லது பாரம்பரிய மண்சட்டியை மிதமான தீயில் சூடாக்கவும். 4-5 ஸ்பூன் மரச்செக்கு கடலை எண்ணெய்யை தாராளமாக ஊற்றவும். இந்த எண்ணெய் கட்டாயம் — இதுவே மிளகாயின் காரத்தை சமன் செய்து, முழு சுவையையும் தாங்குகிறது.",
              },
            },
            {
              step: 5,
              description: {
                en: "Once the oil is hot, drop in 1-2 generous handfuls of fresh curry leaves and let them crackle vigorously for 10-15 seconds — they will release a beautiful aroma into the oil.",
                ta: "எண்ணெய் சூடாகும் போது, 1-2 கைப்பிடி புதிய கருவேப்பிலையை சேர்த்து, அழகான வாசனை எண்ணெய்க்கு பரவ 10-15 விநாடிகள் சீறி வெடிக்க விடவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Add the finely chopped small onions. Sauté patiently on a medium flame, stirring often, until they turn translucent, soft, and lightly golden — about 8-10 minutes. Don't rush; the onions are one of the two main pillars of the gravy.",
                ta: "நன்கு நறுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, பளபளப்பாகி, மிருதுவாகி, லேசான பொன்னிறம் வரும் வரை — சுமார் 8-10 நிமிடம் — பொறுமையாக வதக்கவும். அவசரப்பட வேண்டாம்; குழம்பின் இரண்டு முக்கிய தூண்களில் ஒன்று சின்ன வெங்காயம்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Chilli Infusion", ta: "மிளகாய் இணைப்பு" },
          steps: [
            {
              step: 7,
              description: {
                en: "Add the chopped hybrid green chillies directly to the sautéed onions. Sauté the chillies and onions together patiently in the oil — about 5-7 minutes. This step is critical: sautéing the green chillies in groundnut oil removes their raw 'bite' and brings out their sweet, herbal aroma. Skipping or rushing this step = raw harsh chilli flavor in the final dish.",
                ta: "நறுக்கிய ஹைப்ரிட் பச்சை மிளகாயை வதங்கிய சின்ன வெங்காயத்தில் நேரடியாக சேர்க்கவும். மிளகாய் மற்றும் வெங்காயத்தை எண்ணெயில் ஒன்றாக 5-7 நிமிடம் பொறுமையாக வதக்கவும். இந்த படி மிக முக்கியம்: பச்சை மிளகாயை கடலை எண்ணெயில் வதக்குவது, அதன் பச்சை கடுமையை நீக்கி, இனிமையான மூலிகை வாசனையை வெளிக்கொண்டு வரும். இந்த படியை தவிர்த்தாலோ அவசரப்பட்டாலோ — இறுதி உணவில் பச்சை மிளகாயின் கடுமையான சுவை மீதம் இருக்கும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the 2 tablespoons of ginger-garlic paste and sauté vigorously for 1-2 minutes until the raw, pungent smell completely disappears.",
                ta: "2 ஸ்பூன் இஞ்சி-பூண்டு விழுதை சேர்த்து, பச்சை வாசனை முற்றிலும் போகும் வரை 1-2 நிமிடம் வேகமாக வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Searing the Chicken", ta: "கோழியை வறுத்தல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Drop the small-cut chicken pieces directly into the chilli-onion mixture in the kadai. Add the 1 tsp turmeric powder and crystal salt to taste.",
                ta: "சிறு துண்டாக்கிய கோழியை நேரடியாக கடாயில் உள்ள மிளகாய்-வெங்காய கலவையில் சேர்க்கவும். 1 ஸ்பூன் மஞ்சள் தூள் மற்றும் தேவையான கல் உப்பு சேர்க்கவும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Mix everything well, ensuring every piece is coated. Let the chicken sear in the hot oil and spices on medium-high heat for 5-8 minutes, turning often — the meat will firm up, change color from pink to white/light brown, and start releasing its own juices.",
                ta: "அனைத்தையும் நன்கு கலந்து, ஒவ்வொரு துண்டிலும் மசாலா படியும்படி பார்க்கவும். மிதமான-உயர் தீயில், அடிக்கடி புரட்டி, கோழியை சூடான எண்ணெய் மற்றும் மசாலாவில் 5-8 நிமிடம் வறுபட விடவும் — இறைச்சி இறுகி, இளஞ்சிவப்பிலிருந்து வெள்ளை/லேசான பழுப்பாக நிறம் மாறி, தனது சாற்றை வெளியேற்ற ஆரம்பிக்கும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Slow Roast (Thokku Formation)", ta: "மெதுவான வறுவல் (தொக்கு உருவாக்கம்)" },
          steps: [
            {
              step: 11,
              description: {
                en: "Pour in just enough water to cook the chicken. Quantity depends on chicken type: for naattu kozhi, add water until the chicken is half-submerged (it needs a longer boil); for broiler chicken, add only a splash since broiler releases its own juices quickly and finishes faster.",
                ta: "கோழி வேக போதிய அளவு தண்ணீர் மட்டும் ஊற்றவும். அளவு கோழியின் வகையைப் பொறுத்தது: நாட்டு கோழிக்கு, கோழி பாதி மூழ்கும் அளவு (அதிக நேரம் வேக தேவை); பாய்லர் கோழிக்கு, ஒரு துளி மட்டுமே — பாய்லர் வேகமாக தனது சாற்றை வெளியேற்றி விரைவாக வெந்துவிடும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Cover the kadai and let the chicken cook on a medium flame until tender. Naattu kozhi typically takes 25-40 minutes; broiler takes 12-18 minutes. Check occasionally.",
                ta: "கடாயை மூடி, மிதமான தீயில் கோழி மிருதுவாகும் வரை வேக விடவும். நாட்டு கோழி வழக்கமாக 25-40 நிமிடம்; பாய்லர் 12-18 நிமிடம். அவ்வப்போது சரிபார்க்கவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Once the chicken is fully cooked and tender, remove the lid. Now the thokku-forming stage begins: keep tossing the mixture continuously as the remaining water evaporates over a medium-high flame.",
                ta: "கோழி முற்றிலும் வெந்து மிருதுவான பின், மூடியை எடுக்கவும். இப்போது தொக்கு உருவாகும் கட்டம் ஆரம்பம்: மிதமான-உயர் தீயில், மீதமுள்ள தண்ணீர் ஆவியாக போகும்போது, கலவையை தொடர்ந்து புரட்டி கிளறவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "As the water dries up, the magic happens: the hybrid green chillies and small onions completely break down and mash into the chicken juices, coating every piece in a thick, glossy, green-tinted natural thokku — with NO powders, NO tomatoes, NO coconut needed. This is the 'illusory gravy' that makes the dish a super star.",
                ta: "தண்ணீர் வற்றும்போது, மந்திரம் நடக்கிறது: ஹைப்ரிட் பச்சை மிளகாய் மற்றும் சின்ன வெங்காயம் முற்றிலும் கரைந்து, கோழி சாற்றில் கலந்து, ஒவ்வொரு துண்டிலும் கெட்டியான, பளபளக்கும், பச்சை நிற இயற்கையான தொக்காக மாறும் — எந்த தூளும் இல்லாமல், தக்காளி இல்லாமல், தேங்காய் இல்லாமல். இதுவே இந்த உணவை சூப்பர் ஸ்டாராக ஆக்கும் 'மாயா குழம்பு'.",
              },
            },
            {
              step: 15,
              description: {
                en: "Turn off the heat the moment the groundnut oil separates and glistens at the EDGES of the kadai — that's the visual signal of doneness. Over-roasting past this point makes the chicken dry and rubbery.",
                ta: "கடாயின் ஓரத்தில் கடலை எண்ணெய் தனியாக மிதந்து பளபளக்க ஆரம்பித்தவுடன், உடனே அடுப்பை அணைக்கவும் — அதுவே 'தயார்' அடையாளம். இதைத் தாண்டி அதிகம் வறுத்தால், கோழி காய்ந்து ரப்பர் போல மாறிவிடும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Serve this brilliant, sinus-clearing Pachai Milagai Chicken hot directly from the stove. The classic Kongu cold-remedy pairing: a generous helping over hot rasam rice — when paired this way, the chefs swear 'cold ellame paranthurum' (your cold/congestion will instantly fly away). Also pairs well with plain steamed white rice + ghee, or as a side with parottas.",
                ta: "இந்த அற்புதமான, சைனஸ் தீர்க்கும் பச்சை மிளகாய் சிக்கனை, அடுப்பில் இருந்து நேரடியாக சூடாக பரிமாறவும். கிளாசிக் கொங்கு சளி-தீர்வு சேர்க்கை: சூடான ரசம் சாதத்தின் மேல் தாராளமாக ஊற்றி — இப்படி சேர்த்தால், சமையற்காரர்கள் சத்தியம் செய்கிறார்கள், 'கோல்ட் எல்லாமே பறந்துரும்' (சளி, மூக்கடைப்பு உடனே பறந்துவிடும்). சாதம் + நெய்யுடன், அல்லது பரோட்டாவுடன் சைடாகவும் சிறப்பாக பொருந்தும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Maanthoppu Pachai Milagai Chicken recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
