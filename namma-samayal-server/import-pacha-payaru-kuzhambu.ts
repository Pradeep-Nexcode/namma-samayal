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
  { slug: "green-moong-dal", name: "Green Moong Dal (Pacha Payaru)", ta: "பச்சை பயறு", quantity: "800-1000", unit: "g (1 padi)" },
  { slug: "tomato", name: "Tomato", ta: "தக்காளி", quantity: "7-8", unit: "nos" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "250", unit: "g" },
  { slug: "green-chilli", name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "20-25", unit: "nos" },
  { slug: "garlic", name: "Garlic", ta: "பூண்டு", quantity: "1", unit: "generous handful" },
  { slug: "cumin-seeds", name: "Cumin Seeds", ta: "சீரகம்", quantity: "1", unit: "tsp" },
  { slug: "coriander-seeds", name: "Coriander Seeds", ta: "கொத்தமல்லி விதை", quantity: "2", unit: "tsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "2", unit: "tsp" },
  { slug: "asafoetida-hing", name: "Asafoetida (Hing)", ta: "பெருங்காயம்", quantity: "1/4", unit: "tsp" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { slug: "coriander-leaves", name: "Coriander Leaves", ta: "கொத்தமல்லி", quantity: "1", unit: "handful" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "2", unit: "tbsp (for tempering)" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "kongu-pacha-payaru-kuzhambu";
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
        en: "Kongu Pacha Payaru Kuzhambu (Green Moong Dal Curry)",
        ta: "கொங்கு பச்சை பயறு குழம்பு",
      },
      slug,
      description: {
        en: "An authentic rustic Kongu-region dal curry built entirely from whole, fresh ingredients — zero pre-made masala powders. Green moong dal is boiled with whole green chillies, shallots, garlic, tomatoes and whole cumin + coriander seeds, then mashed traditionally with a wooden 'mathu' (kadaisal technique) to release its natural starches into a thick, creamy gravy. Famous in the Kongu belt as the stamina-builder behind 'Enga Kongu Makkalin Udal Balame' — the physical strength of Kongu farmers.",
        ta: "முழுமையான புதிய பொருட்களில் மட்டுமே செய்யப்படும் பாரம்பரிய கொங்கு நாட்டு பயறு குழம்பு — எந்த விதமான ஆயத்த மசாலா தூளும் இல்லை. பச்சை பயறு, முழு பச்சை மிளகாய், சின்ன வெங்காயம், பூண்டு, தக்காளி, முழு சீரகம் மற்றும் கொத்தமல்லி விதையுடன் சேர்த்து வேக வைத்து, பாரம்பரிய 'மத்து' கொண்டு 'கடைசல்' முறையில் மசிக்கப்படுகிறது. 'எங்க கொங்கு மக்களின் உடல் பலமே' என்று பிரபலமான ஊட்டச்சத்து குழம்பு.",
      },
      speciality: {
        en: "The 'Power House' of Kongu cuisine — pacha payaru is a stamina-building plant protein staple, historically fed to farmers doing heavy labor. Three traditional secrets define it: (1) zero masala powders — only fresh whole spices; (2) whole cumin and coriander seeds boiled directly with the dal infuse a deep earthy stock flavor; (3) the 'kadaisal' wooden-masher technique mashes dal + onion + tomato + chilli together to release natural starches into a creamy, rustic-textured gravy — never blender-smooth.",
        ta: "கொங்கு சமையலின் 'பவர் ஹவுஸ்' — பச்சை பயறு, விவசாயிகளுக்கு கடின உழைப்புக்கு தேவையான தாவர புரத ஆற்றல் தரும் முக்கிய உணவு. மூன்று பாரம்பரிய ரகசியங்கள்: (1) ஆயத்த மசாலா தூள் இல்லை — புதிய முழு மசாலாக்கள் மட்டுமே; (2) முழு சீரகம் மற்றும் கொத்தமல்லி விதையை பருப்புடன் சேர்த்து வேக வைப்பது ஆழமான மண் வாசனை ருசியை தருகிறது; (3) 'மத்து'வால் கடைசல் செய்யும் முறை — பயறு, வெங்காயம், தக்காளி, மிளகாய் அனைத்தையும் ஒன்றாக மசிக்க, இயற்கையான மாவுச்சத்து வெளியேறி கெட்டியான கிராமத்து பதம் வரும். மிக்ஸியில் அரைக்கக்கூடாது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
      },
      prepTime: 15,
      cookingTime: 45,
      totalTime: 60,
      servings: 8,
      difficulty: "easy",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=F7YqzJ0OLoE",
      },
      tags: [
        "veg",
        "vegan",
        "gravy",
        "kuzhambu",
        "dal",
        "moong-dal",
        "pacha-payaru",
        "green-moong",
        "kongu",
        "tamil-nadu",
        "traditional",
        "rustic",
        "no-masala-powder",
        "high-protein",
        "stamina-food",
        "kadaisal",
      ],
      searchKeywords: [
        "pacha payaru kuzhambu",
        "green moong dal curry",
        "பச்சை பயறு குழம்பு",
        "kongu kuzhambu",
        "moong dal kadaisal",
        "udal balame kuzhambu",
        "power house recipe",
        "chef deena pacha payaru",
        "kongu power food",
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
                en: "Wash the green moong dal (pacha payaru) thoroughly under running water 2-3 times to remove any dirt or husk fragments. Drain well.",
                ta: "பச்சை பயறை ஓடும் தண்ணீரில் 2-3 முறை நன்கு கழுவவும். தூசு, உமி அனைத்தும் நீங்க வேண்டும். தண்ணீரை வடிக்கவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Peel the small onions and keep them whole. Peel the garlic cloves. Roughly chop the tomatoes. Keep the green chillies whole (just snap off the stems).",
                ta: "சின்ன வெங்காயத்தை தோல் சீவி முழுதாக வைக்கவும். பூண்டை தோல் சீவவும். தக்காளியை பெரிய துண்டுகளாக நறுக்கவும். பச்சை மிளகாயின் காம்புகளை மட்டும் நீக்கி முழுதாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Boiling the Base", ta: "அடிக்கூட்டு வேக வைத்தல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "In a large traditional cooking vessel (or a large pressure cooker), add the washed green moong dal, the whole small onions, peeled garlic cloves, whole green chillies and chopped tomatoes.",
                ta: "ஒரு பெரிய பாரம்பரிய பாத்திரத்தில் (அல்லது பெரிய குக்கரில்), கழுவிய பச்சை பயறு, முழு சின்ன வெங்காயம், தோல் சீவிய பூண்டு, முழு பச்சை மிளகாய் மற்றும் நறுக்கிய தக்காளியை சேர்க்கவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Directly into this raw mixture, add the whole cumin seeds, the whole coriander seeds, the 2 tsp turmeric powder, and the ¼ tsp asafoetida. Chef's secret: boiling whole cumin and coriander seeds along with the dal (not pre-roasted powders) infuses a deeply rich, earthy flavor into the stock that roasted powders cannot give.",
                ta: "இந்த பச்சை கலவையில் நேரடியாக முழு சீரகம், முழு கொத்தமல்லி விதை, 2 ஸ்பூன் மஞ்சள் தூள் மற்றும் கால் ஸ்பூன் பெருங்காயம் சேர்க்கவும். சமையல் ரகசியம்: முன்பே வறுத்த தூளுக்கு பதிலாக முழு சீரகம் மற்றும் கொத்தமல்லி விதையை பருப்புடன் வேக வைப்பதால், வறுத்த தூள்களால் கொடுக்க முடியாத ஆழமான மண் வாசனை சாற்றில் இறங்கும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Dal", ta: "பயறு வேக வைத்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "Pour in plenty of water — enough to fully submerge everything with a few inches above. Place over a medium-high flame.",
                ta: "அனைத்தும் முழுகி, மேலே சில அங்குலம் இருக்கும் அளவுக்கு நிறைய தண்ணீர் ஊற்றவும். மிதமான-உயர் தீயில் வைக்கவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Let everything cook vigorously until the green moong dal is completely soft, splitting open, and mushy. In an open pot this takes 45-60 minutes; in a pressure cooker, cook for 5-6 whistles or until the dal is fully tender. Don't undercook — the dal must be soft enough to mash.",
                ta: "பச்சை பயறு முற்றிலும் மிருதுவாகி, பிளந்து, குழைந்து வரும் வரை நன்கு வேக விடவும். திறந்த பாத்திரத்தில் 45-60 நிமிடம்; குக்கரில் 5-6 விசில் அல்லது பயறு முழுமையாக மிருதுவாகும் வரை. மசிக்கும் அளவுக்கு வேக வேண்டியது அவசியம் — குறைவாக வேக விட வேண்டாம்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Traditional Mash (Kadaisal)", ta: "பாரம்பரிய கடைசல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "Once fully cooked, turn off the heat. Take a traditional wooden masher (mathu) — or any sturdy wooden churning stick — and vigorously mash the cooked dal, onions, tomatoes, garlic and chillies together directly inside the pot.",
                ta: "முழுமையாக வெந்த பின் அடுப்பை அணைக்கவும். பாரம்பரிய மரத்தினாலான மத்து — அல்லது வலுவான மர கடைசல் குச்சியை எடுத்து, பானையிலேயே வேகவைத்த பயறு, வெங்காயம், தக்காளி, பூண்டு மற்றும் மிளகாயை ஒன்றாக நன்கு மசிக்கவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Critical: do NOT use a blender or mixer. You want a slightly coarse, rustic mashed texture — not a smooth paste. The physical mashing releases natural starches from the dal which thicken the gravy creamily, and leaves recognizable bits of onion and tomato.",
                ta: "மிக முக்கியம்: மிக்ஸி அல்லது பிளெண்டர் பயன்படுத்த வேண்டாம். சற்று கரகரப்பான, கிராமத்து பதம் வேண்டும் — மிருதுவான விழுதல்ல. கையால் மசிப்பதே பயறிலிருந்து இயற்கையான மாவுச்சத்தை வெளியேற்றி, குழம்பை இயற்கையாக கெட்டியாக்குகிறது; வெங்காயம், தக்காளியின் சிறு துண்டுகள் தெரிவதே ருசியின் அடையாளம்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Add crystal salt to taste and mix well. Check the consistency — if it's too thick, add a little hot water to loosen it slightly.",
                ta: "தேவையான கல் உப்பு சேர்த்து நன்கு கலக்கவும். பதத்தை சரிபார்க்கவும் — மிக கெட்டியாக இருந்தால், சிறிது சூடான தண்ணீர் சேர்த்து லேசாக நீர்க்க வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "tempering",
          title: { en: "The Simple Tempering & Garnish", ta: "தாளிப்பு மற்றும் அலங்காரம்" },
          steps: [
            {
              step: 10,
              description: {
                en: "Heat a small pan with 2 tablespoons of cold-pressed groundnut oil. Use the good stuff — there's no other oil in the dish, so this tempering carries the entire aroma layer.",
                ta: "ஒரு சிறிய கடாயில் 2 ஸ்பூன் மரச்செக்கு கடலை எண்ணெய் சூடாக்கவும். குழம்பில் வேறு எண்ணெய் இல்லை, எனவே இந்த தாளிப்புதான் முழு வாசனையையும் தாங்குகிறது — நல்ல எண்ணெய் பயன்படுத்தவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the mustard seeds and let them splutter completely. Toss in a generous handful of fresh curry leaves and let them crisp up and turn glossy in the hot oil.",
                ta: "கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும். ஒரு கைப்பிடி கருவேப்பிலை சேர்த்து, சூடான எண்ணெயில் மொறுமொறுப்பாகி பளபளக்கும் வரை விடவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Pour this sizzling tempering directly over the mashed Pacha Payaru Kuzhambu. The hot oil hitting the dal will release a beautiful aroma — that 'chee-i' sound is the signature.",
                ta: "இந்த சீறும் தாளிப்பை மசித்த பச்சை பயறு குழம்பின் மேல் நேரடியாக ஊற்றவும். சூடான எண்ணெய் குழம்பில் விழும் போது வரும் 'சீ' சத்தம் மற்றும் வாசனைதான் இதன் அடையாளம்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Garnish with a big handful of freshly chopped coriander leaves and give it one final gentle mix.",
                ta: "புதிதாக நறுக்கிய பச்சை கொத்தமல்லியை தாராளமாக தூவி, ஒரு கடைசி முறை மெதுவாக கலக்கவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Serve piping hot over steaming white rice with a generous drizzle of ghee. It also makes a brilliant side dish for soft idlies, dosas or even ragi kali.",
                ta: "சூடான வெள்ளை சாதத்துடன், தாராளமான நெய் சேர்த்து சூடாக பரிமாறவும். மென்மையான இட்லி, தோசை, ராகி களி ஆகியவற்றுக்கு சிறந்த தொட்டுக்கொள்ளும் குழம்பாகவும் அமையும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Pacha Payaru Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
