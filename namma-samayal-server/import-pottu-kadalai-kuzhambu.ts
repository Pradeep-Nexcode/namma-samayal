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
  { slug: "fried-gram", name: "Pottu Kadalai (Fried/Roasted Gram, ground fine)", ta: "பொட்டுக்கடலை (மிருதுவாக அரைத்தது)", quantity: "1", unit: "cup" },
  { slug: "tomato", name: "Tomato (the tangy star — 10 nos)", ta: "தக்காளி (புளிப்பு மையம் — 10)", quantity: "10", unit: "nos" },
  { slug: "big-onion", name: "Big Onion (sliced)", ta: "பெரிய வெங்காயம் (நீளமாக நறுக்கியது)", quantity: "6", unit: "nos" },
  { slug: "green-chilli", name: "Green Chilli (slit — provides almost all the heat)", ta: "பச்சை மிளகாய் (கீறியது — முழு காரமும் இதிலிருந்தே)", quantity: "10", unit: "nos" },
  { slug: "sambar-powder", name: "Sambar Powder (Kuzhambu Thool)", ta: "சாம்பார் தூள் (குழம்பு தூள்)", quantity: "1.5", unit: "tsp" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "garam-masala", name: "Garam Masala (just a hint)", ta: "கரம் மசாலா (வெறும் சிறிது)", quantity: "1/4", unit: "tsp" },
  { slug: "mustard-seeds", name: "Mustard Seeds (for tempering)", ta: "கடுகு (தாளிப்புக்கு)", quantity: "1", unit: "tsp" },
  { slug: "groundnut-oil", name: "Groundnut Oil (cold-pressed)", ta: "கடலை எண்ணெய் (மரச்செக்கு)", quantity: "3-4", unit: "tbsp" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "thottathu-virundhu-pottu-kadalai-kuzhambu";
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
        en: "Thottathu Virundhu Pottu Kadalai Kuzhambu (Roasted Gram Tomato Gravy)",
        ta: "தோட்டத்து விருந்து பொட்டுக்கடலை குழம்பு",
      },
      slug,
      description: {
        en: "A brilliant tiffin-shop secret weapon gravy from Kavithamani Akka at Thottathu Virundhu (Erode), built on a simple but unusual principle — instead of using toor dal or heavy coconut paste as a thickener, the entire base of this kuzhambu is finely ground Pottu Kadalai (roasted gram) mixed into a slurry and poured into a punchy 10-tomato + 6-onion + 10-green-chilli base. The roasted gram naturally thickens the gravy into a velvety, smooth texture while keeping it incredibly light on the stomach — no dal-bloat, no heavy coconut richness. Skip the complicated wet masala grinding, no fancy spice blends; the dish pairs phenomenally with hot idlies, dosas and chapathis. If you run a tiffin shop (or just want a brand new addictive home recipe), this is it.",
        ta: "ஈரோடு தோட்டத்து விருந்தின் கவிதாமணி அக்காவின் டிஃபன் கடை ரகசிய ஆயுதம் குழம்பு — எளிமையான ஆனால் வழக்கத்துக்கு மாறான கொள்கையில் கட்டப்பட்டது: துவரம் பருப்பு அல்லது கனமான தேங்காய் விழுதுக்கு பதிலாக, மிருதுவாக அரைத்த பொட்டுக்கடலையை சாற்றில் கலந்து, காரமான 10-தக்காளி + 6-வெங்காயம் + 10-பச்சை மிளகாய் அடிப்படையில் ஊற்றுவதே இந்த குழம்பின் முழு அடிப்படை. பொட்டுக்கடலை இயற்கையாகவே குழம்பை மென்மையான, வெல்வெட் பதத்துக்கு கெட்டியாக்கி — வயிற்றில் கனமாக இல்லாமல், பருப்பு வீக்கம் இல்லாமல், கனமான தேங்காய் செழுமை இல்லாமல் — இலகுவாக வைக்கிறது. சிக்கலான ஈர மசாலா அரைப்பு வேண்டாம், சிறப்பு மசாலா கலவை வேண்டாம்; சூடான இட்லி, தோசை, சப்பாத்திக்கு அற்புதமாக பொருந்தும். டிஃபன் கடை நடத்தினாலும் (அல்லது புதிய அடிமை உணவு வேண்டுமானாலும்) — இதுவே சரியான தேர்வு.",
      },
      speciality: {
        en: "Three Thottathu Virundhu signatures define this dish: (1) The Tiffin-Shop Secret Weapon — designed specifically to be a 'new' gravy you can drop into a tiffin shop or home rotation that pairs with everything (idli, dosa, chapathi); skips the complicated wet-masala grinding most kuzhambus need. (2) The 'No Coconut, No Dal' Thickener — most South Indian gravies thicken with boiled toor dal or heavy ground coconut paste; this one uses Pottu Kadalai (roasted gram) ground to a fine powder and made into a slurry — gives a velvety smooth texture without making the dish stomach-heavy. The lightness is the entire point. (3) The Tomato Dominance Ratio — an unusually high 10 tomatoes vs only 6 onions; this lopsided ratio gives a punchy sweet-and-sour profile that cuts through the earthy richness of the roasted gram. The chillies (10 nos) provide ALL the heat — there's no red chilli powder. Critical technique rule: never add dry pottu kadalai powder straight to a hot pan — it instantly forms hard lumps; always make a smooth slurry with water first.",
        ta: "தோட்டத்து விருந்தின் மூன்று தனிச்சிறப்புகள்: (1) டிஃபன் கடை ரகசிய ஆயுதம் — டிஃபன் கடையில் அல்லது வீட்டில் சேர்க்க, இட்லி, தோசை, சப்பாத்தி எல்லாவற்றுக்கும் பொருந்தும் 'புதிய' குழம்பாக சிறப்பாக வடிவமைக்கப்பட்டது; பெரும்பாலான குழம்புகளுக்கு தேவையான சிக்கலான ஈர-மசாலா அரைப்பு வேண்டாம். (2) 'தேங்காய் இல்லை, பருப்பு இல்லை' கெட்டியாக்கி — பெரும்பாலான தென்னிந்திய குழம்புகள் வேக வைத்த துவரம் பருப்பு அல்லது கனமான அரைத்த தேங்காய் விழுது கொண்டே கெட்டியாகின்றன; இந்த உணவு பொட்டுக்கடலையை மிருதுவாக அரைத்து சாற்றாக்கி பயன்படுத்துகிறது — வெல்வெட் மென்மை, ஆனாலும் வயிற்றில் கனம் இல்லை. இலகுவே முழு நோக்கம். (3) தக்காளி ஆதிக்க விகிதம் — வழக்கத்துக்கு மாறான 10 தக்காளி எதிராக வெறும் 6 வெங்காயம்; இந்த சாய்வான விகிதம், பொட்டுக்கடலையின் மண்-செழுமையை கடந்து செல்லும் காரமான இனிப்பு-புளிப்பு சுவை சுயவிவரத்தை தரும். மிளகாய் (10) முழு காரத்தையும் தருகிறது — மிளகாய் தூள் இல்லை. கட்டாய நுட்ப விதி: காய்ந்த பொட்டுக்கடலை தூளை சூடான பாத்திரத்தில் நேரடியாக சேர்க்க வேண்டாம் — உடனே கட்டியாகிவிடும்; எப்போதும் முதலில் தண்ணீரில் கலந்து மிருதுவான சாறாக ஆக்கி பின்னர் சேர்க்கவும்.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 15,
      cookingTime: 25,
      totalTime: 40,
      servings: 6,
      difficulty: "easy",
      source: "youtube",
      tags: [
        "veg",
        "vegan",
        "gravy",
        "kuzhambu",
        "pottu-kadalai",
        "roasted-gram",
        "fried-gram",
        "tiffin-side",
        "breakfast-side",
        "dosa-side",
        "idli-side",
        "chapathi-side",
        "no-coconut",
        "no-dal",
        "light-on-stomach",
        "velvety",
        "tomato-heavy",
        "erode",
        "kongu",
        "tamil-nadu",
        "thottathu-virundhu",
        "kavithamani-akka",
        "tiffin-shop-recipe",
      ],
      searchKeywords: [
        "pottu kadalai kuzhambu",
        "roasted gram gravy",
        "fried gram kuzhambu",
        "பொட்டுக்கடலை குழம்பு",
        "thottathu virundhu pottu kadalai",
        "kavithamani akka kuzhambu",
        "tiffin shop kuzhambu",
        "no coconut kuzhambu",
        "no dal kuzhambu",
        "tomato kuzhambu",
        "kongu pottu kadalai",
        "erode kuzhambu",
        "velvety south indian gravy",
        "chef deena pottu kadalai",
        "dosa side gravy",
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
                en: "Peel and slice the 6 big onions into thin slices (not chopped). Roughly chop the 10 tomatoes — this is the tangy star, don't reduce the count. Slit the 10 green chillies lengthwise — these provide ALL the heat in this dish (there's no red chilli powder).",
                ta: "6 பெரிய வெங்காயத்தை தோல் சீவி, மெல்லியதாக நீளமாக நறுக்கவும் (சிறு துண்டுகளாக அல்ல). 10 தக்காளியை பெரிய துண்டுகளாக நறுக்கவும் — இது புளிப்பு மையம், எண்ணிக்கையை குறைக்க வேண்டாம். 10 பச்சை மிளகாயை நீளவாக்கில் கீறவும் — இந்த உணவின் முழு காரமும் இவற்றிலிருந்தே (மிளகாய் தூள் இல்லை).",
              },
            },
            {
              step: 2,
              description: {
                en: "Take the 1 cup of pottu kadalai (fried gram) and grind it in a COMPLETELY DRY mixer jar to a very fine, smooth powder — no chunks. Wipe the jar dry first if needed; even a drop of water will turn the powder into a paste.",
                ta: "1 கப் பொட்டுக்கடலையை, முற்றிலும் வரண்ட மிக்ஸியில் சேர்த்து மிக மிருதுவான, கட்டிகள் இல்லாத தூளாக அரைக்கவும். தேவைப்பட்டால் மிக்ஸியை முதலில் துடைத்து வரண்டே வைக்கவும்; ஒரு துளி தண்ணீர் கூட இருந்தால், பொட்டுக்கடலை விழுதாக மாறிவிடும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Base Sauté", ta: "அடிக்கூட்டு வதக்கல்" },
          steps: [
            {
              step: 3,
              description: {
                en: "Heat a heavy-bottomed kadai or pan over medium-high heat. Pour in the 3-4 tablespoons of cold-pressed groundnut oil.",
                ta: "ஒரு தடிமனான கடாயை மிதமான-உயர் தீயில் சூடாக்கவும். 3-4 ஸ்பூன் மரச்செக்கு கடலை எண்ணெய் ஊற்றவும்.",
              },
            },
            {
              step: 4,
              description: {
                en: "Once the oil is hot, add the mustard seeds and let them splutter completely.",
                ta: "எண்ணெய் சூடாகும் போது, கடுகு சேர்த்து முழுமையாக வெடிக்க விடவும்.",
              },
            },
            {
              step: 5,
              description: {
                en: "Toss in the 10 slit green chillies and the 6 sliced onions together. Sauté patiently on medium flame, stirring often, until the onions turn translucent, soft, and slightly golden — about 7-9 minutes.",
                ta: "10 கீறிய பச்சை மிளகாய் மற்றும் 6 நறுக்கிய வெங்காயத்தை ஒன்றாக சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, வெங்காயம் பளபளப்பாகி, மிருதுவாகி, லேசான பொன்னிறம் வரும் வரை — சுமார் 7-9 நிமிடம் — பொறுமையாக வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Building the Tangy Masala", ta: "புளிப்பு மசாலா கட்டமைத்தல்" },
          steps: [
            {
              step: 6,
              description: {
                en: "Add ALL 10 chopped tomatoes and crystal salt to taste. The volume will look huge — that's intentional. Sauté vigorously on medium-high heat, stirring often.",
                ta: "மொத்த 10 நறுக்கிய தக்காளியையும், தேவையான கல் உப்பையும் சேர்க்கவும். அளவு அதிகமாக இருக்கும் — அது வேண்டுமென்றே. மிதமான-உயர் தீயில் தொடர்ந்து கிளறி வேகமாக வதக்கவும்.",
              },
            },
            {
              step: 7,
              description: {
                en: "Because there are SO many tomatoes, give them proper time to cook down completely — about 10-15 minutes. They must be totally mushy, blended into the oil, with no visible tomato pieces left. Patience here = entire flavor of the dish.",
                ta: "தக்காளி அளவு மிக அதிகம் என்பதால், முற்றிலும் குழைய போதிய நேரம் கொடுக்கவும் — சுமார் 10-15 நிமிடம். அவை முற்றிலும் மிருதுவாகி, எண்ணெயில் கலந்து, பெரிய துண்டுகள் தெரியக்கூடாது. இங்கு பொறுமை = முழு உணவின் சுவை.",
              },
            },
            {
              step: 8,
              description: {
                en: "Lower the heat. Add the ½ tsp turmeric powder, 1½ tsp sambar powder, and ONLY ¼ tsp garam masala (just a tiny pinch for subtle warmth — too much garam masala will turn this into a generic curry). Sauté the dry spices in the oil for 30-60 seconds until the raw smell fades.",
                ta: "தீயை குறைக்கவும். ½ ஸ்பூன் மஞ்சள் தூள், 1½ ஸ்பூன் சாம்பார் தூள் மற்றும் வெறும் ¼ ஸ்பூன் கரம் மசாலா மட்டுமே (சிறிது சூட்டுக்கு மட்டும் — அதிக கரம் மசாலா சேர்த்தால் சாதாரண கறியாக மாறிவிடும்) சேர்க்கவும். எண்ணெயில் தூள்களை 30-60 விநாடிகள் வதக்கி, பச்சை வாசனை போக விடவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "The Pottu Kadalai Slurry", ta: "பொட்டுக்கடலை சாறு" },
          steps: [
            {
              step: 9,
              description: {
                en: "Transfer the ground pottu kadalai powder from the mixer to a separate bowl. Add roughly 1 cup of water and whisk thoroughly with a spoon or fork until you get a SMOOTH, lump-free slurry — like a thick pancake batter consistency.",
                ta: "அரைத்த பொட்டுக்கடலை தூளை மிக்ஸியிலிருந்து ஒரு தனி பாத்திரத்துக்கு மாற்றவும். சுமார் 1 கப் தண்ணீர் சேர்த்து, ஸ்பூன் அல்லது கரண்டியால் நன்கு கடைந்து, கட்டி இல்லாத மிருதுவான சாறாக மாற்றவும் — கெட்டியான பான்கேக் மாவு போல.",
              },
            },
            {
              step: 10,
              description: {
                en: "CRITICAL CHEF'S RULE: NEVER add the dry pottu kadalai powder directly into the hot pan. It will instantly form hard lumps that won't break down even with vigorous stirring, and the whole dish will fail. Always make a smooth slurry first.",
                ta: "மிக முக்கியமான சமையற்காரர் விதி: காய்ந்த பொட்டுக்கடலை தூளை சூடான பாத்திரத்தில் ஒருபோதும் நேரடியாக சேர்க்க வேண்டாம். உடனே கடினமான கட்டிகளாக மாறி, எவ்வளவு வேகமாக கிளறினாலும் உடையாது — முழு உணவும் கெடும். எப்போதும் முதலில் மிருதுவான சாறாக கலந்து பின்னர் சேர்க்கவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final Boil", ta: "இறுதி கொதிநிலை" },
          steps: [
            {
              step: 11,
              description: {
                en: "Pour the pottu kadalai slurry directly into the boiling tomato-onion masala base. Stir continuously while pouring to prevent any lumps from forming.",
                ta: "பொட்டுக்கடலை சாற்றை, கொதிக்கும் தக்காளி-வெங்காய மசாலா அடிப்படையில் நேரடியாக ஊற்றவும். ஊற்றும் போதே தொடர்ந்து கிளறி, எந்த கட்டியும் உருவாகாமல் பார்த்துக்கொள்ளவும்.",
              },
            },
            {
              step: 12,
              description: {
                en: "Add extra water to adjust the consistency. Important: roasted gram thickens dramatically as it boils, so keep the gravy noticeably WATERY at this stage — once it boils for 5-7 minutes, it will tighten into the right velvety kuzhambu consistency on its own.",
                ta: "பதத்தை சரிசெய்ய கூடுதலான தண்ணீர் சேர்க்கவும். முக்கியம்: பொட்டுக்கடலை கொதிக்கும்போது வெகுவாக கெட்டியாகும், எனவே இந்த நிலையில் குழம்பை வேண்டுமென்றே நீர்த்தாக வைக்கவும் — 5-7 நிமிடம் கொதிக்கும்போது தானாகவே சரியான வெல்வெட் பதத்துக்கு மாறும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Let it come to a rolling boil for about 5 to 7 minutes. Three signals tell you it's done: (a) the raw smell of the roasted gram completely vanishes, (b) the gravy has thickened to a velvety smooth consistency, and (c) the groundnut oil floats up and forms a thin glossy layer on top.",
                ta: "5-7 நிமிடம் நன்கு கொதிக்க விடவும். தயார் என்பதற்கான மூன்று அடையாளங்கள்: (அ) பொட்டுக்கடலையின் பச்சை வாசனை முற்றிலும் போய்விடும், (ஆ) குழம்பு வெல்வெட் மென்மையான பதத்துக்கு கெட்டியாகும், (இ) கடலை எண்ணெய் மேலே மிதந்து, மெல்லிய பளபளக்கும் அடுக்காக உருவாகும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Turn off the heat. Taste and adjust salt if needed. Serve this velvety, tangy Pottu Kadalai Kuzhambu piping hot, three ways: (a) over hot soft idlies (mallipoo style); (b) with crispy dosas; (c) with hot chapathis or parottas. Light enough that — as Chef Deena warns — everyone will eat at least one extra dosa.",
                ta: "அடுப்பை அணைக்கவும். சுவைத்து தேவையானால் உப்பு சரிசெய்யவும். இந்த வெல்வெட், புளிப்பான பொட்டுக்கடலை குழம்பை, மூன்று வழிகளில் சூடாக பரிமாறவும்: (அ) சூடான மென்மையான இட்லியின் மேல் (மல்லிப்பூ பாணி); (ஆ) மொறுமொறுப்பான தோசையுடன்; (இ) சூடான சப்பாத்தி அல்லது பரோட்டாவுடன். மிக இலகுவாக இருப்பதால் — சமையற்காரர் டீனா எச்சரிக்கும் படி — ஒவ்வொருவரும் ஒரு கூடுதல் தோசை சாப்பிட்டுவிடுவார்கள்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Pottu Kadalai Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
