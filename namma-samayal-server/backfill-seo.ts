import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

/**
 * Backfills bilingual `seo: { title, description, keywords }` on every recipe.
 *
 * For the 22 recipes added/improved in this session, hand-curated bilingual
 * data is used (see CURATED below). For the 16 older recipes, SEO data is
 * derived automatically from existing dishName / description / searchKeywords.
 *
 * Idempotent — re-running re-applies the same values.
 */

interface SeoInput {
  titleEn: string;
  titleTa: string;
  descEn: string;   // ~120-160 chars, meta-description sized
  descTa: string;
  keywords: string[];
}

// Hand-curated SEO data, keyed by slug (post-rename slugs)
const CURATED: Record<string, SeoInput> = {
  "sundakkai-chutney": {
    titleEn: "Sundakkai Chutney (Turkey Berry Chutney)",
    titleTa: "சுண்டக்காய் சட்னி",
    descEn: "Erode Aaya's traditional Tamil Sundakkai (Turkey Berry) chutney — a bitter berry transformed into a delicious side dish, famous as a natural mouth & stomach ulcer remedy.",
    descTa: "ஈரோடு ஆயாவின் பாரம்பரிய சுண்டக்காய் சட்னி — கசப்பான சுண்டக்காயை ருசியான தொட்டுக்கொள்ளியாக மாற்றும், வாய்ப்புண் மற்றும் வயிற்றுப்புண்ணுக்கு பாரம்பரிய மருந்து.",
    keywords: ["sundakkai chutney", "turkey berry chutney", "சுண்டக்காய் சட்னி", "ulcer remedy", "tamil chutney", "erode aaya", "kongu chutney", "sundakkai thogayal"],
  },
  "meen-kuzhambu": {
    titleEn: "Meen Kuzhambu (Tamil Fish Curry)",
    titleTa: "மீன் குழம்பு",
    descEn: "Authentic Erode-style Tamil fish curry built on a 500g shallot + bloomed coriander powder base, finished in gingelly oil. Tastes even better the next day as 'pazhasu'.",
    descTa: "ஈரோடு ஆயாவின் அசலான தமிழ் மீன் குழம்பு — அரை கிலோ சின்ன வெங்காயம், கொத்தமல்லி தூள் அடிப்படையில் எள்ளெண்ணெயில் முடிக்கப்படுகிறது. மறுநாள் 'பழசு'வாக இன்னும் ருசி.",
    keywords: ["meen kuzhambu", "tamil fish curry", "மீன் குழம்பு", "kongu fish curry", "erode meen kuzhambu", "pazhasu", "naatu fish curry"],
  },
  "pallipalayam-pachai-milagai-chicken": {
    titleEn: "Pallipalayam Pachai Milagai Chicken (Green Chilli)",
    titleTa: "பல்லிப்பாளையம் பச்சை மிளகாய் சிக்கன்",
    descEn: "An Erode twist on the famous Pallipalayam chicken — uses ½ kg of green chillies instead of dry red, slow-sautéed in groundnut oil to mellow the heat. Kid-friendly aromatic roast.",
    descTa: "புகழ்பெற்ற பல்லிப்பாளையம் சிக்கனின் ஈரோடு பதிப்பு — காய்ந்த மிளகாய்க்கு பதிலாக அரை கிலோ பச்சை மிளகாய், கடலை எண்ணெயில் காரம் மென்மையாக்கி வறுக்கப்படுகிறது.",
    keywords: ["pallipalayam chicken", "pachai milagai chicken", "green chilli chicken", "பல்லிப்பாளையம் சிக்கன்", "kongu chicken roast", "nattu kozhi varuval"],
  },
  "chola-paniyaram": {
    titleEn: "Chola Paniyaram (Sorghum Millet Paniyaram)",
    titleTa: "சோள பணியாரம்",
    descEn: "Traditional Kongu millet paniyaram from soaked-and-fermented sorghum (cholam) + idli rice + urad. Crispy golden shells, soft airy centers. Highly digestible and 'count-less' light.",
    descTa: "கொங்கு பாரம்பரிய சோள பணியாரம் — சோளம், இட்லி அரிசி மற்றும் உளுந்தை ஊறவைத்து புளிக்க வைத்து செய்யப்படும். வெளியே மொறுமொறுப்பு, உள்ளே மென்மை. 'கணக்கு இல்லாம சாப்பிடலாம்'.",
    keywords: ["chola paniyaram", "sorghum paniyaram", "jowar paniyaram", "சோள பணியாரம்", "millet paniyaram", "kongu paniyaram", "siruthaniyam recipe"],
  },
  "pacha-payaru-kuzhambu": {
    titleEn: "Pacha Payaru Kuzhambu (Green Moong Dal Curry)",
    titleTa: "பச்சை பயறு குழம்பு",
    descEn: "Kongu Power-House green moong dal curry — built entirely on fresh whole spices, no masala powders. Boiled and mashed by 'mathu' (kadaisal) for natural creamy thickness.",
    descTa: "கொங்கு 'பவர் ஹவுஸ்' பச்சை பயறு குழம்பு — மசாலா தூள் இல்லாமல் முழு மசாலா கொண்டே, 'மத்து' கொண்டு கடைசல் முறையில் இயற்கையாக கெட்டியாக்கப்படுகிறது.",
    keywords: ["pacha payaru kuzhambu", "green moong dal curry", "பச்சை பயறு குழம்பு", "kadaisal", "kongu dal", "high protein vegan", "udal balame kuzhambu"],
  },
  "ennai-kathirikai-kuzhambu": {
    titleEn: "Ennai Kathirikai Kuzhambu (Oil Brinjal Gravy)",
    titleTa: "எண்ணெய் கத்திரிக்காய் குழம்பு",
    descEn: "Luxuriously oil-rich Kongu brinjal gravy — small purple brinjals 80%-fried in groundnut oil and simmered in a tangy shallot-tomato-tamarind base. The 'cook extra rice' kuzhambu.",
    descTa: "எண்ணெயில் செழுமையான கொங்கு கத்திரிக்காய் குழம்பு — கத்திரிக்காய் 80% வரை வறுத்து, புளி-வெங்காயம்-தக்காளி குழம்பில் வேக வைக்கப்படுகிறது. 'கூடுதல் சாதம் வடியுங்க' குழம்பு.",
    keywords: ["ennai kathirikai", "ennai kathirikai kuzhambu", "எண்ணெய் கத்திரிக்காய்", "kongu brinjal gravy", "kathirikai kuzhambu", "erode brinjal curry"],
  },
  "mutton-uppu-kari": {
    titleEn: "Mutton Uppu Kari (Salted Mutton Roast)",
    titleTa: "ஆட்டிறைச்சி உப்பு கறி",
    descEn: "Ancient Kongu mutton roast using only salt and deseeded dry red chillies — no masala powders, no tomatoes. Shallots caramelize into a glossy, dark glaze. The 'Virundhu' classic.",
    descTa: "பழமையான கொங்கு ஆட்டிறைச்சி வறுவல் — உப்பு மற்றும் விதை நீக்கிய காய்ந்த மிளகாய் மட்டுமே; எந்த மசாலா தூளும் இல்லை. சின்ன வெங்காயம் கருகி, பளபளக்கும் கறுப்பான கோட்டிங் ஆகும்.",
    keywords: ["mutton uppu kari", "salted mutton roast", "ஆட்டிறைச்சி உப்பு கறி", "kongu mutton", "erode virundhu mutton", "uppu kari"],
  },
  "home-style-naatu-kozhi-biryani": {
    titleEn: "Home-Style Naatu Kozhi Biryani (Country Chicken)",
    titleTa: "வீட்டு பாணி நாட்டு கோழி பிரியாணி",
    descEn: "Authentic Erode home-style country chicken biryani with Seeraga Samba rice cooked directly in naatu kozhi stock. No artificial colors, no ajinomoto — light and intensely fragrant.",
    descTa: "சீரக சம்பா அரிசியை நாட்டு கோழி சாற்றில் வேக வைத்து செய்யப்படும் ஈரோடு வீட்டு பாணி பிரியாணி. செயற்கை நிறம், அஜினோமோட்டோ எதுவும் இல்லை — இலகுவான வாசனை பிரியாணி.",
    keywords: ["naatu kozhi biryani", "country chicken biryani", "நாட்டு கோழி பிரியாணி", "seeraga samba biryani", "home style biryani", "erode biryani", "kongu biryani"],
  },
  "naatu-kozhi-kuzhambu": {
    titleEn: "Naatu Kozhi Kuzhambu (Country Chicken Gravy)",
    titleTa: "நாட்டு கோழி குழம்பு",
    descEn: "Legendary 49-year-old country chicken gravy from Muthu Mess, Chithode-Erode. Fire-charred whole bird, hand-roasted spices (¼ kg coriander seeds!), thin soupy Thanni Kuzhambu.",
    descTa: "சித்தோடு, ஈரோடின் முத்து மெஸ்ஸின் 49 ஆண்டுகள் பழமையான நாட்டு கோழி குழம்பு — தீயில் வாட்டிய முழு கோழி, புதிதாக வறுத்த மசாலா, மெல்லிய தண்ணி குழம்பு.",
    keywords: ["naatu kozhi kuzhambu", "country chicken gravy", "நாட்டு கோழி குழம்பு", "muthu mess", "thanni kuzhambu", "chithode", "kongu chicken curry"],
  },
  "bhai-veetu-biryani": {
    titleEn: "Bhai Veetu Biryani (Tamil Muslim Mutton Biryani)",
    titleTa: "பாய் வீட்டு மட்டன் பிரியாணி",
    descEn: "Tamil Muslim wedding-style mutton biryani built on the Bhai precision formula. Zero green chillies; vibrant red color from Kashmiri + standard chilli powders. Seeraga Samba dum.",
    descTa: "தமிழ் முஸ்லிம் கல்யாண பாணி பாய் வீட்டு பிரியாணி — பாய் அளவீட்டு சூத்திரத்தில். பச்சை மிளகாய் ஒரு துளி இல்லை; காஷ்மீர் மிளகாய் தூளில் சிவப்பு நிறம். சீரக சம்பா தம்.",
    keywords: ["bhai biryani", "bhai veetu biryani", "tamil muslim biryani", "kalyana biryani", "பாய் வீட்டு பிரியாணி", "mutton biryani", "kashmiri chilli biryani", "no green chilli biryani"],
  },
  "chinna-vengaya-kuzhambu": {
    titleEn: "Chinna Vengaya Kuzhambu (Shallot Tamarind Gravy)",
    titleTa: "சின்ன வெங்காய குழம்பு",
    descEn: "Tamil tamarind gravy with whole shallots slow-sautéed in gingelly oil until caramelized. The 'Moonu Velai' (all-three-meal) gravy that tastes even better aged as 'pazhasu'.",
    descTa: "சின்ன வெங்காயத்தை முழுதாக எள்ளெண்ணெயில் வதக்கி செய்யப்படும் தமிழ் புளி குழம்பு. 'மூணு வேளைக்கும் அருமையான குழம்பு' — பழசு ஆக ஆக இன்னும் ருசி.",
    keywords: ["chinna vengaya kuzhambu", "small onion kuzhambu", "shallot tamarind gravy", "சின்ன வெங்காய குழம்பு", "vengaya puli kuzhambu", "kongu kuzhambu", "pazhasu kuzhambu"],
  },
  "paruppu-thuvayal": {
    titleEn: "Paruppu Thuvayal (Toor Dal Chutney)",
    titleTa: "பருப்பு துவையல்",
    descEn: "Forgotten Kongu classic — a thick rustic toor dal chutney from kurunai (broken dal). Eat with hot rice + ghee for kids, raw cold-pressed groundnut oil for elders.",
    descTa: "மறக்கப்பட்ட கொங்கு கிளாசிக் — உடைந்த துவரம் பருப்பு (குருணை) கொண்டு செய்யப்படும் கெட்டியான துவையல். குழந்தைகளுக்கு நெய்யுடன், பெரியவர்களுக்கு பச்சை மரச்செக்கு எண்ணெயுடன்.",
    keywords: ["paruppu thuvayal", "paruppu thogayal", "toor dal chutney", "பருப்பு துவையல்", "kurunai thuvayal", "kongu thuvayal", "erode aaya thuvayal"],
  },
  "vayirukku-idhama-biryani": {
    titleEn: "Vayirukku Idhama Naatu Kozhi Biryani",
    titleTa: "வயிற்றுக்கு இதமா நாட்டு கோழி பிரியாணி",
    descEn: "Thottathu Virundhu's 15-year-old 'stomach-soothing' country chicken biryani. Pre-marinated naatu kozhi + double-ghee technique for zero heartburn, deep ghee aroma.",
    descTa: "தோட்டத்து விருந்தின் 15 ஆண்டுகள் பழமையான 'வயிற்றுக்கு இதமா' நாட்டு கோழி பிரியாணி — முன்-மரினேட் + இரட்டை-நெய் நுட்பத்தில். நெஞ்செரிச்சல் இல்லாத பிரியாணி.",
    keywords: ["vayirukku idhama biryani", "thottathu virundhu biryani", "stomach soothing biryani", "வயிற்றுக்கு இதமா பிரியாணி", "naatu kozhi biryani", "kavithamani akka", "pre marinated biryani", "double ghee biryani"],
  },
  "soya-sukka": {
    titleEn: "Soya Sukka (Mutton-Defeating Soya Varattu)",
    titleTa: "சோயா சுக்கா (சோயா வரட்டு)",
    descEn: "100% vegetarian Soya Sukka from Sri Janani Catering — Kerala Meat Varattu-inspired. Squeeze-dry soya + dark caramelized onions + mint trap the masala inside every chunk.",
    descTa: "ஸ்ரீ ஜனனி கேட்டரிங்கின் 100% சைவ சோயா சுக்கா — கேரள மீட் வரட்டியதின் ஊக்கத்தில். கசக்கி வடித்த சோயா + கருகிய வெங்காயம் + புதினா; ஒவ்வொரு துண்டிலும் மசாலா உள்ளே சிக்குகிறது.",
    keywords: ["soya sukka", "soya varattu", "soya chunks recipe", "சோயா சுக்கா", "சோயா வரட்டு", "meal maker sukka", "vegetarian mutton sukka", "kerala varattiyathu soya", "high protein veg"],
  },
  "mushroom-pallipalayam": {
    titleEn: "Mushroom Pallipalayam (Vegetarian)",
    titleTa: "காளான் பல்லிப்பாளையம்",
    descEn: "100% vegetarian Pallipalayam roast from Maanthoppu Virundhu — button mushrooms + shallots + dry chillies + sambar powder cooked no-water in their own juices. Crunchy coconut.",
    descTa: "மான்தோப்பு விருந்தின் 100% சைவ பல்லிப்பாளையம் — காளான், சின்ன வெங்காயம், காய்ந்த மிளகாய், சாம்பார் தூள் — காளானின் சொந்த சாற்றிலேயே வேக வைக்கப்படுகிறது. கொறுகொறு தேங்காய்.",
    keywords: ["mushroom pallipalayam", "kalaan pallipalayam", "vegetarian pallipalayam", "காளான் பல்லிப்பாளையம்", "mushroom varuval", "veg pallipalayam", "kongu mushroom recipe"],
  },
  "thengai-poondu-podi": {
    titleEn: "Thengai Poondu Podi (Coconut Garlic Podi)",
    titleTa: "தேங்காய் பூண்டு பொடி",
    descEn: "Zero-stove 'fireless' Kongu podi from Thottathu Virundhu. Just dry copra + raw garlic + chillies + salt pulsed in a bone-dry mixer. Ready in 4 minutes; served with raw gingelly oil.",
    descTa: "தோட்டத்து விருந்தின் அடுப்பு இல்லாத கொங்கு பொடி — கொப்பரை + பச்சை பூண்டு + மிளகாய் + உப்பு வறண்ட மிக்ஸியில் பல்ஸ். 4 நிமிடத்தில் தயார்; பச்சை எள்ளெண்ணெயுடன் பரிமாறவும்.",
    keywords: ["thengai poondu podi", "coconut garlic podi", "no cook podi", "தேங்காய் பூண்டு பொடி", "fireless podi", "kopparai podi", "instant podi", "dosa side podi", "idicha podi"],
  },
  "pachai-milagai-chicken": {
    titleEn: "Pachai Milagai Chicken (Green Chilli Chicken)",
    titleTa: "பச்சை மிளகாய் சிக்கன்",
    descEn: "Maanthoppu Virundhu's minimal 4-ingredient Kongu chicken roast. No masala powders, no tomatoes. Hybrid green chillies (NOT Neela Milagai) form the entire green-tinted thokku.",
    descTa: "மான்தோப்பு விருந்தின் வெறும் 4 பொருள் கொண்ட எளிமையான கொங்கு கோழி வறுவல். மசாலா தூள், தக்காளி எதுவும் இல்லை. ஹைப்ரிட் பச்சை மிளகாய் (நீள மிளகாய் வேண்டாம்) இயற்கையான தொக்கு உருவாக்கும்.",
    keywords: ["pachai milagai chicken", "green chilli chicken", "பச்சை மிளகாய் சிக்கன்", "kongu chicken roast", "maanthoppu virundhu chicken", "hybrid chilli chicken", "minimal ingredient chicken"],
  },
  "porichi-kotuna-paruppu-kuzhambu": {
    titleEn: "Porichi Kotuna Paruppu Kuzhambu (Quick Dal Gravy)",
    titleTa: "பொரிச்சி கொட்டின பருப்பு குழம்பு",
    descEn: "Thottathu Virundhu's 4-ingredient lifesaver dal gravy. Boil dal on one burner, build a spicy onion-tomato-tamarind tempering on another, then pour ('kotuna') the hot tempering in.",
    descTa: "தோட்டத்து விருந்தின் 4-பொருள் வாழ்வு-காப்பாளர் பருப்பு குழம்பு — ஒரு அடுப்பில் பருப்பு, மற்றொன்றில் காரமான வெங்காயம்-தக்காளி-புளி தாளிப்பு; சூடான தாளிப்பை பருப்பில் கொட்டினதே.",
    keywords: ["porichi kotuna paruppu", "paruppu kuzhambu", "quick dal gravy", "பொரிச்சி கொட்டின பருப்பு", "no sambar powder dal", "4 ingredient kuzhambu", "weeknight dal", "thottathu virundhu paruppu"],
  },
  "pottu-kadalai-kuzhambu": {
    titleEn: "Pottu Kadalai Kuzhambu (Roasted Gram Tomato Gravy)",
    titleTa: "பொட்டுக்கடலை குழம்பு",
    descEn: "Thottathu Virundhu's tiffin-shop secret weapon — velvety tomato gravy thickened with ground pottu kadalai (roasted gram) instead of dal/coconut. Light, smooth, and gut-friendly.",
    descTa: "தோட்டத்து விருந்தின் டிஃபன் கடை ரகசிய ஆயுதம் — பருப்பு/தேங்காய்க்கு பதிலாக அரைத்த பொட்டுக்கடலை கொண்டு வெல்வெட் பதம் கொடுக்கப்பட்ட தக்காளி குழம்பு. வயிற்றுக்கு இலகுவானது.",
    keywords: ["pottu kadalai kuzhambu", "roasted gram gravy", "fried gram kuzhambu", "பொட்டுக்கடலை குழம்பு", "tiffin shop kuzhambu", "tomato gravy", "no coconut kuzhambu", "no dal kuzhambu"],
  },
  "karuveppilai-thokku": {
    titleEn: "Karuveppilai Thokku (Curry Leaves Chutney)",
    titleTa: "கருவேப்பிலை தொக்கு",
    descEn: "Erode Aaya's traditional summer curry-leaves chutney. Heavy cumin = zero heartburn; no urad dal (forbidden — turns slimy). Iron-rich, hair-fall remedy. Eat with hot rice + gingelly oil.",
    descTa: "ஈரோடு ஆயாவின் பாரம்பரிய கோடைகால கருவேப்பிலை சட்னி. அதிக சீரகம் = நெஞ்செரிச்சல் இல்லை; உளுந்து கட்டாயம் வேண்டாம் (வளவளப்பாக்கும்). இரும்புச்சத்து, தலைமுடி மருந்து.",
    keywords: ["karuveppilai thokku", "curry leaves chutney", "கருவேப்பிலை தொக்கு", "summer chutney", "hair fall remedy", "iron rich chutney", "no urad dal thokku", "erode aaya thokku", "kongu thokku"],
  },
  "thakkali-mozhagu-aracha-kuzhambu": {
    titleEn: "Thakkali Mozhagu Aracha Kuzhambu (Tomato 'Kuruma')",
    titleTa: "தக்காளி மிளகு அரைச்ச குழம்பு",
    descEn: "Thottathu Virundhu's tomato gravy that tastes like a non-veg kuruma — secret is whole spices + poppy seeds (kasagasa) in the aracha base. 3-meal champion; pour over hot idlies.",
    descTa: "தோட்டத்து விருந்தின் தக்காளி குழம்பு — அசைவ குருமா போல சுவை. ரகசியம், அரைப்பு அடிப்படையில் முழு மசாலா + கசகசா. '3-வேளை சாம்பியன்' — சூடான இட்லியில் ஊற்றி ஊறவைத்து சாப்பிடவும்.",
    keywords: ["thakkali kuzhambu", "thakkali mozhagu aracha kuzhambu", "tomato kuruma gravy", "தக்காளி குழம்பு", "kuruma illusion", "kushboo idli kuzhambu", "kasagasa thakkali", "kongu tomato gravy", "naatu thakkali kuzhambu"],
  },
  "pichipotta-naatu-kozhi": {
    titleEn: "Pichipotta Naatu Kozhi (Shredded Country Chicken)",
    titleTa: "பிச்சிப்போட்ட நாட்டு கோழி",
    descEn: "Maanthoppu Virundhu's signature semi-dry shredded country chicken — boiled, hand-torn, then slow-cooked back in its own stock with eggs scrambled in. ~10 kg sold daily.",
    descTa: "மான்தோப்பு விருந்தின் தனிச்சிறப்பான அரை-உலர் பிய்த்த நாட்டு கோழி — வேக வைத்து, கையால் பிய்த்து, அதே சாற்றில் முட்டையுடன் வறுக்கப்படுகிறது. தினமும் ~10 கிலோ விற்பனை.",
    keywords: ["pichipotta naatu kozhi", "shredded country chicken", "பிச்சிப்போட்ட நாட்டு கோழி", "maanthoppu virundhu chicken", "egg chicken roast", "kongu chicken varuval", "naatu kozhi pichipotta"],
  },
};

function deriveSeoFromExisting(recipe: any): SeoInput {
  // Auto-derivation for older recipes that don't have curated SEO data.
  const cleanTitle = (s: string): string => {
    // Strip overly long prefixes / parentheticals if title > 80 chars
    let t = (s || "").replace(/\s+/g, " ").trim();
    if (t.length <= 80) return t;
    const sansParen = t.replace(/\s*\([^)]*\)\s*$/, "").trim();
    return sansParen.length > 0 && sansParen.length <= 80 ? sansParen : t.slice(0, 77).trim() + "...";
  };
  const truncate = (s: string, n: number): string => {
    const t = (s || "").replace(/\s+/g, " ").trim();
    if (t.length <= n) return t;
    const cut = t.slice(0, n);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim() + "…";
  };

  const titleEn = cleanTitle(recipe.dishName?.en || recipe.slug || "");
  const titleTa = (recipe.dishName?.ta || "").trim();
  const descEn = truncate(recipe.description?.en || "", 160);
  const descTa = truncate(recipe.description?.ta || "", 160);

  const keywordSet = new Set<string>();
  (recipe.searchKeywords || []).forEach((k: string) => k && keywordSet.add(k.trim()));
  (recipe.tags || []).forEach((t: string) => t && keywordSet.add(t.replace(/-/g, " ").trim()));
  if (recipe.dishName?.en) keywordSet.add(recipe.dishName.en);
  if (recipe.dishName?.ta) keywordSet.add(recipe.dishName.ta);
  if (recipe.location?.city) keywordSet.add(`${recipe.location.city} recipe`);
  if (recipe.location?.region) keywordSet.add(`${recipe.location.region} recipe`);

  return {
    titleEn,
    titleTa,
    descEn,
    descTa,
    keywords: Array.from(keywordSet).filter(Boolean).slice(0, 20),
  };
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const all = await Recipe.find().lean();
  console.log(`Found ${all.length} recipes. Backfilling SEO...\n`);

  let curated = 0;
  let derived = 0;
  let skipped = 0;

  for (const r of all) {
    const recipe = await Recipe.findById(r._id);
    if (!recipe) {
      skipped += 1;
      continue;
    }

    const slug = recipe.slug;
    const isCurated = !!CURATED[slug];
    const seo: SeoInput = isCurated ? CURATED[slug] : deriveSeoFromExisting(r);

    recipe.seo = {
      title: { en: seo.titleEn, ta: seo.titleTa || undefined },
      description: { en: seo.descEn, ta: seo.descTa || undefined },
      keywords: seo.keywords && seo.keywords.length ? seo.keywords : undefined,
    };

    await recipe.save();
    if (isCurated) {
      curated += 1;
      console.log(`  [CURATED]  ${slug}`);
      console.log(`     title.en: ${seo.titleEn}`);
      console.log(`     title.ta: ${seo.titleTa}`);
    } else {
      derived += 1;
      console.log(`  [DERIVED]  ${slug}`);
      console.log(`     title.en: ${seo.titleEn}`);
      console.log(`     title.ta: ${seo.titleTa || "(none)"}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Curated: ${curated}`);
  console.log(`  Derived: ${derived}`);
  console.log(`  Skipped: ${skipped}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
