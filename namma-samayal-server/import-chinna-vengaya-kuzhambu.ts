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
  // Base
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, whole)", ta: "சின்ன வெங்காயம் (முழுதாக)", quantity: "250-300", unit: "g" },
  { slug: "garlic", name: "Garlic (whole cloves)", ta: "பூண்டு (முழு பற்கள்)", quantity: "10-15", unit: "cloves" },
  { slug: "tomato", name: "Tomato (finely chopped)", ta: "தக்காளி (நன்கு நறுக்கியது)", quantity: "2", unit: "nos" },
  { slug: "tamarind", name: "Tamarind", ta: "புளி", quantity: "1", unit: "large lemon-sized ball" },
  { slug: "gingelly-oil-sesame-oil", name: "Gingelly Oil (Nallennai)", ta: "எள்ளெண்ணெய்", quantity: "4-5", unit: "tbsp" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "fenugreek-seeds", name: "Fenugreek Seeds (Vendhayam)", ta: "வெந்தயம்", quantity: "1/2", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful" },
  { slug: "jaggery", name: "Jaggery (Vellam, optional)", ta: "வெல்லம் (விருப்பத்திற்கு)", quantity: "1", unit: "tiny piece" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },

  // Fresh masala
  { slug: "coriander-seeds", name: "Coriander Seeds (for fresh masala)", ta: "கொத்தமல்லி விதை (மசாலாவுக்கு)", quantity: "2", unit: "tbsp" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies (for fresh masala)", ta: "காய்ந்த மிளகாய் (மசாலாவுக்கு)", quantity: "6-8", unit: "nos" },
  { slug: "cumin-seeds", name: "Cumin Seeds (for fresh masala)", ta: "சீரகம் (மசாலாவுக்கு)", quantity: "1", unit: "tsp" },
  { slug: "black-pepper", name: "Black Pepper (for fresh masala)", ta: "மிளகு (மசாலாவுக்கு)", quantity: "1/2", unit: "tsp" },
  { slug: "chana-dal", name: "Chana Dal (for fresh masala, natural thickener)", ta: "கடலை பருப்பு (மசாலாவுக்கு)", quantity: "1", unit: "tsp" },
  { slug: "urad-dal", name: "Urad Dal (for fresh masala, natural thickener)", ta: "உளுந்து (மசாலாவுக்கு)", quantity: "1", unit: "tsp" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "chinna-vengaya-kuzhambu";
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
        en: "Chinna Vengaya Kuzhambu (Small Onion / Shallot Tamarind Gravy)",
        ta: "சின்ன வெங்காய குழம்பு",
      },
      slug,
      description: {
        en: "A legendary South Indian tamarind gravy built entirely around whole shallots (chinna vengayam) kept un-chopped and slow-sautéed in gingelly oil until their outer layers caramelize. A freshly roasted spice blend (coriander seeds, dry red chillies, cumin, black pepper, plus chana and urad dal as natural thickeners) gives the gravy depth and body without any flour. Famous as 'Moonu Velaikkum Arumaiyana Kuzhambu' — the wonderful gravy that lasts all three meals: idli/dosa at breakfast, rice at lunch, and dosa/chapathi again at dinner. Actually tastes better as it ages (pazhasu).",
        ta: "சின்ன வெங்காயத்தை நறுக்காமல் முழுதாக வைத்து, எள்ளெண்ணெயில் வெளி அடுக்குகள் கருகும் வரை மெதுவாக வதக்கி செய்யப்படும் தமிழ் பாரம்பரிய புளி குழம்பு. கொத்தமல்லி விதை, காய்ந்த மிளகாய், சீரகம், மிளகு, இயற்கையான கெட்டியாக்கி கடலை மற்றும் உளுந்து கொண்ட புதிய வறுத்த மசாலா — மாவு இல்லாமலேயே குழம்புக்கு செழுமை தருகிறது. 'மூணு வேளைக்கும் அருமையான குழம்பு' என்று பெயர் — காலையில் இட்லி/தோசை, மதியம் சாதம், இரவில் தோசை/சப்பாத்தி அனைத்திற்கும் சிறப்பாக பொருந்தும். நேரம் ஆக ஆக ('பழசு') சுவை அதிகமாகும்.",
      },
      speciality: {
        en: "Four traditional rules define a true Chinna Vengaya Kuzhambu: (1) Shallots stay WHOLE, never chopped — chopping kills the slow-caramelized sweetness and the 'flavor-bomb' bite where each soft onion bursts in your mouth. (2) Gingelly oil is mandatory — it gives the gravy its glossy red finish and cools the body to counter the tamarind-and-chilli heat. (3) Fenugreek seeds (vendhayam) are the secret aroma — half a teaspoon, browned just shy of burning; they define the dish's signature scent. (4) The pazhasu (aged) effect — the gravy genuinely tastes better hours later as the shallots fully soak in the broth, which is why one morning batch covers all three meals.",
        ta: "உண்மையான சின்ன வெங்காய குழம்புக்கு நான்கு பாரம்பரிய விதிகள்: (1) சின்ன வெங்காயம் முழுதாகவே இருக்க வேண்டும், நறுக்க கூடாது — நறுக்கினால் மெதுவாக கருகி கிடைக்கும் இனிமையும், ஒவ்வொரு வெங்காயமும் வாயில் வெடிக்கும் 'சுவை குண்டு' அனுபவமும் இழக்கப்படும். (2) எள்ளெண்ணெய் கட்டாயம் — பளபளக்கும் சிவப்பு நிறமும், புளி-மிளகாய் வெப்பத்தை குளிர்விக்கும் தன்மையும் அதனால்தான் வரும். (3) வெந்தயம் ரகசிய வாசனை — அரை ஸ்பூன் வெந்தயத்தை கருகுவதற்கு சற்று முன் வரை பழுப்பாக்க வேண்டும்; அதுவே இந்த உணவின் தனிச்சிறப்பான வாசனை. (4) பழசு விளைவு — மணி நேரம் கடக்க கடக்க, வெங்காயம் சாற்றை முழுமையாக உள்ளீர்த்து, குழம்பின் சுவை அதிகமாகும்; அதனால்தான் காலையில் ஒரு பானை செய்தால் மூன்று வேளைக்கும் போதும்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
      },
      prepTime: 15,
      cookingTime: 30,
      totalTime: 45,
      servings: 5,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "veg",
        "vegan",
        "gravy",
        "kuzhambu",
        "vengaya-kuzhambu",
        "shallots",
        "small-onion",
        "tamarind",
        "puli-kuzhambu",
        "kongu",
        "tamil-nadu",
        "traditional",
        "all-meals",
        "moonu-velai",
        "pazhasu",
        "no-flour-thickener",
        "gingelly-oil",
      ],
      searchKeywords: [
        "chinna vengaya kuzhambu",
        "small onion kuzhambu",
        "shallot tamarind gravy",
        "சின்ன வெங்காய குழம்பு",
        "vengaya puli kuzhambu",
        "moonu velai kuzhambu",
        "all three meals kuzhambu",
        "pazhasu kuzhambu",
        "chef deena vengaya kuzhambu",
        "kongu shallot gravy",
        "kuzhambu milagai thool kuzhambu",
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
          title: { en: "Prep & Fresh Masala Roast", ta: "முன் தயாரிப்பு மற்றும் புதிய மசாலா வறுத்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Peel the 250-300g of small onions and KEEP THEM WHOLE — do not chop. Peel the 10-15 garlic cloves and keep them whole too. Finely chop the 2 tomatoes.",
                ta: "250-300 கிராம் சின்ன வெங்காயத்தை தோல் சீவி, முழுதாக வைக்கவும் — நறுக்க வேண்டாம். 10-15 பூண்டு பற்களையும் தோல் சீவி முழுதாக வைக்கவும். 2 தக்காளியை நன்கு நறுக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Soak the large lemon-sized ball of tamarind in warm water for 10-15 minutes. Squeeze well and extract a thick juice. Discard fibre and seeds. Set aside.",
                ta: "பெரிய எலுமிச்சை அளவு புளியை சூடான தண்ணீரில் 10-15 நிமிடம் ஊறவைக்கவும். நன்கு கசக்கி கெட்டியான புளிக்கரைசலை எடுக்கவும். நார் மற்றும் விதைகளை நீக்கி தனியாக வைக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Make the fresh masala: heat a dry pan on LOW flame. Add the 2 tbsp coriander seeds, 6-8 dry red chillies, 1 tsp cumin seeds, ½ tsp black pepper, 1 tsp chana dal and 1 tsp urad dal. Dry-roast patiently, stirring continuously, until the dals turn golden brown and the spices release a nutty aroma — about 4-6 minutes. Do NOT burn them; burnt masala turns the whole gravy bitter.",
                ta: "புதிய மசாலா தயாரித்தல்: ஒரு வரண்ட கடாயை குறைந்த தீயில் சூடாக்கவும். 2 ஸ்பூன் கொத்தமல்லி விதை, 6-8 காய்ந்த மிளகாய், 1 ஸ்பூன் சீரகம், ½ ஸ்பூன் மிளகு, 1 ஸ்பூன் கடலை பருப்பு மற்றும் 1 ஸ்பூன் உளுந்து சேர்க்கவும். தொடர்ந்து கிளறி, பருப்புகள் பொன்னிற பழுப்பாகி, மசாலா வாசனை வீசும் வரை — சுமார் 4-6 நிமிடம் — பொறுமையாக வறுக்கவும். கருக விட வேண்டாம்; கருகிய மசாலா முழு குழம்பையும் கசக்க வைக்கும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Spread the roasted spices on a plate and let them COMPLETELY cool to room temperature. Then grind them in a dry mixer to a fine powder. Set aside. (Alternatively, skip this whole step and use 3 tablespoons of homemade Kuzhambu Milagai Thool.)",
                ta: "வறுத்த மசாலாவை ஒரு தட்டில் பரப்பி, அறை வெப்பநிலை வரும் வரை முழுமையாக ஆற விடவும். பின் வரண்ட மிக்ஸியில் சேர்த்து மிருதுவான தூளாக அரைக்கவும். தனியாக வைக்கவும். (இந்த முழு படியையும் தவிர்த்து, வீட்டு குழம்பு மிளகாய் தூள் 3 ஸ்பூன் பயன்படுத்தலாம்.)",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Sautéing the Shallots", ta: "சின்ன வெங்காயம் வதக்கல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Heat a traditional clay pot (manchatti) or a heavy-bottomed kadai over medium heat. Pour in the 4-5 tablespoons of gingelly oil (nallennai) — be generous, this is what gives the gravy its glossy finish and cools the body.",
                ta: "ஒரு பாரம்பரிய மண்சட்டி அல்லது தடிமனான கடாயை மிதமான தீயில் சூடாக்கவும். 4-5 ஸ்பூன் எள்ளெண்ணெய் (நல்லெண்ணெய்) ஊற்றவும் — தாராளமாகவே ஊற்றவும், இதுதான் குழம்புக்கு பளபளக்கும் தோற்றமும், புளி-மிளகாய் வெப்பத்தை குளிர்விக்கும் தன்மையும் தருகிறது.",
              },
            },
            {
              step: 6,
              description: {
                en: "Once the oil is hot, add the mustard seeds and let them splutter completely. Then add the ½ tsp fenugreek seeds (vendhayam) and let them turn slightly golden — about 20-30 seconds. Watch them carefully: fenugreek must NOT burn (it turns black) or the gravy will be irreversibly bitter.",
                ta: "எண்ணெய் சூடாகும் போது, கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும். பின் ½ ஸ்பூன் வெந்தயம் சேர்த்து, லேசான பொன்னிறம் வரும் வரை — சுமார் 20-30 விநாடிகள் — விடவும். கவனமாக பாருங்கள்: வெந்தயம் கருக கூடாது (கருப்பாக மாறக்கூடாது), இல்லையென்றால் குழம்பு திருத்த முடியாமல் கசக்கும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Toss in the generous handful of curry leaves, immediately followed by the whole garlic cloves and the whole peeled small onions.",
                ta: "ஒரு கைப்பிடி கருவேப்பிலையை சேர்த்து, உடனே முழு பூண்டு பற்கள் மற்றும் தோல் சீவிய முழு சின்ன வெங்காயத்தை சேர்க்கவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Sauté patiently on medium heat for 5 to 7 minutes — the outer layers of the shallots should shrink slightly, turn translucent, and develop a beautiful golden-brown color. Don't rush this. This caramelization is what gives each shallot its sweet, juicy 'flavor-bomb' character later.",
                ta: "மிதமான தீயில் 5-7 நிமிடம் பொறுமையாக வதக்கவும் — சின்ன வெங்காயத்தின் வெளி அடுக்கு லேசாக சுருங்கி, பளபளப்பாகி, அழகான பழுப்பு பொன்னிறம் வர வேண்டும். அவசரப்பட வேண்டாம். இந்த கருகும் தன்மைதான், பின்னர் ஒவ்வொரு சின்ன வெங்காயத்துக்கும் சதைப்பற்றான, இனிப்பான 'சுவை குண்டு' பண்பை தருகிறது.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Building the Masala Base", ta: "மசாலா அடிப்படை கட்டமைத்தல்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Add the finely chopped tomatoes and crystal salt. Sauté continuously on medium heat until the tomatoes turn completely soft, mushy, and blend into the oil — about 4-6 minutes. No tomato chunks should remain.",
                ta: "நன்கு நறுக்கிய தக்காளி மற்றும் கல் உப்பு சேர்க்கவும். மிதமான தீயில், தக்காளி முற்றிலும் குழைந்து, மிருதுவாகி, எண்ணெயில் கலந்துவிடும் வரை — சுமார் 4-6 நிமிடம் — தொடர்ந்து வதக்கவும். தக்காளி துண்டுகள் இருக்கக்கூடாது.",
              },
            },
            {
              step: 10,
              description: {
                en: "Lower the heat slightly. Add the freshly ground spice powder (or 3 tbsp of Kuzhambu Milagai Thool). Sauté in the hot oil for just 1 minute until the raw smell fades and the oil starts separating at the edges. Critical: do not let the masala burn.",
                ta: "தீயை சற்று குறைக்கவும். புதிதாக அரைத்த மசாலா தூளை (அல்லது 3 ஸ்பூன் குழம்பு மிளகாய் தூள்) சேர்க்கவும். பச்சை வாசனை போய், ஓரத்தில் எண்ணெய் பிரிய ஆரம்பிக்கும் வரை சூடான எண்ணெயில் வெறும் 1 நிமிடம் வதக்கவும். மிக முக்கியம்: மசாலா கருக கூடாது.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Boiling the Kuzhambu", ta: "குழம்பு கொதிக்க வைத்தல்" },
          steps: [
            {
              step: 11,
              description: {
                en: "Pour the thick tamarind extract into the pan. Mix everything thoroughly so the masala dissolves evenly into the tamarind broth.",
                ta: "கெட்டியான புளிக்கரைசலை கடாயில் ஊற்றவும். மசாலா புளிக்கரைசலில் சீராக கலக்க, அனைத்தையும் நன்கு கலக்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add a little water to adjust the consistency. Vengaya Kuzhambu should be slightly thick and rich — NOT watery. Don't dilute too much, or the shallots won't soak up flavor properly.",
                ta: "பதத்தை சரிசெய்ய சிறிது தண்ணீர் சேர்க்கவும். வெங்காய குழம்பு சற்று கெட்டியாக, செழுமையாக இருக்க வேண்டும் — நீர்த்தாக இருக்க கூடாது. அதிகம் நீர்த்தினால், சின்ன வெங்காயம் சுவையை சரியாக உள்ளீர்க்காது.",
              },
            },
            {
              step: 13,
              description: {
                en: "Cover the pot and bring the gravy to a rolling boil on a medium flame.",
                ta: "பாத்திரத்தை மூடி, மிதமான தீயில் குழம்பு நன்கு கொதிக்க விடவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final Simmer", ta: "இறுதி கொதிநிலை" },
          steps: [
            {
              step: 14,
              description: {
                en: "Let the kuzhambu boil vigorously, uncovered or partially covered, for 10 to 15 minutes. Three things will happen: (a) the raw sharp smell of the tamarind will disappear, (b) the gravy will thicken, and (c) the gingelly oil will float beautifully to the surface as a glossy red layer. That floating oil is your visual 'done' signal.",
                ta: "மூடாமல் அல்லது பகுதி மூடியுடன், 10-15 நிமிடம் நன்கு கொதிக்க விடவும். மூன்று விஷயங்கள் நடக்கும்: (அ) புளியின் பச்சை கடுமையான வாசனை போகும், (ஆ) குழம்பு கெட்டியாகும், (இ) எள்ளெண்ணெய் மேலே பளபளக்கும் சிவப்பு அடுக்காக மிதக்கும். அந்த மிதக்கும் எண்ணெய்தான் 'தயார்' என்பதற்கான அடையாளம்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Taste the gravy. If the tamarind tang feels too sharp, drop a tiny piece of jaggery at the very end and stir until dissolved — it rounds out and balances the sourness without making the dish sweet. Taste again and adjust salt if needed.",
                ta: "குழம்பை சுவைக்கவும். புளி கடுமையாக இருந்தால், கடைசியில் ஒரு சிறு துண்டு வெல்லத்தை சேர்த்து கரையும் வரை கிளறவும் — இது உணவை இனிப்பாக்காமல், புளியை சமன் செய்து சுவையை கூட்டும். மீண்டும் சுவைத்து தேவையானால் உப்பை சரிசெய்யவும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Turn off the heat. Let the kuzhambu rest, covered, for at least 15-20 minutes before serving — like all tamarind gravies, the flavor deepens significantly during this rest, and the whole shallots start soaking up the broth.",
                ta: "அடுப்பை அணைக்கவும். பரிமாறும் முன் மூடி வைத்து குறைந்தது 15-20 நிமிடம் ஓய்வு கொடுக்கவும் — அனைத்து புளி குழம்புகளையும் போல, இந்த ஓய்வில் சுவை பல மடங்கு ஆழமாக மாறும், சின்ன வெங்காயம் சாற்றை உள்ளீர்க்க ஆரம்பிக்கும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Serve this gorgeous, tangy Chinna Vengaya Kuzhambu hot over steamed white rice with a drizzle of ghee, or scoop it up with soft idlies and crispy dosas. For best taste, save half the batch — by dinner (or the next morning), each shallot will have transformed into a soft, juicy flavor bomb, and you'll understand why this is called 'Moonu Velaikkum Arumaiyana Kuzhambu'.",
                ta: "இந்த அழகான, புளிப்பு சுவையுள்ள சின்ன வெங்காய குழம்பை சூடான வெள்ளை சாதம் மற்றும் சிறிது நெய்யுடன், அல்லது மென்மையான இட்லி, மொறுமொறுப்பான தோசையுடன் பரிமாறவும். சிறந்த சுவைக்கு பாதி குழம்பை சேமித்து வைக்கவும் — இரவு உணவுக்கு (அல்லது மறுநாள் காலையில்), ஒவ்வொரு சின்ன வெங்காயமும் சதைப்பற்றான, இனிப்பான, ருசி நிறைந்த 'சுவை குண்டாக' மாறியிருக்கும் — அப்போது புரியும், ஏன் இது 'மூணு வேளைக்கும் அருமையான குழம்பு' என்று அழைக்கப்படுகிறது.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Chinna Vengaya Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
