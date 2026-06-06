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
  { slug: "toor-dal", name: "Toor Dal (Thuvaram Paruppu)", ta: "துவரம் பருப்பு", quantity: "1", unit: "cup" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots, finely chopped)", ta: "சின்ன வெங்காயம் (நன்கு நறுக்கியது)", quantity: "20", unit: "nos" },
  { slug: "tomato", name: "Tomato (finely chopped)", ta: "தக்காளி (நன்கு நறுக்கியது)", quantity: "2", unit: "nos" },
  { slug: "dry-red-chillies", name: "Dry Red Chillies (torn into small pieces)", ta: "காய்ந்த மிளகாய் (சிறு துண்டுகளாக)", quantity: "6", unit: "nos" },
  { slug: "green-chilli", name: "Green Chilli (slit, optional)", ta: "பச்சை மிளகாய் (கீறியது, விருப்பம்)", quantity: "2", unit: "nos" },
  { slug: "tamarind", name: "Tamarind (VERY small piece, less than half of sambar amount)", ta: "புளி (மிக சிறிய துண்டு, சாம்பாரின் பாதியில் குறைவாக)", quantity: "1", unit: "very small piece" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful" },
  { slug: "groundnut-oil", name: "Groundnut Oil (or refined oil) — for tempering", ta: "கடலை எண்ணெய் (அல்லது சுத்திகரிக்கப்பட்ட எண்ணெய்) — தாளிப்புக்கு", quantity: "2-3", unit: "tbsp" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { slug: "coriander-leaves", name: "Coriander Leaves (optional garnish)", ta: "கொத்தமல்லி (விருப்ப அலங்காரம்)", quantity: "1", unit: "small handful" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "thottathu-virundhu-porichi-kotuna-paruppu-kuzhambu";
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
        en: "Thottathu Virundhu Porichi Kotuna Paruppu Kuzhambu (Fried & Poured Dal Gravy)",
        ta: "தோட்டத்து விருந்து பொரிச்சி கொட்டின பருப்பு குழம்பு",
      },
      slug,
      description: {
        en: "A rustic 4-ingredient comfort dal gravy from Kavithamani Akka at Thottathu Virundhu (Erode) — NOT on the restaurant's menu, this is a home-only dish they cook for their own family. The name literally means 'Fried and Poured': plain toor dal is pressure-cooked on one burner while a spicy-tangy onion-tomato-tamarind tempering is built on the other; the hot tempering is then POURED straight into the cooked dal in one move. No sambar powder, no chopped vegetables, no complicated grinding. All the color, heat and flavor come from the rustic tempering of dry red chillies + small onions. Famous as the absolute lifesaver when you need a comforting vegetarian meal in minutes, or a quick side for veg guests while focusing on complex non-veg cooking. The crucial 'less-than-half' tamarind rule keeps it gently tangy, never sour like sambar.",
        ta: "ஈரோடு தோட்டத்து விருந்தின் கவிதாமணி அக்காவின் கிராமத்து 4-பொருள் ஆறுதல் பருப்பு குழம்பு — கடையின் மெனுவில் இல்லை, தங்கள் சொந்த குடும்பத்துக்காக மட்டுமே வீட்டில் செய்யும் உணவு. பெயரின் அர்த்தம்: 'பொரிச்சு கொட்டினது' — ஒரு அடுப்பில் சாதாரண துவரம் பருப்பு வேகவைக்கப்படும், மற்றொரு அடுப்பில் காரமான-புளிப்பான வெங்காயம்-தக்காளி-புளி தாளிப்பு தயாரிக்கப்படும்; பின் சூடான தாளிப்பு வேக வைத்த பருப்பில் ஒரே முறையில் கொட்டப்படும். சாம்பார் தூள் இல்லை, காய்கறி நறுக்க தேவையில்லை, சிக்கலான அரைப்பு இல்லை. முழு நிறம், காரம், சுவை — வெறும் காய்ந்த மிளகாய் + சின்ன வெங்காய தாளிப்பிலிருந்தே வருகிறது. சைவ விருந்தினர்களுக்கு வேகமாக ஒரு ஆறுதல் உணவு தேவையானால், அல்லது சிக்கலான அசைவம் சமைக்கும் போது சைவ பக்கம் வேண்டுமானால் — இதுவே வாழ்வை காப்பாற்றும் உணவு. கட்டாய 'பாதிக்கு குறைவு' புளி விதி — இதை சாம்பார் போல புளிக்கவிடாமல், லேசான பின்னணி புளிப்பாக மட்டுமே வைக்கிறது.",
      },
      speciality: {
        en: "Five Thottathu Virundhu signatures define this dish: (1) The 4-Ingredient Lifesaver — 'Nalu porula vachu narukkunnu oru kuzhambu'; built on just 4 main ingredients (toor dal, small onions, tomatoes, dry red chillies). The dish you make when you have no time, no plan, and no patience. (2) Zero Sambar Powder, Zero Veggies — unlike traditional sambar that needs ground sambar powder + an array of chopped vegetables, this dish needs neither; the tempering alone carries everything. (3) The 'Porichi Kotuna' Streamlined Workflow — TWO BURNERS used in parallel; dal cooks on one burner, tempering builds on the other; the moment both are ready, you pour the entire hot tempering directly into the dal and you're done. Total time = whichever burner finishes last. (4) The Crucial Tamarind Rule — use LESS THAN HALF the tamarind you would normally use for sambar. The tamarind should provide a subtle background tang, not a sour bite. Over-tamarinding will make it taste like a failed sambar. (5) The 'Home-Only' Secret — Kavithamani Akka does NOT serve this at the restaurant; it's their household comfort food. Built for kitchen reality, not restaurant theatre.",
        ta: "தோட்டத்து விருந்தின் ஐந்து தனிச்சிறப்புகள்: (1) 4-பொருள் வாழ்வு-காப்பாளர் — 'நாலு பொருள வச்சு நருக்குனு ஒரு குழம்பு'; வெறும் 4 முக்கிய பொருட்களில் (துவரம் பருப்பு, சின்ன வெங்காயம், தக்காளி, காய்ந்த மிளகாய்) கட்டப்பட்டது. நேரம் இல்லாத, திட்டம் இல்லாத, பொறுமை இல்லாத நேரத்தில் செய்யும் உணவு. (2) சாம்பார் தூள் இல்லை, காய்கறி இல்லை — பாரம்பரிய சாம்பாருக்கு சாம்பார் தூள் + பல காய்கறிகள் தேவை, ஆனால் இந்த உணவுக்கு இரண்டுமே வேண்டாம்; தாளிப்பு மட்டுமே முழு சுவையையும் தாங்குகிறது. (3) 'பொரிச்சி கொட்டினது' எளிமை — இரண்டு அடுப்புகள் ஒரே நேரத்தில்; ஒன்றில் பருப்பு, மற்றொன்றில் தாளிப்பு; இரண்டும் தயாரானவுடன், சூடான தாளிப்பை பருப்பில் நேரடியாக ஊற்றினால் முடிந்தது. மொத்த நேரம் = எந்த அடுப்பு கடைசியில் முடிக்கிறதோ அந்த நேரம். (4) கட்டாய புளி விதி — சாம்பாருக்கு வழக்கமாக சேர்க்கும் புளியின் பாதிக்கு குறைவாக மட்டுமே சேர்க்கவும். புளி ஒரு சூட்சும பின்னணி புளிப்பாக மட்டுமே இருக்க வேண்டும், கடித்து சுவைக்கக்கூடாது. அதிக புளி சேர்த்தால் தோல்வியடைந்த சாம்பாராக மாறிவிடும். (5) 'வீடு மட்டும்' ரகசியம் — கவிதாமணி அக்கா இதை கடையில் பரிமாறுவதில்லை; இது தங்கள் வீட்டின் ஆறுதல் உணவு. சமையலறை யதார்த்தத்துக்காக கட்டப்பட்டது, கடை நாடகத்துக்காக அல்ல.",
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
        "gravy",
        "kuzhambu",
        "paruppu-kuzhambu",
        "dal-gravy",
        "porichi-kotuna",
        "no-sambar-powder",
        "no-vegetables",
        "minimal-ingredients",
        "4-ingredient",
        "quick-recipe",
        "weeknight",
        "comfort-food",
        "home-style",
        "rustic",
        "erode",
        "kongu",
        "tamil-nadu",
        "thottathu-virundhu",
        "kavithamani-akka",
        "guest-friendly",
      ],
      searchKeywords: [
        "porichi kotuna paruppu",
        "porichi kotuna kuzhambu",
        "fried and poured dal",
        "paruppu kuzhambu",
        "பொரிச்சி கொட்டின பருப்பு",
        "பருப்பு குழம்பு",
        "no sambar powder dal",
        "thottathu virundhu paruppu",
        "kavithamani akka paruppu",
        "quick dal gravy",
        "4 ingredient dal",
        "home style paruppu kuzhambu",
        "kongu dal",
        "chef deena paruppu kuzhambu",
        "shallot dal gravy",
        "easy weeknight dal",
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
          title: { en: "Two-Burner Setup", ta: "இரண்டு அடுப்பு தயாரிப்பு" },
          steps: [
            {
              step: 1,
              description: {
                en: "Set up two burners in parallel for this recipe. One burner will pressure-cook the toor dal; the other will build the porichi (tempering). Running them in parallel is the entire reason this dish is a 'lifesaver' — both finish at roughly the same time.",
                ta: "இந்த உணவுக்கு இரண்டு அடுப்புகளை ஒரே நேரத்தில் பயன்படுத்தவும். ஒரு அடுப்பில் துவரம் பருப்பு குக்கரில் வேகும்; மற்றொன்றில் பொரிச்சி (தாளிப்பு) தயாராகும். இரண்டையும் இணையாக இயக்குவதே — இந்த உணவை 'வாழ்வு-காப்பாளர்' ஆக்குகிறது; இரண்டும் ஏறக்குறைய ஒரே நேரத்தில் முடிந்துவிடும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Peel the 20 small onions and finely chop them. Finely chop the 2 tomatoes. Tear the 6 dry red chillies into small pieces (don't deseed — the heat is needed here). Slit the 2 green chillies (optional). Soak the VERY small piece of tamarind (less than half of sambar quantity) in warm water for 5 minutes and extract a light, diluted juice.",
                ta: "20 சின்ன வெங்காயத்தை தோல் சீவி நன்கு நறுக்கவும். 2 தக்காளியை நன்கு நறுக்கவும். 6 காய்ந்த மிளகாயை சிறு துண்டுகளாக கிழிக்கவும் (விதை நீக்க வேண்டாம் — காரம் இங்கு தேவை). 2 பச்சை மிளகாயை கீறவும் (விருப்பம்). மிக சிறிய புளியை (சாம்பாரின் பாதிக்கு குறைவு) சூடான தண்ணீரில் 5 நிமிடம் ஊறவைத்து, லேசான, நீர்த்த சாற்றை எடுக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Boiling the Dal (Burner 1)", ta: "பருப்பு வேக வைத்தல் (1வது அடுப்பு)" },
          steps: [
            {
              step: 3,
              description: {
                en: "Wash the 1 cup of toor dal thoroughly under running water 2-3 times until the water runs clear.",
                ta: "1 கப் துவரம் பருப்பை ஓடும் தண்ணீரில் 2-3 முறை, தண்ணீர் தெளிவாகும் வரை நன்கு கழுவவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Place the washed dal in a pressure cooker. Add enough water to submerge it (roughly 2.5-3 cups of water for 1 cup of dal) along with the ½ tsp of turmeric powder.",
                ta: "கழுவிய பருப்பை குக்கரில் சேர்க்கவும். மூழ்கும் அளவு தண்ணீர் (1 கப் பருப்புக்கு சுமார் 2.5-3 கப் தண்ணீர்) மற்றும் ½ ஸ்பூன் மஞ்சள் தூள் சேர்க்கவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Pressure-cook on medium-high heat for 3-4 whistles, or until the dal is COMPLETELY soft and mushy. Don't undercook — the dal must be soft enough to mash with the back of a ladle. While this is cooking, immediately move to the second burner and start the porichi step in parallel.",
                ta: "மிதமான-உயர் தீயில், பருப்பு முற்றிலும் மிருதுவாகி குழைய — 3-4 விசில் வரை குக்கரில் வேக விடவும். குறைவாக வேக விட வேண்டாம் — கரண்டியின் பின்புறம் கொண்டு மசிக்க முடியும் அளவுக்கு மிருதுவாக இருக்க வேண்டும். இது வேகும்போதே, உடனடியாக இரண்டாவது அடுப்புக்கு சென்று இணையாக பொரிச்சி படியை ஆரம்பிக்கவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Once the pressure releases naturally, open the cooker, mash the dal gently with the back of a ladle until smooth but with some texture (not paste). Set aside in the cooker itself.",
                ta: "காற்று தானாக வெளியேறிய பின், குக்கரை திறக்கவும். பருப்பை கரண்டியின் பின்புறம் கொண்டு மிருதுவாக, ஆனால் சற்று பதம் இருக்க (விழுது அல்ல) மசிக்கவும். குக்கரிலேயே வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Porichi (Sauté & Tempering — Burner 2)", ta: "பொரிச்சி (தாளிப்பு — 2வது அடுப்பு)" },
          steps: [
            {
              step: 7,
              description: {
                en: "On the second burner, heat a heavy-bottomed pan or kadai over medium-high heat. Pour in the 2-3 tablespoons of groundnut oil (or refined oil).",
                ta: "இரண்டாவது அடுப்பில், ஒரு தடிமனான பாத்திரத்தை மிதமான-உயர் தீயில் சூடாக்கவும். 2-3 ஸ்பூன் கடலை எண்ணெய் (அல்லது சுத்திகரிக்கப்பட்ட எண்ணெய்) ஊற்றவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Once the oil is hot, add the 1 tsp of mustard seeds and let them splutter completely.",
                ta: "எண்ணெய் சூடாகும் போது, 1 ஸ்பூன் கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Add the torn dry red chillies (and the optional slit green chillies) along with the generous handful of curry leaves. Let them roast briefly for 20-30 seconds in the hot oil — chillies should puff and curry leaves should crackle and crisp up.",
                ta: "கிழித்த காய்ந்த மிளகாய் (மற்றும் விருப்ப கீறிய பச்சை மிளகாய்) ஐ ஒரு கைப்பிடி கருவேப்பிலையுடன் சேர்க்கவும். சூடான எண்ணெயில் 20-30 விநாடிகள் வறுபட விடவும் — மிளகாய் பருத்து, கருவேப்பிலை சீறி மொறுமொறுப்பாக மாற வேண்டும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Toss in the 20 finely chopped small onions. Sauté patiently on medium flame, stirring often, until the onions turn translucent, soft and slightly golden — about 6-8 minutes. Don't rush; the depth of the entire dish lives here.",
                ta: "20 நன்கு நறுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, பளபளப்பாகி, மிருதுவாகி, லேசான பொன்னிறம் வரும் வரை — சுமார் 6-8 நிமிடம் — பொறுமையாக வதக்கவும். அவசரப்பட வேண்டாம்; முழு உணவின் சுவை ஆழமும் இங்கேதான் வாழ்கிறது.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the 2 finely chopped tomatoes and crystal salt to taste. Sauté continuously until the tomatoes completely break down, mash into the onions, and the mixture forms a soft, glossy paste — about 4-6 minutes.",
                ta: "2 நன்கு நறுக்கிய தக்காளி மற்றும் தேவையான கல் உப்பு சேர்க்கவும். தக்காளி முற்றிலும் குழைந்து, வெங்காயத்துடன் கலந்து, கலவை மிருதுவான, பளபளக்கும் விழுதாக மாறும் வரை — சுமார் 4-6 நிமிடம் — தொடர்ந்து வதக்கவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Pour the LIGHT, diluted tamarind extract into the onion-tomato mixture. Critical reminder: this should be much weaker than the tamarind in sambar — the tamarind is here only for a gentle background tang, not for sourness.",
                ta: "லேசான, நீர்த்த புளிக்கரைசலை வெங்காயம்-தக்காளி கலவையில் ஊற்றவும். கட்டாய எச்சரிக்கை: இது சாம்பாருக்கான புளியை விட மிக குறைவாக இருக்க வேண்டும் — இங்கு புளி பின்னணி புளிப்புக்காக மட்டுமே, புளிப்பு சுவைக்காக அல்ல.",
              },
            },
            {
              step: 13,
              description: {
                en: "Let the tempering simmer vigorously for 2-3 minutes until the raw, sharp smell of the tamarind completely disappears. The tempering is now ready.",
                ta: "தாளிப்பை 2-3 நிமிடம் நன்கு கொதிக்க விடவும் — புளியின் பச்சை கடுமையான வாசனை முற்றிலும் போக வேண்டும். தாளிப்பு இப்போது தயார்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Kotuna (Pour & Final Mix)", ta: "கொட்டினது (ஊற்றி கலத்தல்)" },
          steps: [
            {
              step: 14,
              description: {
                en: "The signature move: take the pan with the hot, spicy, bubbling porichi and POUR (kotuna) the entire mixture directly into the cooker with the mashed boiled dal. Do it in one motion — that's where the name comes from.",
                ta: "தனிச்சிறப்பு நகர்வு: சூடான, காரமான, கொதிக்கும் பொரிச்சியை எடுத்து, மசித்த வேகவைத்த பருப்பு உள்ள குக்கரில் ஒரே நகர்வில் ஊற்றவும் (கொட்டினது) — பெயர் வந்த படி அதே.",
              },
            },
            {
              step: 15,
              description: {
                en: "Mix everything thoroughly with a ladle so the spicy tempering blends evenly into the soft dal. If the gravy feels too thick at this point, add a splash of hot water to adjust — it should be a pourable kuzhambu consistency, not a thick paste.",
                ta: "காரமான தாளிப்பு மிருதுவான பருப்பில் சீராக கலக்கும்படி, கரண்டியால் நன்கு கலக்கவும். இந்த நேரத்தில் குழம்பு மிக கெட்டியாக இருந்தால், சிறிது சூடான தண்ணீர் சேர்த்து சரிசெய்யவும் — இது ஊற்றக்கூடிய குழம்பு பதம், கெட்டியான விழுது அல்ல.",
              },
            },
            {
              step: 16,
              description: {
                en: "Let the combined dal and tempering come to a gentle simmer for just 2-3 minutes — this is the 'marriage' step where the flavors fully integrate. Don't over-boil now; you'll dull the bright temper aromas.",
                ta: "சேர்ந்த பருப்பு மற்றும் தாளிப்பை, மிதமான கொதிநிலையில் வெறும் 2-3 நிமிடம் வேக விடவும் — இது சுவைகள் முழுமையாக ஒன்றிணையும் 'திருமண' படி. இப்போது அதிகம் கொதிக்க வேண்டாம்; தாளிப்பின் புதிய வாசனைகள் மங்கிவிடும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Turn off the heat. Taste and adjust salt if needed. Optionally garnish with a small handful of freshly chopped coriander leaves.",
                ta: "அடுப்பை அணைக்கவும். உப்பை சுவைத்து சரிபார்த்து சரிசெய்யவும். விருப்பத்திற்கு, ஒரு சிறு கைப்பிடி புதிய நறுக்கிய கொத்தமல்லியை தூவவும்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Serve this incredibly comforting, 4-ingredient Porichi Kotuna Paruppu hot — three ways: (a) over steamed white rice with a dollop of ghee on top (the classic); (b) scooped up with soft idlies or crispy dosas; (c) as a side gravy with chapathis or parottas. Equally good cold the next day with cold rice for an even tangier flavor.",
                ta: "இந்த அற்புதமான, 4-பொருள் பொரிச்சி கொட்டின பருப்பை மூன்று வழிகளில் சூடாக பரிமாறவும்: (அ) சூடான வெள்ளை சாதத்தில் ஒரு ஸ்பூன் நெய் சேர்த்து (கிளாசிக் சேர்க்கை); (ஆ) மென்மையான இட்லி அல்லது மொறுமொறுப்பான தோசையுடன்; (இ) சப்பாத்தி அல்லது பரோட்டாவுக்கு சைடு குழம்பாக. மறுநாள் குளிர்ந்த சாதத்துடன் குளிர்ந்தாலும், இன்னும் ருசியான புளிப்புடன் சிறப்பாக சுவைக்கும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Porichi Kotuna Paruppu Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
