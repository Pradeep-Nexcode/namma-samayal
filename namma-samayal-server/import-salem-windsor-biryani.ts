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
  // Dry Salem Biryani Masala
  { slug: "dry-red-chillies", name: "Dry Red Chillies (for dry masala)", ta: "காய்ந்த மிளகாய் (வரண்ட மசாலாவுக்கு)", quantity: "5", unit: "nos" },
  { slug: "star-anise", name: "Star Anise (Annachi Poo, for dry masala)", ta: "அன்னாசிப்பூ (வரண்ட மசாலாவுக்கு)", quantity: "2", unit: "nos" },
  { slug: "cinnamon", name: "Cinnamon (Pattai, for dry masala)", ta: "இலவங்கப்பட்டை (வரண்ட மசாலாவுக்கு)", quantity: "4-5", unit: "small pieces" },
  { slug: "cloves", name: "Cloves (Kirambu, for dry masala)", ta: "கிராம்பு (வரண்ட மசாலாவுக்கு)", quantity: "6", unit: "nos" },
  { slug: "cardamom", name: "Cardamom (Yelakkai, for dry masala)", ta: "ஏலக்காய் (வரண்ட மசாலாவுக்கு)", quantity: "1/2", unit: "tsp" },
  { slug: "mace", name: "Mace (Jathipathri) — KEY Salem signature", ta: "ஜாதிப்பத்திரி — சேலம் சிறப்பு", quantity: "1", unit: "no", categorySlug: "spices-masalas" },
  { slug: "kalpasi", name: "Kalpasi (Stone Flower / Dagad Phool) — KEY Salem signature", ta: "கல்பாசி (கற்பூ) — சேலம் சிறப்பு", quantity: "1", unit: "no", categorySlug: "spices-masalas" },
  { slug: "fennel-seeds", name: "Fennel Seeds (Sombu, for dry masala)", ta: "சோம்பு (வரண்ட மசாலாவுக்கு)", quantity: "1/2", unit: "tsp" },
  { slug: "cumin-seeds", name: "Cumin Seeds (Seeragam, for dry masala)", ta: "சீரகம் (வரண்ட மசாலாவுக்கு)", quantity: "1/2", unit: "tsp" },
  { slug: "black-pepper", name: "Black Pepper (Milagu, for dry masala)", ta: "மிளகு (வரண்ட மசாலாவுக்கு)", quantity: "1/2", unit: "tsp" },

  // Wet Masala Paste
  { slug: "mint-leaves", name: "Mint Leaves (Pudhina, for wet paste)", ta: "புதினா (ஈர மசாலாவுக்கு)", quantity: "1", unit: "handful (+ extra)" },
  { slug: "coriander-leaves", name: "Coriander Leaves (Kothamalli, for wet paste)", ta: "கொத்தமல்லி (ஈர மசாலாவுக்கு)", quantity: "1", unit: "handful (+ extra)" },
  { slug: "green-chilli", name: "Green Chilli (for wet paste + main)", ta: "பச்சை மிளகாய் (ஈர மசாலா + மசாலா)", quantity: "3 (paste) + 4 (slit)", unit: "nos" },
  { slug: "garlic", name: "Garlic (for wet paste)", ta: "பூண்டு (ஈர மசாலாவுக்கு)", quantity: "10", unit: "cloves" },
  { slug: "ginger", name: "Ginger (for wet paste)", ta: "இஞ்சி (ஈர மசாலாவுக்கு)", quantity: "1/2", unit: "small slice" },

  // Main cooking ingredients
  { slug: "chicken", name: "Chicken (biryani pieces)", ta: "கோழி (பிரியாணி துண்டுகள்)", quantity: "500", unit: "g" },
  { slug: "seeraga-samba-rice", name: "Seeraga Samba Rice", ta: "சீரக சம்பா அரிசி", quantity: "1", unit: "kg" },
  { slug: "big-onion", name: "Big Onion (thinly sliced)", ta: "பெரிய வெங்காயம் (மெல்லியதாக நறுக்கியது)", quantity: "3", unit: "nos" },
  { slug: "tomato", name: "Tomato (chopped)", ta: "தக்காளி (நறுக்கியது)", quantity: "2", unit: "nos" },
  { slug: "curd", name: "Curd (Thayir)", ta: "தயிர்", quantity: "100", unit: "ml" },
  { slug: "lemon", name: "Lemon (juice)", ta: "எலுமிச்சை (சாறு)", quantity: "1/2", unit: "no" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1/2", unit: "tsp" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "1", unit: "tsp" },
  { slug: "garam-masala", name: "Garam Masala", ta: "கரம் மசாலா", quantity: "1/2", unit: "tsp" },
  { slug: "groundnut-oil", name: "Oil (Groundnut / Refined)", ta: "எண்ணெய் (கடலை / சுத்திகரிக்கப்பட்டது)", quantity: "150", unit: "ml" },
  { slug: "ghee", name: "Ghee", ta: "நெய்", quantity: "as required", unit: "" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "salem-windsor-castle-biryani";
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
        en: "Salem Windsor Castle Biryani (Authentic Salem Chicken Biryani)",
        ta: "சேலம் விண்ட்சர் காசில் பிரியாணி",
      },
      title: "Salem Biryani (Windsor Castle)",
      slug,
      description: {
        en: "The legendary chicken biryani from Windsor Castle Hotel in Salem — Tamil Nadu's most iconic biryani city. Built on a unique 'double masala' technique: a freshly dry-roasted Salem Biryani Masala (cinnamon, cloves, cardamom, mace, kalpasi, fennel, cumin, black pepper, dry red chillies, star anise) PLUS a vibrant freshly-ground wet green paste of mint, coriander, green chillies, garlic, ginger and whole spices. The mace + kalpasi combination is the signature Salem secret, giving floral, deeply aromatic notes that balance the heat of dry chillies and pepper. Seeraga Samba rice cooks directly in this richly perfumed chicken broth, then finished on classic dum for 15-20 minutes.",
        ta: "தமிழ்நாட்டின் மிகவும் புகழ்பெற்ற பிரியாணி நகரமான சேலத்தின் விண்ட்சர் காசில் ஹோட்டலின் புகழ்பெற்ற கோழி பிரியாணி. தனிச்சிறப்பான 'இரட்டை மசாலா' நுட்பத்தில் கட்டப்பட்டது: புதிதாக வறுத்த சேலம் பிரியாணி மசாலா (இலவங்கப்பட்டை, கிராம்பு, ஏலக்காய், ஜாதிப்பத்திரி, கல்பாசி, சோம்பு, சீரகம், மிளகு, காய்ந்த மிளகாய், அன்னாசிப்பூ) மற்றும் புதிதாக அரைத்த ஈர பச்சை விழுது (புதினா, கொத்தமல்லி, பச்சை மிளகாய், பூண்டு, இஞ்சி, முழு மசாலாக்கள்). ஜாதிப்பத்திரி + கல்பாசி சேர்க்கையே சேலம் ரகசியம் — காரத்தை சமன் செய்யும் மலர் வாசனை இதனால்தான் வருகிறது. சீரக சம்பா அரிசி இந்த வாசனை மிக்க கோழி சாற்றில் வேக வைக்கப்பட்டு, கிளாசிக் தம் முறையில் 15-20 நிமிடம் முடிக்கப்படுகிறது.",
      },
      speciality: {
        en: "Three Windsor Castle signatures define authentic Salem Biryani: (1) The Double-Masala Technique — most biryanis use store-bought powder OR a green paste, never both. Salem uses BOTH: a dry-roasted-and-ground masala AND a freshly ground wet green paste. They hit the dish at different stages and produce a layered depth no single masala can. (2) The Mace + Kalpasi Royal Touch — this is THE Salem signature. Jathipathri (mace) brings a floral honeyed note; kalpasi (stone flower) brings a deep earthy musk. Together they tame the heat of dry red chillies and black pepper and give the biryani its 'Kongu-meets-royal' character. Skip either and you lose the Salem identity. (3) The Wet Green Paste — instead of plain ginger-garlic, the chefs grind ginger + garlic TOGETHER with fresh mint, coriander, green chillies, cinnamon, cardamom and cloves. This green paste infuses every grain of rice and every fibre of chicken with herbal aromatics from the very base of the cook.",
        ta: "அசலான சேலம் பிரியாணியின் மூன்று விண்ட்சர் காசில் தனிச்சிறப்புகள்: (1) இரட்டை-மசாலா நுட்பம் — பெரும்பாலான பிரியாணிகள் கடை மசாலா தூள் அல்லது பச்சை விழுது ஒன்றை மட்டுமே பயன்படுத்துகின்றன; சேலம் இரண்டையும் பயன்படுத்துகிறது: வறுத்து அரைத்த வரண்ட மசாலா மற்றும் புதிதாக அரைத்த ஈர பச்சை விழுது. இவை வெவ்வேறு கட்டத்தில் சேர்க்கப்பட்டு, எந்த ஒற்றை மசாலாவும் தர முடியாத அடுக்கு சுவை ஆழத்தை உருவாக்குகின்றன. (2) ஜாதிப்பத்திரி + கல்பாசி அரசியல் தொடுதல் — இதுவே சேலத்தின் தனிச்சிறப்பு. ஜாதிப்பத்திரி மலர் தேன் வாசனையை, கல்பாசி ஆழமான மண் மிருதுவாசனையை சேர்க்கிறது. இவை இணைந்து காய்ந்த மிளகாய் மற்றும் மிளகின் காரத்தை மென்மையாக்கி, பிரியாணிக்கு 'கொங்கு-அரசியல்' பண்பை தருகிறது. ஏதேனும் ஒன்றை தவிர்த்தால் சேலம் அடையாளம் இழக்கப்படும். (3) ஈர பச்சை விழுது — சாதாரண இஞ்சி-பூண்டுக்கு பதிலாக, இஞ்சி + பூண்டு புதிய புதினா, கொத்தமல்லி, பச்சை மிளகாய், இலவங்கப்பட்டை, ஏலக்காய், கிராம்பு ஆகியவற்றுடன் ஒன்றாக அரைக்கப்படுகிறது. இந்த பச்சை விழுது சமையலின் ஆரம்பத்திலிருந்தே ஒவ்வொரு அரிசி தானியத்திலும், கோழி நாரிலும் மூலிகை வாசனையை பதிக்கிறது.",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        city: "Salem",
      },
      prepTime: 30,
      cookingTime: 75,
      totalTime: 105,
      servings: 8,
      difficulty: "hard",
      source: "youtube",
      tags: [
        "non-veg",
        "biryani",
        "salem-biryani",
        "chicken-biryani",
        "windsor-castle",
        "seeraga-samba",
        "dum-biryani",
        "double-masala",
        "kalpasi",
        "mace",
        "stone-flower",
        "tamil-nadu",
        "salem",
        "kongu",
        "iconic",
        "traditional",
        "feast",
        "wet-masala-paste",
        "fresh-roasted-masala",
      ],
      searchKeywords: [
        "salem biryani",
        "windsor castle biryani",
        "சேலம் பிரியாணி",
        "windsor castle hotel salem",
        "chicken biryani salem style",
        "seeraga samba chicken biryani",
        "kalpasi biryani",
        "mace biryani",
        "double masala biryani",
        "salem chicken biryani recipe",
        "chef deena salem biryani",
        "windsor castle chicken biryani",
        "tamil nadu biryani",
      ],
      createdBy: user._id,
      isPublic: true,
      isApproved: false,
      averageRating: 0,
      ingredients: recipeIngredients,
      steps: [],
      sections: [
        {
          type: "masala",
          title: { en: "Preparing the Dry Salem Biryani Masala", ta: "வரண்ட சேலம் பிரியாணி மசாலா தயாரித்தல்" },
          steps: [
            {
              step: 1,
              description: {
                en: "Heat a dry, heavy-bottomed pan on a LOW flame. No oil — this is a dry roast. The low flame is critical: any browning beyond pale golden will turn the entire biryani bitter.",
                ta: "ஒரு தடிமனான வரண்ட கடாயை குறைந்த தீயில் சூடாக்கவும். எண்ணெய் இல்லாமல் — இது வரண்ட வறுவல். குறைந்த தீ மிக முக்கியம்: லேசான பொன்னிறத்துக்கு மேல் கருகினால், முழு பிரியாணியும் கசக்கும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Add ALL the dry masala items together: 5 dry red chillies, 2 star anise, 4-5 cinnamon pieces, 6 cloves, ½ tsp cardamom, 1 piece mace (jathipathri), 1 piece kalpasi (stone flower), ½ tsp fennel seeds, ½ tsp cumin seeds, and ½ tsp black pepper.",
                ta: "வரண்ட மசாலா பொருட்கள் அனைத்தையும் ஒன்றாக சேர்க்கவும்: 5 காய்ந்த மிளகாய், 2 அன்னாசிப்பூ, 4-5 இலவங்கப்பட்டை, 6 கிராம்பு, ½ ஸ்பூன் ஏலக்காய், 1 ஜாதிப்பத்திரி, 1 கல்பாசி, ½ ஸ்பூன் சோம்பு, ½ ஸ்பூன் சீரகம், மற்றும் ½ ஸ்பூன் மிளகு.",
              },
            },
            {
              step: 3,
              description: {
                en: "Dry-roast on a low flame, stirring continuously, for 3-5 minutes until the spices turn fragrant and the mace + kalpasi start releasing their distinctive floral-earthy aroma. The chillies should puff slightly. DO NOT brown.",
                ta: "குறைந்த தீயில் தொடர்ந்து கிளறி 3-5 நிமிடம் வறுக்கவும் — மசாலாக்கள் வாசனை வீச, ஜாதிப்பத்திரி + கல்பாசி தனிச்சிறப்பான மலர்-மண் வாசனையை வெளியேற்ற ஆரம்பிக்க வேண்டும். மிளகாய் சற்று பருக்க வேண்டும். கருகக் கூடாது.",
              },
            },
            {
              step: 4,
              description: {
                en: "Spread the roasted spices on a plate and let them cool COMPLETELY to room temperature. Then grind in a dry mixer to a fine, fragrant powder. Set aside.",
                ta: "வறுத்த மசாலாவை ஒரு தட்டில் பரப்பி, அறை வெப்பநிலை வரும் வரை முழுமையாக ஆற விடவும். பின் வரண்ட மிக்ஸியில் மிருதுவான, வாசனை மிக்க தூளாக அரைக்கவும். தனியாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Preparing the Wet Green Masala Paste", ta: "ஈர பச்சை மசாலா விழுது தயாரித்தல்" },
          steps: [
            {
              step: 5,
              description: {
                en: "In a mixer jar, combine: 1 handful mint leaves (pudhina), 1 handful coriander leaves, 3 green chillies, 10 garlic cloves, ½ small slice of ginger, 2 cinnamon pieces, 4 cardamom pods, and 5 cloves.",
                ta: "மிக்ஸியில் சேர்க்கவும்: 1 கைப்பிடி புதினா, 1 கைப்பிடி கொத்தமல்லி, 3 பச்சை மிளகாய், 10 பூண்டு பற்கள், ½ சிறு துண்டு இஞ்சி, 2 இலவங்கப்பட்டை, 4 ஏலக்காய், மற்றும் 5 கிராம்பு.",
              },
            },
            {
              step: 6,
              description: {
                en: "Grind everything together (with just a splash of water if needed) into a smooth, vibrant GREEN aromatic paste. This wet paste is what gives the entire biryani its herbal backbone. Set aside.",
                ta: "தேவைப்பட்டால் சிறிது தண்ணீர் சேர்த்து, அனைத்தையும் சேர்த்து மிருதுவான, பளபளக்கும் பச்சை வாசனை மிக்க விழுதாக அரைக்கவும். இந்த ஈர விழுதே முழு பிரியாணிக்கும் மூலிகை அடித்தளம். தனியாக வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "preparation",
          title: { en: "Prep", ta: "முன் தயாரிப்பு" },
          steps: [
            {
              step: 7,
              description: {
                en: "Wash the 1 kg of Seeraga Samba rice gently 2-3 times until the water runs clear. Soak in fresh water for 20-30 minutes. Drain just before adding to the broth.",
                ta: "1 கிலோ சீரக சம்பா அரிசியை மெதுவாக 2-3 முறை தண்ணீர் தெளிவாகும் வரை கழுவவும். 20-30 நிமிடம் சுத்தமான தண்ணீரில் ஊறவைக்கவும். சாற்றில் சேர்ப்பதற்கு சற்று முன்பு வடிக்கவும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Clean the ½ kg of chicken thoroughly and cut into medium biryani pieces. Thinly slice the 3 big onions. Chop the 2 tomatoes. Slit the 4 green chillies for the main pot (separate from the 3 used in the wet paste). Whisk the 100 ml of curd until smooth. Juice the half lemon.",
                ta: "½ கிலோ கோழியை நன்கு சுத்தம் செய்து, நடுத்தர பிரியாணி துண்டுகளாக வெட்டவும். 3 பெரிய வெங்காயத்தை மெல்லியதாக நறுக்கவும். 2 தக்காளியை நறுக்கவும். மசாலா பானைக்கு 4 பச்சை மிளகாயை கீறவும் (ஈர விழுதில் சேர்த்த 3 மிளகாயை விட இவை தனி). 100 மிலி தயிரை மிருதுவாக கடையவும். அரை எலுமிச்சையை பிழியவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Aromatic Base", ta: "வாசனை அடித்தளம்" },
          steps: [
            {
              step: 9,
              description: {
                en: "Heat a heavy-bottomed biryani vessel (dekchi) over medium-high heat. Pour in the 150 ml of oil along with a generous dollop of ghee. The oil-ghee combo is non-negotiable for Salem biryani.",
                ta: "ஒரு தடிமனான பிரியாணி தேக்சி பாத்திரத்தை மிதமான-உயர் தீயில் சூடாக்கவும். 150 மிலி எண்ணெய்யுடன் தாராளமான ஒரு ஸ்பூன் நெய் ஊற்றவும். எண்ணெய்-நெய் கலவை சேலம் பிரியாணிக்கு கட்டாயம்.",
              },
            },
            {
              step: 10,
              description: {
                en: "Add the thinly sliced big onions. Sauté patiently on a medium flame, stirring often, until they turn a deep CARAMELIZED golden-brown — typically 12-15 minutes. This caramelization is what gives the biryani its color and sweet depth.",
                ta: "மெல்லியதாக நறுக்கிய பெரிய வெங்காயத்தை சேர்க்கவும். மிதமான தீயில் தொடர்ந்து கிளறி, ஆழமான கருகிய பழுப்பு பொன்னிறம் வரும் வரை — சுமார் 12-15 நிமிடம் — பொறுமையாக வதக்கவும். இந்த கருகலே பிரியாணிக்கு நிறமும் இனிமை ஆழமும் தருகிறது.",
              },
            },
            {
              step: 11,
              description: {
                en: "Add the 4 slit green chillies and the entire WET MASALA PASTE (the green herb-ginger-garlic blend). Sauté vigorously for 3-5 minutes until the raw smell completely vanishes and the oil starts separating at the edges.",
                ta: "4 கீறிய பச்சை மிளகாய் மற்றும் முழு ஈர மசாலா விழுதை (பச்சை மூலிகை-இஞ்சி-பூண்டு கலவை) சேர்க்கவும். பச்சை வாசனை முற்றிலும் போய், ஓரத்தில் எண்ணெய் பிரிய ஆரம்பிக்கும் வரை 3-5 நிமிடம் வேகமாக வதக்கவும்.",
              },
            },
          ],
        },
        {
          type: "masala",
          title: { en: "Building the Flavours", ta: "சுவைகள் கட்டமைத்தல்" },
          steps: [
            {
              step: 12,
              description: {
                en: "Toss in the extra handful of fresh mint and the extra handful of coriander leaves. Stir for 30-60 seconds so the herbal oils release into the hot fat.",
                ta: "கூடுதலான ஒரு கைப்பிடி புதிய புதினா மற்றும் கூடுதலான ஒரு கைப்பிடி கொத்தமல்லியை சேர்க்கவும். இலைகளின் வாசனை சூடான எண்ணெயில் கலக்க 30-60 விநாடிகள் கிளறவும்.",
              },
            },
            {
              step: 13,
              description: {
                en: "Add the 2 chopped tomatoes. Sauté until they break down completely and become soft mushy paste — about 5-7 minutes.",
                ta: "2 நறுக்கிய தக்காளியை சேர்க்கவும். முற்றிலும் குழைந்து மிருதுவான விழுதாக மாறும் வரை — சுமார் 5-7 நிமிடம் — வதக்கவும்.",
              },
            },
            {
              step: 14,
              description: {
                en: "Lower the flame. Add the ½ tsp turmeric powder, 1 tsp red chilli powder, ½ tsp garam masala, and the freshly ground DRY SALEM BIRYANI MASALA from step 4. Mix the spices well into the onion-tomato-paste base for a minute. Critical: don't burn the powders — they turn the dish bitter.",
                ta: "தீயை குறைக்கவும். ½ ஸ்பூன் மஞ்சள் தூள், 1 ஸ்பூன் மிளகாய் தூள், ½ ஸ்பூன் கரம் மசாலா, மற்றும் படி 4-இல் புதிதாக அரைத்த வரண்ட சேலம் பிரியாணி மசாலாவை சேர்க்கவும். வெங்காயம்-தக்காளி-விழுது அடிப்படையில் மசாலாக்களை ஒரு நிமிடம் நன்கு கலக்கவும். மிக முக்கியம்: தூள்களை கருக விட வேண்டாம் — உணவு கசக்கும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Chicken", ta: "கோழி வேக வைத்தல்" },
          steps: [
            {
              step: 15,
              description: {
                en: "Add the ½ kg of cleaned chicken pieces. Sauté the chicken in this intense masala base for 5-10 minutes, turning often, so the meat firms up, changes color, and absorbs the flavours.",
                ta: "½ கிலோ சுத்தம் செய்த கோழி துண்டுகளை சேர்க்கவும். தீவிரமான இந்த மசாலா அடிப்படையில், அடிக்கடி புரட்டி, 5-10 நிமிடம் கோழியை வதக்கவும் — இறைச்சி இறுகி, நிறம் மாறி, சுவையை உள்ளீர்க்கும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Stir in the 100 ml of whisked curd gradually. Mix well until the masala turns uniform and glossy.",
                ta: "100 மிலி கடைந்த தயிரை மெதுவாக சேர்க்கவும். மசாலா சீராக மற்றும் பளபளப்பாக மாறும் வரை நன்கு கலக்கவும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "Pour in approximately 1.5 liters of water (1.5 L per 1 kg of Seeraga Samba — this is the Salem ratio). Add crystal salt to taste. Cover the vessel and let the chicken cook in the boiling broth until it is 80% tender — about 15-20 minutes.",
                ta: "சுமார் 1.5 லிட்டர் தண்ணீரை ஊற்றவும் (1 கிலோ சீரக சம்பாவுக்கு 1.5 லிட்டர் — இது சேலம் விகிதம்). தேவையான கல் உப்பு சேர்க்கவும். பாத்திரத்தை மூடி, கொதிக்கும் சாற்றில் கோழி 80% மிருதுவாகும் வரை — சுமார் 15-20 நிமிடம் — வேக விடவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Dum Process", ta: "தம் சமையல்" },
          steps: [
            {
              step: 18,
              description: {
                en: "Critical salt check: taste the boiling broth. It should taste DISTINCTLY salty — slightly saltier than a normal soup. The rice will absorb a lot of this salt as it cooks.",
                ta: "மிக முக்கியமான உப்பு சரிபார்ப்பு: கொதிக்கும் சாற்றை சுவைக்கவும். தெளிவாக உப்பு சுவை — சாதாரண சூப்பை விட சற்று அதிக உப்பு — இருக்க வேண்டும். அரிசி வேக வேக இந்த உப்பை நிறைய உள்ளீர்க்கும்.",
              },
            },
            {
              step: 19,
              description: {
                en: "Squeeze in the juice of half a lemon — this keeps the rice grains separate and brightens the entire flavour profile.",
                ta: "அரை எலுமிச்சையின் சாற்றை பிழியவும் — இது அரிசி தானியங்கள் ஒட்டாமல் தனித்தனியாக இருக்கவும், முழு சுவையையும் பிரகாசமாக்கவும் உதவும்.",
              },
            },
            {
              step: 20,
              description: {
                en: "Drain all the soaking water from the Seeraga Samba rice and gently add the rice to the rapidly boiling chicken broth. Mix once gently from the bottom — don't stir vigorously, you'll break the delicate small grains.",
                ta: "ஊறவைத்த சீரக சம்பா அரிசியின் தண்ணீரை முழுமையாக வடிக்கவும். கொதிக்கும் கோழி சாற்றில் அரிசியை மெதுவாக சேர்க்கவும். அடியிலிருந்து ஒரு முறை மெதுவாக கலக்கவும் — வேகமாக கிளற வேண்டாம், மென்மையான தானியங்கள் உடைந்துவிடும்.",
              },
            },
            {
              step: 21,
              description: {
                en: "Cook on medium-high flame, uncovered, until about 70-80% of the water is absorbed and the rice grains are visible at the surface — usually 8-12 minutes. This is the dum-ready signal.",
                ta: "மிதமான-உயர் தீயில் மூடாமல் வேக விடவும். சுமார் 70-80% தண்ணீர் உள்ளீர்க்கப்பட்டு, அரிசி தானியங்கள் மேற்பரப்பில் தெரிய ஆரம்பிக்கும் வரை — சுமார் 8-12 நிமிடம். இதுவே தம் வைக்க தயார் என்பதற்கான அடையாளம்.",
              },
            },
            {
              step: 22,
              description: {
                en: "Drizzle a little more ghee evenly over the top of the rice — this keeps the steam fragrant and adds richness. Lower the flame to the absolute minimum.",
                ta: "அரிசிக்கு மேலே சிறிது கூடுதல் நெய்யை சீராக ஊற்றவும் — இது ஆவியை வாசனை மிக்கதாக வைத்து, செழுமை சேர்க்கும். அடுப்பின் தீயை மிக குறைந்த அளவுக்கு குறைக்கவும்.",
              },
            },
            {
              step: 23,
              description: {
                en: "Seal the vessel tightly with a lid and place a heavy weight on top (or seal the edges with a roll of wheat dough). Leave it on dum for 15 to 20 minutes — undisturbed. No peeking; every escaping wisp of steam is lost flavour.",
                ta: "பாத்திரத்தை மூடியால் இறுக்கமாக மூடி, மேல் ஒரு கனமான பாரம் வைக்கவும் (அல்லது கோதுமை மாவு பிசைந்து ஓரத்தில் ஒட்டி காற்று வெளியேறாமல் முத்திரை இடவும்). 15 முதல் 20 நிமிடம் தம்மில் தொடாமல் வைக்கவும். எட்டிப்பார்க்க வேண்டாம்; வெளியேறும் ஒவ்வொரு ஆவி குமிழும் இழந்த சுவையே.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "Fluff and Serve", ta: "புரட்டி பரிமாறுதல்" },
          steps: [
            {
              step: 24,
              description: {
                en: "Turn off the stove and let the biryani rest with the lid still sealed for another 10 minutes — the trapped ghee aroma and steam settle into every grain.",
                ta: "அடுப்பை அணைக்கவும். மூடியை இறுக்கமாக மூடிய நிலையில் இன்னும் 10 நிமிடம் ஓய்வு கொடுக்கவும் — அடைபட்ட நெய் வாசனை மற்றும் ஆவி ஒவ்வொரு தானியத்திலும் நிலையாகும்.",
              },
            },
            {
              step: 25,
              description: {
                en: "Open the lid — the unmistakable Salem biryani aroma (floral mace + earthy kalpasi + caramelized onion + ghee) will fill the room. Using a flat ladle (not a spoon), gently fluff the rice from the edges toward the center — lift and turn, don't stir. This protects the delicate Seeraga Samba grains.",
                ta: "மூடியை திறக்கவும் — தனிச்சிறப்பான சேலம் பிரியாணி வாசனை (மலர் ஜாதிப்பத்திரி + மண் கல்பாசி + கருகிய வெங்காயம் + நெய்) அறை முழுவதும் பரவும். தட்டையான கரண்டியை (சாதாரண ஸ்பூன் வேண்டாம்) பயன்படுத்தி, ஓரங்களிலிருந்து மையம் நோக்கி மெதுவாக புரட்டவும் — தூக்கி திருப்புங்கள், கிளற வேண்டாம். இது மென்மையான சீரக சம்பா தானியங்களை காப்பாற்றும்.",
              },
            },
            {
              step: 26,
              description: {
                en: "Serve this incredibly fragrant, iconic Salem Biryani steaming hot with onion-mint raita and a spicy chicken side gravy. A wedge of lemon and a few pieces of caramelized onion fry on top complete the Windsor Castle presentation.",
                ta: "இந்த அற்புத வாசனை மிக்க, புகழ்பெற்ற சேலம் பிரியாணியை, வெங்காய-புதினா ரெய்தா மற்றும் ஒரு காரமான கோழி குழம்புடன் சூடாக பரிமாறவும். மேலே ஒரு துண்டு எலுமிச்சை மற்றும் சில கருகிய வெங்காய துண்டுகள் சேர்த்தால், விண்ட்சர் காசில் வழங்கல் முழுமை.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Salem Windsor Castle Biryani recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
