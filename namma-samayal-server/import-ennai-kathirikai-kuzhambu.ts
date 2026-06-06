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
  { slug: "brinjal", name: "Brinjal (Small Purple Kathirikai)", ta: "கத்திரிக்காய்", quantity: "1", unit: "kg" },
  { slug: "small-onion-shallots", name: "Small Onion (Shallots)", ta: "சின்ன வெங்காயம்", quantity: "500", unit: "g" },
  { slug: "garlic", name: "Garlic", ta: "பூண்டு", quantity: "10", unit: "cloves" },
  { slug: "tomato", name: "Tomato", ta: "தக்காளி", quantity: "3", unit: "nos" },
  { slug: "tamarind", name: "Tamarind", ta: "புளி", quantity: "1", unit: "lemon-sized ball" },
  { slug: "red-chilli-powder", name: "Red Chilli Powder", ta: "மிளகாய் தூள்", quantity: "4", unit: "tsp" },
  { slug: "coriander-powder", name: "Coriander Powder (or Kongu Kuzhambu Thool)", ta: "கொத்தமல்லி தூள் (அல்லது கொங்கு குழம்பு தூள்)", quantity: "50", unit: "g" },
  { slug: "turmeric-powder", name: "Turmeric Powder", ta: "மஞ்சள் தூள்", quantity: "1", unit: "tsp" },
  { slug: "green-chilli", name: "Green Chilli", ta: "பச்சை மிளகாய்", quantity: "4", unit: "nos (slit)" },
  { slug: "mustard-seeds", name: "Mustard Seeds", ta: "கடுகு", quantity: "1", unit: "tsp" },
  { slug: "cinnamon", name: "Cinnamon", ta: "இலவங்கப்பட்டை", quantity: "2", unit: "small pieces" },
  { slug: "cloves", name: "Cloves", ta: "கிராம்பு", quantity: "2", unit: "nos" },
  { slug: "curry-leaves", name: "Curry Leaves", ta: "கருவேப்பிலை", quantity: "1", unit: "generous handful" },
  { slug: "groundnut-oil", name: "Groundnut Oil", ta: "கடலை எண்ணெய்", quantity: "very generous", unit: "(critical for the 'Ennai' in Ennai Kathirikai)" },
  { slug: "crystal-salt", name: "Crystal Salt", ta: "கல் உப்பு", quantity: "to taste", unit: "" },
];

async function seedRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-kongu-ennai-kathirikai-kuzhambu";
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
        en: "Erode Kongu-Style Ennai Kathirikai Kuzhambu (Oil Brinjal Gravy)",
        ta: "ஈரோடு கொங்கு எண்ணெய் கத்திரிக்காய் குழம்பு",
      },
      slug,
      description: {
        en: "A luxuriously oil-rich Kongu-region brinjal gravy where small purple brinjals are slit (with the crown intact), 80% pre-fried in pure groundnut oil, then simmered briefly in a deeply tangy, spicy shallot-tomato-tamarind base. The brinjals soak in all the juices while keeping their shape — and so much groundnut oil floats on top that the dish is literally named 'Ennai' (oil) Kathirikai. Famously known as the 'cook extra rice' gravy of the Erode belt.",
        ta: "சின்ன ஊதா கத்திரிக்காயை காம்பு இணைந்த நிலையில் கீறி, தூய கடலை எண்ணெயில் 80% வரை வறுத்து, கெட்டியான புளி-வெங்காயம்-தக்காளி குழம்பில் சேர்த்து வேக வைக்கப்படும் கொங்கு பாரம்பரிய கத்திரிக்காய் குழம்பு. கத்திரிக்காய் ருசியை உள்ளீர்த்து, ஆனாலும் உருவம் மாறாமல் இருக்கும். மேலே நிறைய கடலை எண்ணெய் தனியாக மிதக்கும் — அதனால்தான் 'எண்ணெய் கத்திரிக்காய்' என்று பெயர். ஈரோடு பகுதியில் 'கூடுதல் சாதம் வடியுங்க' குழம்பு என்றே பிரபலம்.",
      },
      speciality: {
        en: "Three Kongu secrets define this dish: (1) The 80% fry rule — brinjals are fried whole-with-stem for only 5-6 minutes in groundnut oil until colored but not mushy, then removed; finished only at the end so they hold shape. (2) Generous groundnut oil — not a flavoring, the main carrier; the 'ennai' floating on top at the end is the visual proof the dish is done. (3) Traditional 'Kongu Kuzhambu Thool' — a household roasted-dal-and-spice blend specific to the Erode belt that gives the real village taste (coriander powder is a fine modern substitute).",
        ta: "மூன்று கொங்கு ரகசியங்கள்: (1) 80% வறுக்கும் விதி — கத்திரிக்காயை காம்பு இணைந்த நிலையில் கடலை எண்ணெயில் வெறும் 5-6 நிமிடம், நிறம் மாறும் வரை மட்டும் வறுத்து எடுத்து வைக்க வேண்டும்; கடைசியில் மட்டுமே குழம்பில் சேர்க்க வேண்டும், அதனால் உருவம் கெடாது. (2) தாராளமான கடலை எண்ணெய் — இது சுவைக்கான சேர்க்கையல்ல, முக்கிய ஊடகம்; கடைசியில் மேலே தனியாக மிதக்கும் 'எண்ணெய்'தான் குழம்பு தயார் என்பதற்கு அடையாளம். (3) பாரம்பரிய 'கொங்கு குழம்பு தூள்' — ஈரோடு பகுதியின் வீட்டு வறுத்த பருப்பு-மசாலா கலவை, அதுவே உண்மையான கிராமத்து ருசியை தரும் (கொத்தமல்லி தூள் நவீன மாற்று).",
      },
      location: {
        country: "India",
        state: "Tamil Nadu",
        region: "Kongu",
        city: "Erode",
      },
      prepTime: 15,
      cookingTime: 35,
      totalTime: 50,
      servings: 6,
      difficulty: "medium",
      source: "youtube",
      recipeSource: {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=oQXXLxX1Abw",
      },
      tags: [
        "veg",
        "vegan",
        "gravy",
        "kuzhambu",
        "brinjal",
        "kathirikai",
        "eggplant",
        "ennai-kathirikai",
        "oil-gravy",
        "erode",
        "kongu",
        "tamil-nadu",
        "traditional",
        "spicy",
        "tangy",
        "rice-side",
      ],
      searchKeywords: [
        "ennai kathirikai",
        "ennai kathirikai kuzhambu",
        "oil brinjal gravy",
        "kongu kathirikai",
        "kathirikai kuzhambu",
        "எண்ணெய் கத்திரிக்காய்",
        "கத்திரிக்காய் குழம்பு",
        "erode brinjal gravy",
        "chef deena ennai kathirikai",
        "kongu kuzhambu thool",
        "cook extra rice gravy",
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
                en: "Wash the small purple brinjals. Slit each one lengthwise into 4 sections by cutting from the bottom upward, stopping just before the crown — the stem must hold all 4 sections together. This is critical so they don't fall apart in the gravy.",
                ta: "சின்ன ஊதா கத்திரிக்காயை கழுவவும். ஒவ்வொன்றையும் அடியிலிருந்து மேல் நோக்கி நீளவாக்கில் 4 பகுதிகளாக கீறவும் — காம்பின் முடிவுக்கு முன்பு நிறுத்தவும், காம்பு நான்கு பகுதிகளையும் இணைத்து வைத்திருக்க வேண்டும். இது மிக முக்கியம், இல்லையென்றால் குழம்பில் உடைந்து விடும்.",
              },
            },
            {
              step: 2,
              description: {
                en: "Soak the lemon-sized ball of tamarind in warm water for 10-15 minutes, then squeeze and extract a thick juice. Discard fibre and seeds. Set aside.",
                ta: "எலுமிச்சை அளவு புளியை சூடான தண்ணீரில் 10-15 நிமிடம் ஊறவைத்து, கசக்கி கெட்டியான புளிக்கரைசலை எடுக்கவும். நார் மற்றும் விதைகளை நீக்கி தனியாக வைக்கவும்.",
              },
            },
            {
              step: 3,
              description: {
                en: "Peel the small onions and keep them whole. Peel the garlic cloves. Roughly chop the tomatoes. Slit the green chillies lengthwise.",
                ta: "சின்ன வெங்காயத்தை தோல் சீவி முழுதாக வைக்கவும். பூண்டை தோல் சீவவும். தக்காளியை பெரிய துண்டுகளாக நறுக்கவும். பச்சை மிளகாயை நீளவாக்கில் கீறவும்.",
              },
            },
          ],
        },
        {
          type: "frying",
          title: { en: "Frying the Brinjals (80% Rule)", ta: "கத்திரிக்காய் வறுத்தல் (80% விதி)" },
          steps: [
            {
              step: 4,
              description: {
                en: "Heat a very generous amount of groundnut oil in a heavy-bottomed kadai or clay pot (manchatti). The oil should be enough to half-submerge the brinjals — this is 'Ennai' Kathirikai, not a dry sauté.",
                ta: "ஒரு தடிமனான கடாய் அல்லது மண்சட்டியில் தாராளமான கடலை எண்ணெய் சூடாக்கவும். கத்திரிக்காய் பாதி மூழ்கும் அளவு எண்ணெய் தேவை — இது 'எண்ணெய்' கத்திரிக்காய், காய்ந்த வதக்கு அல்ல.",
              },
            },
            {
              step: 5,
              description: {
                en: "Once the oil is hot, gently drop the slit brinjals in. Fry them continuously for 5 to 6 minutes, turning them occasionally so they color evenly on all sides.",
                ta: "எண்ணெய் நன்கு சூடாகும் போது, கீறிய கத்திரிக்காயை மெதுவாக சேர்க்கவும். 5-6 நிமிடம் தொடர்ந்து வறுக்கவும், எல்லா பக்கங்களிலும் சமமாக நிறம் வர அவ்வப்போது புரட்டவும்.",
              },
            },
            {
              step: 6,
              description: {
                en: "Critical 80% rule: the brinjals must change color and be roughly 80% cooked — NOT completely soft and mushy (kolakola-nnu). They should still hold firm shape when you press them. Remove them from the oil promptly and set aside on a plate. Keep the oil in the pan.",
                ta: "மிக முக்கியமான 80% விதி: கத்திரிக்காய் நிறம் மாறி, சுமார் 80% மட்டுமே வேக வேண்டும் — முற்றிலும் குழைய (கொலகொலன்னு) கூடாது. அழுத்தினால் இறுக்கமாக இருக்க வேண்டும். உடனே எண்ணெயிலிருந்து எடுத்து தனியாக வைக்கவும். எண்ணெயை கடாயிலேயே வைக்கவும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "The Base Sauté", ta: "அடிக்கூட்டு வதக்கல்" },
          steps: [
            {
              step: 7,
              description: {
                en: "In the exact same oil left in the pan, add the mustard seeds and let them splutter. Immediately add the cinnamon pieces and cloves — they will bloom in the hot oil.",
                ta: "கடாயில் மீதமுள்ள அதே எண்ணெயில், கடுகு சேர்த்து வெடிக்க விடவும். உடனே இலவங்கப்பட்டை மற்றும் கிராம்பு சேர்க்கவும் — சூடான எண்ணெயில் வாசனை வெளிப்படும்.",
              },
            },
            {
              step: 8,
              description: {
                en: "Toss in the full ½ kg of peeled whole small onions, the 10 garlic cloves, the slit green chillies, and the generous handful of fresh curry leaves.",
                ta: "தோல் சீவிய முழு அரை கிலோ சின்ன வெங்காயம், 10 பூண்டு பற்கள், கீறிய பச்சை மிளகாய் மற்றும் தாராளமான கருவேப்பிலையை சேர்க்கவும்.",
              },
            },
            {
              step: 9,
              description: {
                en: "Sauté everything patiently on a medium flame until the small onions turn a deep, sweet golden brown. Don't rush this — the caramelized shallots are the sweet backbone of the gravy.",
                ta: "மிதமான தீயில் பொறுமையாக வதக்கவும் — சின்ன வெங்காயம் ஆழமான, இனிமையான பொன்னிற பழுப்பாகும் வரை. அவசரப்பட வேண்டாம் — இந்த இனிப்பு வேக்கப்பட்ட சின்ன வெங்காயம்தான் குழம்பின் சுவை அடித்தளம்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Cooking the Tomatoes & Spices", ta: "தக்காளி மற்றும் மசாலா சேர்த்தல்" },
          steps: [
            {
              step: 10,
              description: {
                en: "Add the chopped tomatoes. Add the crystal salt at this stage — salt draws moisture from the tomatoes and helps them break down faster.",
                ta: "நறுக்கிய தக்காளியை சேர்க்கவும். இந்த நேரத்தில் கல் உப்பை சேர்க்கவும் — உப்பு தக்காளியிலிருந்து நீரை வெளியேற்றி, விரைவாக குழைய உதவும்.",
              },
            },
            {
              step: 11,
              description: {
                en: "Sauté continuously on a medium flame until the tomatoes completely dissolve into a thick, mushy paste — no visible chunks should remain.",
                ta: "மிதமான தீயில் தொடர்ந்து வதக்கவும். தக்காளி முற்றிலும் குழைந்து கெட்டியான விழுதாக மாற வேண்டும் — பெரிய துண்டுகள் இருக்கக்கூடாது.",
              },
            },
            {
              step: 12,
              description: {
                en: "Lower the heat. Add the 1 tsp turmeric powder, 4 tsp red chilli powder, and 50g coriander powder (or homemade Kongu Kuzhambu Thool). Sauté the dry spices in the oil for about a minute — until the raw smell fades and the oil starts separating at the edges. Critical: don't burn the powders or the gravy will turn bitter.",
                ta: "தீயை குறைக்கவும். 1 ஸ்பூன் மஞ்சள் தூள், 4 ஸ்பூன் மிளகாய் தூள் மற்றும் 50 கிராம் கொத்தமல்லி தூள் (அல்லது வீட்டு கொங்கு குழம்பு தூள்) சேர்க்கவும். எண்ணெயில் தூள்களை சுமார் ஒரு நிமிடம் வதக்கவும் — பச்சை வாசனை போய், ஓரத்தில் எண்ணெய் பிரிய ஆரம்பிக்கும் வரை. மிக முக்கியம்: தூள்களை கருக விட வேண்டாம், இல்லையென்றால் குழம்பு கசக்கும்.",
              },
            },
          ],
        },
        {
          type: "cooking",
          title: { en: "Building the Kuzhambu", ta: "குழம்பு கட்டமைத்தல்" },
          steps: [
            {
              step: 13,
              description: {
                en: "Pour the thick tamarind extract into the pan. Add a little water — just enough to bring it to a proper kuzhambu consistency. This dish should remain relatively thick, not watery.",
                ta: "கெட்டியான புளிக்கரைசலை கடாயில் ஊற்றவும். சரியான குழம்பு பதம் வர சிறிதளவு தண்ணீர் சேர்க்கவும். இந்த உணவு சற்று கெட்டியாகவே இருக்க வேண்டும், மிகவும் நீர்த்திருக்கக்கூடாது.",
              },
            },
            {
              step: 14,
              description: {
                en: "Stir well, cover the pan, and let it come to a rolling boil. Boil for 8-10 minutes until the raw sharp smell of the tamarind completely disappears and the gravy thickens slightly.",
                ta: "நன்கு கலந்து, பாத்திரத்தை மூடி, நன்கு கொதிக்க விடவும். புளியின் பச்சை கடுமையான வாசனை முற்றிலும் போய், குழம்பு லேசாக கெட்டியாகும் வரை 8-10 நிமிடம் கொதிக்க விடவும்.",
              },
            },
          ],
        },
        {
          type: "finishing",
          title: { en: "The Final Simmer", ta: "இறுதி கொதிநிலை" },
          steps: [
            {
              step: 15,
              description: {
                en: "Gently drop the 80% fried brinjals back into the boiling gravy. Slide them in carefully — do not stir vigorously, you'll break them.",
                ta: "80% வரை வறுத்த கத்திரிக்காயை கொதிக்கும் குழம்பில் மெதுவாக சேர்க்கவும். கவனமாக நழுவ விடவும் — வேகமாக கிளற வேண்டாம், கத்திரிக்காய் உடைந்துவிடும்.",
              },
            },
            {
              step: 16,
              description: {
                en: "Turn the heat down to low, cover the pan, and let it simmer for 5 to 8 minutes. The brinjals will finish their last 20% of cooking by absorbing the tangy-spicy gravy.",
                ta: "தீயை குறைத்து, மூடி வைத்து 5 முதல் 8 நிமிடம் மெதுவாக கொதிக்க விடவும். கத்திரிக்காய் இறுதி 20% பாகத்தை, புளி-காரம் கொண்ட குழம்பை உள்ளீர்த்து வேக வைக்கும்.",
              },
            },
            {
              step: 17,
              description: {
                en: "The dish is done when the brinjals are completely tender (but still hold their slit-with-crown shape) and a thick, beautiful layer of groundnut oil floats to the surface. That floating 'ennai' layer is the visual proof — without it, you haven't used enough oil.",
                ta: "கத்திரிக்காய் முற்றிலும் மிருதுவாகி (ஆனாலும் காம்புடன் கீறிய உருவம் கெடாமல்), மேலே கெட்டியான அழகான கடலை எண்ணெய் அடுக்கு தனியாக மிதக்கும் போது — உணவு தயார். மேலே மிதக்கும் 'எண்ணெய்' அடுக்குதான் இதன் அடையாளம் — அது இல்லையென்றால், போதிய எண்ணெய் சேர்க்கவில்லை என்று அர்த்தம்.",
              },
            },
            {
              step: 18,
              description: {
                en: "Turn off the heat. Let it rest for at least 10-15 minutes before serving — like all kuzhambus, the flavors deepen dramatically as it rests. Serve piping hot with — as the title warns — an extra large serving of steamed white rice and a little ghee on top.",
                ta: "அடுப்பை அணைக்கவும். பரிமாறும் முன் குறைந்தது 10-15 நிமிடம் ஆற விடவும் — அனைத்து குழம்புகளையும் போல, ஓய்வு நேரத்தில் சுவை பல மடங்கு ஆழமாக மாறும். வீடியோ எச்சரிக்கும் படி, கூடுதலாக வடித்த சூடான வெள்ளை சாதம் மற்றும் சிறிது நெய்யுடன் சூடாக பரிமாறவும்.",
              },
            },
          ],
        },
      ],
    });

    await newRecipe.save();
    console.log(`Ennai Kathirikai Kuzhambu recipe created successfully! _id=${newRecipe._id}`);
  } catch (error) {
    console.error("Error seeding recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

seedRecipe();
