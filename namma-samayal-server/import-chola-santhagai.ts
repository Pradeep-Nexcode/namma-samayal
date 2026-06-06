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
  // Dough
  { slug: "rice-flour", name: "Rice Flour (Idiyappam Maavu)", ta: "அரிசி மாவு (இடியாப்ப மாவு)", quantity: "5", unit: "cups", categorySlug: "grains-cereals" },
  { slug: "sprouted-sorghum-flour", name: "Sprouted Sorghum Flour (Mulaikattiya Chola Maavu)", ta: "முளைகட்டிய சோள மாவு", quantity: "2", unit: "cups", categorySlug: "grains-cereals" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },

  // Savory tempering
  { slug: "coconut-oil", name: "Coconut Oil (Thengai Ennai) — for savory tempering", ta: "தேங்காய் எண்ணெய் (கார தாளிப்புக்கு)", quantity: "1", unit: "tbsp" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "chana-dal", name: "Bengal Gram (Kadalai Paruppu)", ta: "கடலை பருப்பு", quantity: "1", unit: "tsp" },
  { slug: "urad-dal", name: "Urad Dal (Ulutham Paruppu)", ta: "உளுந்து", quantity: "1", unit: "tsp" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, finely chopped)", ta: "சின்ன வெங்காயம் (நன்கு நறுக்கியது)", quantity: "30", unit: "nos" },
  { slug: "green-chilli", name: "Green Chilli (slit)", ta: "பச்சை மிளகாய் (கீறியது)", quantity: "2", unit: "nos" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "2", unit: "sprigs" },
  { slug: "asafoetida-hing", name: "Asafoetida (Perungayam)", ta: "பெருங்காயம்", quantity: "1", unit: "generous pinch" },

  // Sweet version
  { slug: "coconut", name: "Fresh Coconut (for thick milk)", ta: "புதிய தேங்காய் (கெட்டியான பால் எடுக்க)", quantity: "2", unit: "whole" },
  { slug: "jaggery", name: "Jaggery (Vellam)", ta: "வெல்லம்", quantity: "as required", unit: "(for sweetness)" },
  { slug: "cardamom", name: "Cardamom (Yelakkai, crushed)", ta: "ஏலக்காய் (நசுக்கியது)", quantity: "4", unit: "nos" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "organic-chola-santhagai";
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
        en: "Organic Chola Santhagai (Sprouted Sorghum String Hoppers, Sweet + Savory)",
        ta: "ஆர்கானிக் சோள சந்தகை (முளைகட்டிய சோள இடியாப்பம், இனிப்பு + காரம்)",
      },
      title: "Chola Santhagai (Sprouted Sorghum String Hoppers)",
      slug,
      description: {
        en: "A wholesome organic Kongu breakfast from Mrs. Priya Sivaprakasam's farming family — sprouted sorghum (cholam) flour mixed with rice flour, steamed into delicate string hoppers (santhagai/idiyappam), then split into TWO finishes side-by-side: half tossed in a coconut-oil shallot tempering with mustard, chana dal, urad dal, curry leaves and asafoetida; the other half drowned in fresh coconut milk sweetened with natural jaggery and crushed cardamom. The sprouting unlocks the millet's hidden nutrients and makes the hoppers earthy-fragrant and gut-friendly. Famously compared to 'thaayppaal' (mother's milk) for its purity and digestibility.",
        ta: "திருமதி பிரியா சிவபிரகாசத்தின் கொங்கு பகுதி இயற்கை விவசாய குடும்பத்தின் ஊட்டச்சத்து நிறைந்த காலை உணவு — முளைகட்டிய சோள மாவை அரிசி மாவுடன் கலந்து, ஆவியில் வேக வைத்து, மென்மையான இடியாப்பமாக (சந்தகை) தயாரித்து, இரண்டு வழிகளில் ஒரே நேரத்தில் முடிக்கப்படுகிறது: பாதி தேங்காய் எண்ணெய், சின்ன வெங்காயம், கடுகு, கடலை பருப்பு, உளுந்து, கருவேப்பிலை, பெருங்காய தாளிப்பில் கலக்கப்படுகிறது; மீதி பாதி, புதிய தேங்காய் பால், இயற்கை வெல்லம், நசுக்கிய ஏலக்காய் சேர்த்து செய்யப்பட்ட இனிமையான பாலில் மூழ்கடிக்கப்படுகிறது. முளைப்பது சோளத்தின் மறைந்த ஊட்டச்சத்தை வெளியேற்றி, இடியாப்பத்துக்கு மண் வாசனை மற்றும் வயிற்றுக்கு இலகுத்தன்மை தருகிறது. 'தாய்ப்பால் போல' என்று புகழப்படும் இதன் தூய்மை மற்றும் ஜீரண நட்பு.",
      },
      speciality: {
        en: "Three signatures define this organic Chola Santhagai: (1) 'Thaayppaal Pola' Purity — the family practices generational natural/organic farming; every ingredient is pesticide-free, making this meal exceptionally easy on the gut. The hoppers are compared to mother's milk for their soothing, nourishing quality. (2) The Power of Sprouting — instead of plain rice-flour idiyappam, sprouted sorghum (mulaikattiya cholam) is mixed in. Sprouting activates enzymes that unlock B-vitamins, iron and protein that are otherwise locked up in the grain, AND drops anti-nutrients like phytic acid. Result: a millet hopper that's earthier in flavour AND more bioavailable. (3) The Sweet + Savory Pair-Up — Santhagai is famously dual-finished. Half goes into a coconut-oil shallot tempering (savory, with mustard-chana-urad-curry leaf crackle); the other half drowns in fresh-pressed coconut milk + jaggery + crushed cardamom (sweet). Eaten side-by-side, sweet and savory mouthfuls play off each other.",
        ta: "இந்த ஆர்கானிக் சோள சந்தகையின் மூன்று தனிச்சிறப்புகள்: (1) 'தாய்ப்பால் போல' தூய்மை — குடும்பம் தலைமுறை தலைமுறையாக இயற்கை விவசாயம் செய்கிறது; ஒவ்வொரு பொருளும் பூச்சிக்கொல்லி இல்லாதது, இதனால் இந்த உணவு வயிற்றுக்கு மிக இலகுவாக இருக்கிறது. இடியாப்பம் தாய்ப்பாலின் ஆறுதலான, ஊட்டச்சத்து குணத்துடன் ஒப்பிடப்படுகிறது. (2) முளைப்பின் சக்தி — சாதாரண அரிசி-மாவு இடியாப்பத்துக்கு பதிலாக, முளைகட்டிய சோளம் சேர்க்கப்படுகிறது. முளைப்பது தானியத்துக்குள் பூட்டியிருக்கும் பி-வைட்டமின்கள், இரும்புச்சத்து, புரதம் ஆகியவற்றை வெளியேற்ற செய்யும் என்சைம்களை செயல்படுத்துகிறது; ஃபைடிக் அமிலம் போன்ற எதிர்-ஊட்டச்சத்துக்களையும் குறைக்கிறது. முடிவு: சுவையில் மண் வாசனை மற்றும் உடலில் சிறந்த உறிஞ்சப்படக்கூடிய சிறுதானிய இடியாப்பம். (3) இனிப்பு + காரம் இரட்டை சேர்க்கை — சந்தகை தனது இரட்டை முடிப்புக்கு பிரபலம். பாதி தேங்காய் எண்ணெய் சின்ன வெங்காய தாளிப்பில் (காரம், கடுகு-கடலை-உளுந்து-கருவேப்பிலை சீறலுடன்); மீதி பாதி புதிய தேங்காய் பால் + வெல்லம் + நசுக்கிய ஏலக்காயில் (இனிப்பு) மூழ்கடிக்கப்படுகிறது. பக்கம் பக்கமாக சாப்பிட்டால், இனிப்பு மற்றும் கார கடிகள் ஒன்றுக்கொன்று கூட்டி ருசிக்கின்றன.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
      },
      prepTime: 30,
      cookingTime: 25,
      totalTime: 55,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=PVCdy5brosM",
      },
      tags: [
        "veg",
        "vegan-friendly",
        "breakfast",
        "tiffin",
        "santhagai",
        "idiyappam",
        "string-hoppers",
        "sprouted-millet",
        "cholam",
        "sorghum",
        "organic",
        "natural-farming",
        "gut-friendly",
        "kid-friendly",
        "kongu",
        "tamil-nadu",
        "thaayppaal",
        "high-protein",
        "fermented-flavor",
        "millet",
        "siruthaniyam",
        "sweet-and-savory",
        "coconut-milk",
        "jaggery",
      ],
      searchKeywords: [
        "chola santhagai",
        "sprouted sorghum santhagai",
        "சோள சந்தகை",
        "மூளகட்டிய சோள இடியாப்பம்",
        "organic santhagai",
        "millet idiyappam",
        "sprouted sorghum string hoppers",
        "kongu santhagai",
        "natural farming breakfast",
        "priya sivaprakasam",
        "thaayppaal pola santhagai",
        "sweet and savory idiyappam",
        "coconut milk idiyappam",
        "chef deena santhagai",
        "millet string hoppers",
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
          title: { en: "Preparing the Santhagai Dough", ta: "சந்தகை மாவு தயாரித்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "If the rice flour and sprouted sorghum powder aren't pre-roasted, dry-roast each lightly in a wide pan on a LOW flame for 2-3 minutes until they smell faintly nutty. Don't brown them. Let cool slightly.",
                ta: "அரிசி மாவு மற்றும் முளைகட்டிய சோள மாவு முன் வறுத்தது இல்லை என்றால், ஒரு பெரிய கடாயில் குறைந்த தீயில் 2-3 நிமிடம் தனித்தனியாக லேசாக வறுக்கவும் — லேசான வாசனை வரும் வரை மட்டும். கருகாமல் இருக்க வேண்டும். சற்று ஆற விடவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "In a large mixing bowl, combine the 5 cups of rice flour and 2 cups of sprouted sorghum flour. Mix well so they're uniformly blended.",
                ta: "ஒரு பெரிய பாத்திரத்தில், 5 கப் அரிசி மாவு மற்றும் 2 கப் முளைகட்டிய சோள மாவை சேர்க்கவும். சீராக கலக்க நன்கு கலக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Boil water in a separate pot with a little crystal salt. Gradually pour the HOT water into the mixed flours, stirring continuously with a wooden spoon. Keep adding hot water and stirring until the mixture comes together into a SOFT, smooth, pliable dough — like a soft chapathi dough.",
                ta: "ஒரு தனி பாத்திரத்தில் சிறிது கல் உப்பு சேர்த்து தண்ணீரை கொதிக்க விடவும். கலந்த மாவுகளில் சூடான தண்ணீரை மெதுவாக ஊற்றி, ஒரு மரம் கரண்டியால் தொடர்ந்து கிளறவும். மென்மையான, மிருதுவான, எளிதில் வளையக்கூடிய மாவாக மாறும் வரை — சப்பாத்தி மாவு போல — சூடான தண்ணீர் ஊற்றி கிளறி கொண்டே இருக்கவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "While the dough is still WARM (it won't press easily once cold), pinch off portions and shape them into smooth cylinders that fit your santhagai (idiyappam) press. Load each cylinder into a traditional wooden press.",
                ta: "மாவு இன்னும் சூடாக இருக்கும் போதே (குளிர்ந்தால் அழுத்த முடியாது), சிறிய பகுதிகளாக எடுத்து, உங்கள் சந்தகை (இடியாப்ப) அச்சில் பொருந்தும் வடிவத்தில் உருண்டையாக சுருட்டவும். ஒவ்வொரு உருண்டையையும் பாரம்பரிய மர அச்சில் சேர்க்கவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Lightly grease idli plates or a steamer basket with a few drops of oil. Press the dough firmly through the santhagai press, making thin, delicate string-hopper nests directly onto the greased surface.",
                ta: "இட்லி தட்டுகள் அல்லது ஆவி பாத்திரத்தை சில துளி எண்ணெயால் லேசாக கிரீஸ் செய்யவும். மாவை சந்தகை அச்சு வழியாக இறுக்கமாக அழுத்தி, கிரீஸ் செய்யப்பட்ட மேற்பரப்பில் நேரடியாக மெல்லிய, மென்மையான இடியாப்ப கூடுகளாக அழுத்தவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Steam for 7 to 10 minutes until the hoppers are fully cooked, soft, and no longer sticky to the touch. Let them cool slightly before handling — they tear when too hot.",
                ta: "7 முதல் 10 நிமிடம் வரை ஆவியில் வேக வைக்கவும் — இடியாப்பம் முற்றிலும் வெந்து, மென்மையாகி, தொடவே ஒட்டாமல் இருக்க வேண்டும். கையாள்வதற்கு முன் சற்று ஆற விடவும் — அதிக சூட்டில் கிழியும்.",
              },
            },
          ],
        },
        {
          type: "tempering",
          title: { en: "The Savory Karam Preparation", ta: "காரத் தாளிப்பு" },
          steps: [
            {
              step: 7,
              description: {
                en: "Heat 1 tablespoon of COCONUT OIL in a wide pan or kadai. Don't substitute with another oil — coconut oil is what gives this dish its authentic Kongu aroma.",
                ta: "ஒரு பெரிய கடாயில் 1 ஸ்பூன் தேங்காய் எண்ணெய் சூடாக்கவும். வேறு எண்ணெய் பயன்படுத்த வேண்டாம் — தேங்காய் எண்ணெய்தான் இந்த உணவுக்கு உரிய அசலான கொங்கு வாசனையை தருகிறது.",
              },
            },
            {
              step: 8,
              description: {
                en: "Add the 1 tsp of mustard seeds and let them splutter completely.",
                ta: "1 ஸ்பூன் கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Add the 1 tsp of Bengal gram (chana dal / kadalai paruppu) and 1 tsp of urad dal. Roast on medium heat, stirring often, until both dals turn a crisp golden brown and release a nutty aroma — about 1-2 minutes.",
                ta: "1 ஸ்பூன் கடலை பருப்பு மற்றும் 1 ஸ்பூன் உளுந்து சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, இரண்டு பருப்புகளும் மொறுமொறுப்பான பொன்னிற பழுப்பாகி, இனிய வாசனை வரும் வரை — சுமார் 1-2 நிமிடம் — வறுக்கவும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Toss in a generous pinch of asafoetida, 2 sprigs of curry leaves, and the 2 slit green chillies. Let them crackle for 15-20 seconds.",
                ta: "ஒரு கைப்பிடி பெருங்காயம், 2 கருவேப்பிலை குச்சிகள், மற்றும் 2 கீறிய பச்சை மிளகாயை சேர்க்கவும். 15-20 விநாடிகள் சீறி வெடிக்க விடவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the FULL 30 finely chopped small onions. Sauté patiently on a medium flame, stirring often, until they turn soft, translucent, and slightly sweet — about 6-8 minutes. The onions are the main flavour of the savory version, so don't rush.",
                ta: "முழு 30 நன்கு நறுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, மிருதுவாகி, பளபளப்பாகி, லேசான இனிமை வரும் வரை — சுமார் 6-8 நிமிடம் — பொறுமையாக வதக்கவும். கார பதிப்பின் முக்கிய சுவை வெங்காயம், எனவே அவசரப்பட வேண்டாம்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add the ½ tsp turmeric powder and a little salt to taste. Mix well — the bright yellow colour will spread through the oil.",
                ta: "½ ஸ்பூன் மஞ்சள் தூள் மற்றும் தேவையான கல் உப்பு சேர்த்து நன்கு கலக்கவும் — பளபளக்கும் மஞ்சள் நிறம் எண்ணெயில் பரவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Take HALF of the steamed Chola Santhagai and gently crumble it directly into the pan with your fingertips — break the string hoppers into bite-sized pieces but DON'T mash them. Toss delicately, lifting and turning with two spoons, so every strand soaks up the turmeric-onion-coconut oil tempering. About 1-2 minutes of gentle tossing.",
                ta: "வேக வைத்த சோள சந்தகையில் பாதியை எடுத்து, விரல் நுனிகளால் நேரடியாக பாத்திரத்தில் மெதுவாக உடைக்கவும் — இடியாப்பத்தை கடிக்கும் அளவு துண்டுகளாக மட்டுமே உடைக்கவும், மசிக்க வேண்டாம். இரண்டு கரண்டிகளால் தூக்கி திருப்பி மெதுவாக புரட்டவும், ஒவ்வொரு கம்பியும் மஞ்சள்-வெங்காயம்-தேங்காய் எண்ணெய் தாளிப்பை உள்ளீர்க்கும். சுமார் 1-2 நிமிடம் மெதுவாக புரட்டவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Sweet Inippu Preparation", ta: "இனிப்பு தயாரிப்பு" },
          steps: [
            {
              step: 14,
              description: {
                en: "Crack open the 2 coconuts. Grate the flesh and extract THICK first-press coconut milk — squeeze the grated coconut by hand with a small amount of warm water through a clean cotton cloth. This first-press 'thick milk' is what you want for the sweet version, not store-bought thin milk.",
                ta: "2 தேங்காயை உடைக்கவும். தேங்காய் சதையை துருவி, கெட்டியான முதல்-பிழியல் தேங்காய் பாலை எடுக்கவும் — துருவிய தேங்காயை சிறிதளவு சூடான தண்ணீருடன் ஒரு சுத்தமான பருத்தி துணி வழியாக கையால் பிழியவும். இனிப்பு பதிப்புக்கு இந்த முதல்-பிழியல் 'கெட்டியான பால்' தான் தேவை, கடையில் வாங்கிய மெல்லிய பால் அல்ல.",
              },
            },
            {
              step: 15,
              description: {
                en: "Dissolve jaggery into the thick coconut milk to your preferred sweetness (start with about a fist-sized piece for each coconut). Stir gently until completely dissolved. If the jaggery has impurities, filter the sweetened milk through a fine sieve.",
                ta: "கெட்டியான தேங்காய் பாலில் வெல்லத்தை நீங்கள் விரும்பும் இனிப்புக்கு கரைக்கவும் (ஒவ்வொரு தேங்காய்க்கும் ஒரு கைப்பிடி அளவில் ஆரம்பிக்கவும்). முற்றிலும் கரையும் வரை மெதுவாக கிளறவும். வெல்லத்தில் அழுக்கு இருந்தால், இனிப்பான பாலை மெல்லிய சல்லடை வழியாக வடிக்கவும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Crush the 4 cardamom pods to release the inner seeds. Add the freshly crushed cardamom powder to the sweet coconut milk and mix well. The aroma should be intoxicating.",
                ta: "4 ஏலக்காயை நசுக்கி உள் விதைகளை வெளியேற்றவும். புதிதாக நசுக்கிய ஏலக்காய் தூளை இனிப்பு தேங்காய் பாலில் சேர்த்து நன்கு கலக்கவும். வாசனை மயக்கும் அளவில் இருக்க வேண்டும்.",
              },
            },
          ],
        },
        {
          type: "serving",
          title: { en: "Serving the Sweet + Savory Pair", ta: "இனிப்பு + காரம் இணை பரிமாறுதல்" },
          steps: [
            {
              step: 17,
              description: {
                en: "Plate the SAVORY (karam) santhagai on one side of a banana leaf or wide plate — golden yellow, with visible shallot pieces and curry leaves crackling through.",
                ta: "கார (காரம்) சந்தகையை வாழை இலை அல்லது பெரிய தட்டின் ஒரு பக்கத்தில் பரிமாறவும் — பொன்னிற மஞ்சள், காணக்கூடிய சின்ன வெங்காய துண்டுகள் மற்றும் கருவேப்பிலையுடன்.",
              },
            },
            {
              step: 18,
              description: {
                en: "On the OTHER side of the same plate, place the remaining plain steamed Chola Santhagai in a deep bowl. Generously DROWN it in the sweet, fragrant cardamom-jaggery coconut milk so the hoppers float and slowly absorb the milk.",
                ta: "அதே தட்டின் மறுபக்கம், மீதமுள்ள வெறும் வேகவைத்த சோள சந்தகையை ஒரு ஆழமான பாத்திரத்தில் வைக்கவும். இனிப்பு, வாசனை மிக்க ஏலக்காய்-வெல்ல தேங்காய் பாலில் தாராளமாக மூழ்கடிக்கவும் — இடியாப்பம் மிதந்து மெதுவாக பாலை உள்ளீர்க்கும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Serve immediately. Eat by alternating between mouthfuls — a savory bite of the shallot-tempered side followed by a sweet bite of the jaggery-coconut-milk-soaked side. The Kongu way: the sweet cools, the savory awakens; together they make a complete organic breakfast that the body absorbs effortlessly.",
                ta: "உடனடியாக பரிமாறவும். ஒவ்வொரு கடியிலும் மாறி மாறி சாப்பிடவும் — சின்ன வெங்காய தாளிப்பு பக்கத்தின் கார கடிக்கு பின் வெல்ல-தேங்காய்-பால் ஊறவைத்த பக்கத்தின் இனிப்பு கடி. கொங்கு வழி: இனிப்பு குளிர்விக்கிறது, காரம் எழுப்புகிறது; சேர்ந்து உடல் சிரமமின்றி உள்ளீர்க்கும் ஒரு முழுமையான ஆர்கானிக் காலை உணவாக மாறுகிறது.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Chola Santhagai recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
