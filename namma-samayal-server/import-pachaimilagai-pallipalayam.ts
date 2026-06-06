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
  { slug: "country-chicken", name: "Country Chicken", ta: "நாட்டு கோழி", quantity: "3", unit: "kg" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "200", unit: "ml" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "1", unit: "kg" },
  { slug: "green-chilli", name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "500", unit: "g" },
  { slug: "ginger-garlic-paste", name: "Ginger Garlic Paste", ta: "இஞ்சி பூண்டு விழுது", quantity: "2", unit: "tsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "2", unit: "tsp" },
  { slug: "coconut", name: "Coconut", ta: "தேங்காய்", quantity: "1", unit: "whole" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "handful" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-pachai-milagai-pallipalayam-chicken";
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
        en: "Erode Pachai Milagai Pallipalayam Chicken (Green Chilli Pallipalayam)",
        ta: "ஈரோடு பச்சை மிளகாய் பல்லிப்பாளையம் சிக்கன்",
      },
      slug,
      description: {
        en: "A bold Erode-style twist on the classic Kongu Pallipalayam chicken roast — replacing the traditional dry red chillies with half a kilo of fresh green chillies. Built on just four core ingredients (groundnut oil, small onions, green chillies and country chicken), with no fancy masalas, no tomatoes, and no garam masala. The chillies are patiently sautéed until their raw heat mellows, leaving a deeply aromatic, kid-friendly thokku coated around tender country chicken pieces with crunchy fresh coconut.",
        ta: "பல்லிப்பாளையம் கோழி வறுவலின் தனித்துவமான ஈரோடு பதிப்பு — காய்ந்த சிவப்பு மிளகாய்க்கு பதிலாக அரை கிலோ பச்சை மிளகாய் பயன்படுத்தப்படுகிறது. கடலை எண்ணெய், சின்ன வெங்காயம், பச்சை மிளகாய், நாட்டு கோழி — இந்த நான்கு பொருட்களில் மட்டுமே செய்யப்படும் சுவையான வறுவல். கொத்தமல்லி தூள், கரம் மசாலா, தக்காளி எதுவும் இல்லை. பச்சை மிளகாய் கடலை எண்ணெயில் பொறுமையாக வதங்கி, காரம் குறைந்து வாசனை மட்டும் தங்கி, சிறு குழந்தைகள் கூட சாப்பிடக்கூடிய அளவில் இனிமையாக மாறுகிறது.",
      },
      speciality: {
        en: "The '4-ingredient magic' from Thottathu Virunthu — groundnut oil, small onions, green chillies and country chicken. Despite using ½ kg of green chillies for 3 kg of chicken, the slow sauté in groundnut oil completely mellows the heat — even kids can eat it (pachai pillaikooda saapidum). Bite-sized fresh coconut pieces cook along with the meat to soak up the juices and add crunch.",
        ta: "தோட்டத்து விருந்தின் '4 பொருள் மாயம்' — கடலை எண்ணெய், சின்ன வெங்காயம், பச்சை மிளகாய், நாட்டு கோழி. 3 கிலோ கோழிக்கு அரை கிலோ பச்சை மிளகாய் சேர்த்தாலும், கடலை எண்ணெயில் மெதுவாக வதங்குவதால் காரம் முற்றிலும் குறைந்து, பச்சை பிள்ளைகூட சாப்பிடும் அளவுக்கு இனிமையாக மாறுகிறது. தேங்காய் துண்டுகள் கோழியுடன் சேர்ந்து வேகி சாறை உறிஞ்சி கொறுகொறுப்பை சேர்க்கின்றன.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 20,
      cookingTime: 50,
      totalTime: 70,
      servings: 10,
      difficulty: "medium",
      source: "youtube",
      tags: [
        "non-veg",
        "chicken",
        "country-chicken",
        "nattu-kozhi",
        "pallipalayam",
        "roast",
        "thokku",
        "green-chilli",
        "pachai-milagai",
        "erode",
        "kongu",
        "tamil-nadu",
        "traditional",
        "thottathu-virunthu",
        "minimal-ingredients",
      ],
      searchKeywords: [
        "pallipalayam chicken",
        "pachai milagai chicken",
        "green chilli chicken",
        "பல்லிப்பாளையம் கோழி",
        "பச்சை மிளகாய் சிக்கன்",
        "nattu kozhi varuval",
        "country chicken roast",
        "erode chicken",
        "kongu chicken",
        "thottathu virunthu",
        "4 ingredient chicken",
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
                en: "Clean and wash the 3 kg of country chicken thoroughly with a pinch of turmeric. Cut into small, bite-sized pieces and drain well.",
                ta: "3 கிலோ நாட்டு கோழியை சிறிது மஞ்சள் தூளுடன் நன்கு கழுவவும். சிறிய, கடிக்கும் அளவு துண்டுகளாக வெட்டி தண்ணீர் வடியவிடவும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Peel the 1 kg of small onions and roughly chop them. Slit or roughly break the ½ kg of green chillies — don't chop them too fine, you want them in recognizable pieces.",
                ta: "1 கிலோ சின்ன வெங்காயத்தை தோல் சீவி நறுக்கவும். அரை கிலோ பச்சை மிளகாயை லேசாக கீறவும் அல்லது உடைக்கவும் — மிக நுணுக்கமாக நறுக்க வேண்டாம், பெரிய துண்டுகளாக இருக்கட்டும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Crack open the whole fresh coconut and chop the white kernel into small, thin, bite-sized pieces — not grated, but small enough to chew along with the chicken.",
                ta: "முழு தேங்காயை உடைத்து, வெள்ளை பகுதியை சிறிய, மெல்லிய, கடிக்கும் அளவு துண்டுகளாக நறுக்கவும் — துருவ வேண்டாம், கோழியுடன் சேர்த்து கடிக்கும் அளவு சிறு துண்டுகளாக.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Base Sauté", ta: "அடிக்கூட்டு வதக்கல்" },
          steps: [
            {
              step: 4,
              description: {
                en: "Heat a large, heavy-bottomed kadai or vessel and pour in the full 200 ml of groundnut oil. Wait until the oil is properly hot — this oil is doing most of the flavor work, so don't skimp.",
                ta: "ஒரு பெரிய, தடிமனான கடாய் அல்லது பாத்திரத்தை சூடாக்கி, முழு 200 மிலி கடலை எண்ணெய்யையும் ஊற்றவும். எண்ணெய் நன்கு சூடாகும் வரை காத்திருக்கவும் — இந்த எண்ணெய்தான் முழு சுவையின் அடிப்படை, கஞ்சத்தனம் காட்ட வேண்டாம்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Add the mustard seeds and let them splutter, then drop in a generous handful of fresh curry leaves. Let them sizzle briefly to release their aroma into the oil.",
                ta: "கடுகு சேர்த்து வெடிக்க விடவும், உடனே ஒரு கைப்பிடி கருவேப்பிலை சேர்க்கவும். வாசனை எண்ணெய்க்கு பரவ சில விநாடிகள் சீறிக் கொட்ட விடவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Add the full 1 kg of chopped small onions. Sauté on a medium flame, stirring often, until they turn translucent and soft — give this step time, the onions are a major flavor pillar of this dish.",
                ta: "1 கிலோ நறுக்கிய சின்ன வெங்காயத்தை சேர்க்கவும். மிதமான தீயில், அடிக்கடி கிளறி, பளபளப்பாகி மிருதுவாகும் வரை வதக்கவும் — இந்த படிக்கு போதிய நேரம் கொடுக்கவும், வெங்காயம் இந்த உணவின் முக்கிய சுவைத் தூண்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Drop in the full ½ kg of slit green chillies. Sauté the onions and green chillies together patiently — this is the most critical step. The raw heat of the chillies must mellow out in the groundnut oil and turn into a sweet, deep aroma. Don't rush.",
                ta: "அரை கிலோ கீறிய பச்சை மிளகாயை சேர்க்கவும். வெங்காயம் மற்றும் பச்சை மிளகாயை ஒன்றாக பொறுமையாக வதக்கவும் — இதுவே மிக முக்கியமான படி. பச்சை மிளகாயின் காரம் கடலை எண்ணெயில் முற்றிலும் குறைந்து, இனிமையான ஆழமான வாசனையாக மாற வேண்டும். அவசரப்பட வேண்டாம்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Searing the Chicken", ta: "கோழி வறுத்தல்" },
          steps: [
            {
              step: 8,
              description: {
                en: "Add the 2 teaspoons of ginger-garlic paste to the pan and sauté until the raw smell completely disappears — usually 1-2 minutes on medium heat.",
                ta: "2 ஸ்பூன் இஞ்சி பூண்டு விழுதை சேர்த்து, பச்சை வாசனை முற்றிலும் போகும் வரை வதக்கவும் — மிதமான தீயில் சுமார் 1-2 நிமிடம்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Add the 3 kg of cleaned country chicken pieces directly into the pan. Add the 2 teaspoons of turmeric powder and crystal salt to taste.",
                ta: "சுத்தம் செய்த 3 கிலோ நாட்டு கோழி துண்டுகளை நேரடியாக கடாயில் சேர்க்கவும். 2 ஸ்பூன் மஞ்சள் தூள் மற்றும் தேவையான கல் உப்பு சேர்க்கவும்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Mix everything well and let the chicken sear in the hot oil for 5-7 minutes — it will change color, firm up, and start releasing its own juices.",
                ta: "அனைத்தையும் நன்கு கலந்து, சூடான எண்ணெயில் கோழி 5-7 நிமிடம் வறுபட விடவும் — அது நிறம் மாறி, இறுகி, தனது சாற்றை வெளியிட ஆரம்பிக்கும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Boiling and Adding Coconut", ta: "வேக வைத்தல் மற்றும் தேங்காய் சேர்த்தல்" },
          steps: [
            {
              step: 11,
              description: {
                en: "Pour in enough water to just cover the chicken — country chicken needs proper boiling time, so don't be shy with the water.",
                ta: "கோழி முழுகும் அளவுக்கு தண்ணீர் ஊற்றவும் — நாட்டு கோழி வேக போதிய நேரம் வேண்டும், எனவே தண்ணீரில் சிக்கனப்பட வேண்டாம்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Immediately add the chopped fresh coconut pieces into the pan. They will boil along with the meat and absorb all the rich spices and chicken juices.",
                ta: "உடனே நறுக்கிய தேங்காய் துண்டுகளை கடாயில் சேர்க்கவும். அவை கோழியுடன் சேர்ந்து வேகி, மசாலா மற்றும் கோழி சாற்றை முழுமையாக உறிஞ்சும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Cover the pan and let it cook vigorously on a medium-high flame until the country chicken is fully tender — typically 25-35 minutes depending on the bird. Check occasionally and stir gently.",
                ta: "மூடி வைத்து மிதமான-உயர் தீயில், நாட்டு கோழி நன்கு மிருதுவாகும் வரை வேக வைக்கவும் — கோழியின் வயதைப் பொறுத்து சுமார் 25-35 நிமிடம். அவ்வப்போது சரிபார்த்து மெதுவாக கிளறவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final 'Thokku' Consistency", ta: "இறுதி தொக்கு பதம்" },
          steps: [
            {
              step: 14,
              description: {
                en: "Once the chicken is fully cooked and tender, remove the lid and turn up the heat. Let the remaining water evaporate.",
                ta: "கோழி நன்கு வெந்து மிருதுவான பின், மூடியை எடுத்துவிட்டு தீயை அதிகரிக்கவும். மீதமுள்ள தண்ணீர் ஆவியாக விடவும்.",
              },
            },
            {
              step: 15,
              description: {
                en: "Keep stirring and roasting on a medium flame until the onions and green chillies completely break down and mash into the meat. The dish is done when it forms a thick, jam-like thokku coating around the chicken pieces, and the rich groundnut oil separates beautifully at the edges of the pan.",
                ta: "மிதமான தீயில் தொடர்ந்து கிளறி வறுக்கவும் — வெங்காயம் மற்றும் பச்சை மிளகாய் முற்றிலும் குழைந்து இறைச்சியுடன் ஒன்றாக மாற வேண்டும். கோழி துண்டுகளை சுற்றி கெட்டியான ஜாம் போன்ற தொக்கு பதம் வந்து, பாத்திரத்தின் ஓரத்தில் கடலை எண்ணெய் தனியாக பிரிந்து வந்தால் — உணவு தயார்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Taste and adjust salt. Serve this incredibly aromatic green chilli Pallipalayam roast steaming hot with white rice, ragi kali, or hot parottas.",
                ta: "உப்பு சரிபார்த்து சரிசெய்யவும். இந்த அற்புதமான வாசனை கொண்ட பச்சை மிளகாய் பல்லிப்பாளையம் வறுவலை, சூடான வெள்ளை சாதம், ராகி களி, அல்லது சூடான பரோட்டாவுடன் பரிமாறவும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Pachai Milagai Pallipalayam Chicken recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
