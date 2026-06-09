import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

interface SeoPatch {
  slug: string;
  title: { en: string; ta: string };
  description: { en: string; ta: string };
  keywords: string[];
}

const PATCHES: SeoPatch[] = [
  // ============================================================
  // 8 recipes with NO SEO — fresh, clean content
  // ============================================================
  {
    slug: "salem-windsor-castle-biryani",
    title: {
      en: "Salem Chicken Biryani (Authentic Tamil Nadu Style)",
      ta: "சேலம் சிக்கன் பிரியாணி",
    },
    description: {
      en: "Authentic Salem-style chicken biryani built on the famous 'double masala' technique — a freshly dry-roasted Salem biryani masala blended with a wet onion-tomato-spice paste. Made with seeraga samba rice for a deep, layered, aromatic biryani that's signature Tamil Nadu.",
      ta: "சேலம் பாணி சிக்கன் பிரியாணி — பிரபலமான 'இரட்டை மசாலா' நுட்பம்: வறுத்து அரைத்த சேலம் பிரியாணி மசாலா + ஈரமான வெங்காயம்-தக்காளி-மசாலா விழுது. சீரக சம்பா அரிசியில் ஆழ்ந்த, அடுக்கான வாசனை — தனித்துவமான தமிழ்நாடு பிரியாணி.",
    },
    keywords: [
      "salem chicken biryani",
      "salem biryani",
      "tamil nadu chicken biryani",
      "double masala biryani",
      "seeraga samba chicken biryani",
      "சேலம் சிக்கன் பிரியாணி",
      "சேலம் பிரியாணி",
      "தமிழ்நாடு பிரியாணி",
      "authentic salem biryani",
      "chicken biryani recipe",
    ],
  },
  {
    slug: "organic-chola-santhagai",
    title: {
      en: "Sorghum Santhagai (Sprouted Cholam String Hoppers, Sweet & Savory)",
      ta: "சோள சந்தகை (முளைகட்டிய சோள இடியாப்பம், இனிப்பு + காரம்)",
    },
    description: {
      en: "A wholesome traditional Kongu breakfast made with sprouted sorghum (cholam) flour and rice flour, steamed into delicate string hoppers (santhagai/idiyappam). Served two ways — sweet with a jaggery-coconut topping, or savory with a spiced tempering. Naturally millet-rich, gut-friendly, and high in fibre.",
      ta: "முளைகட்டிய சோள மாவு மற்றும் அரிசி மாவில் செய்யப்படும் பாரம்பரிய கொங்கு காலை உணவு — மென்மையான இடியாப்பம் (சந்தகை). இரண்டு வகை: வெல்லம்-தேங்காய் இனிப்பு / காரமான தாளிப்பு. இயற்கையாகவே சிறுதானியம், செரிமானம் மற்றும் நார்ச்சத்து நிறைந்தது.",
    },
    keywords: [
      "sorghum santhagai",
      "cholam santhagai",
      "millet idiyappam",
      "sprouted cholam recipe",
      "சோள சந்தகை",
      "சோள இடியாப்பம்",
      "kongu breakfast",
      "healthy millet breakfast",
      "tamil millet recipe",
      "sprouted sorghum hoppers",
    ],
  },
  {
    slug: "dindigul-jaffer-nei-soru",
    title: {
      en: "Dindigul Nei Soru (Traditional Tamil Ghee Rice)",
      ta: "திண்டுக்கல் நெய் சோறு",
    },
    description: {
      en: "Authentic Dindigul-style ghee rice — seeraga samba rice slow-cooked in generous ghee with whole spices, onions, and the classic 'pakki' three-stage layering technique. A delicately fragrant, melt-in-the-mouth rice that pairs perfectly with mutton dalcha or any spicy curry.",
      ta: "திண்டுக்கல் பாணி நெய் சோறு — சீரக சம்பா அரிசி, தாராளமான நெய், முழு மசாலா மற்றும் வெங்காயத்துடன் பாரம்பரிய 'பக்கி' மூன்று-கட்ட முறையில் வேகவைக்கப்படுகிறது. நறுமணமான, மென்மையான நெய் சோறு — ஆட்டிறைச்சி தால்சா அல்லது காரமான குழம்புடன் சிறந்த இணைப்பு.",
    },
    keywords: [
      "dindigul nei soru",
      "ghee rice recipe",
      "tamil ghee rice",
      "seeraga samba nei soru",
      "திண்டுக்கல் நெய் சோறு",
      "நெய் சோறு",
      "pakki ghee rice",
      "dindigul ghee rice",
      "kuska nei soru",
      "traditional tamil rice",
    ],
  },
  {
    slug: "dindigul-mujib-chicken-biryani",
    title: {
      en: "Dindigul Chicken Biryani (Restaurant-Style)",
      ta: "திண்டுக்கல் சிக்கன் பிரியாணி (உணவகம் பாணி)",
    },
    description: {
      en: "Restaurant-quality Dindigul chicken biryani built on four commercial-craft rules: a secret roasted spice powder, a precise rice-to-water 'pakki' ratio, layered ghee cooking, and a deep dum finish. Made with seeraga samba rice for the unmistakable Dindigul aroma and bite — open-shop quality, scaled for home cooks.",
      ta: "உணவகம் தரத்தில் திண்டுக்கல் சிக்கன் பிரியாணி — நான்கு வணிக ரகசியங்கள்: சிறப்பு வறுத்த மசாலா பொடி, துல்லியமான 'பக்கி' அரிசி-நீர் விகிதம், அடுக்கான நெய் சமையல், ஆழ்ந்த தம் முடிவு. சீரக சம்பா அரிசியில் — திண்டுக்கல் வாசனை மற்றும் ருசி, வீட்டில் செய்யக்கூடியது.",
    },
    keywords: [
      "dindigul chicken biryani",
      "dindigul biryani",
      "restaurant style biryani",
      "seeraga samba chicken biryani",
      "திண்டுக்கல் சிக்கன் பிரியாணி",
      "திண்டுக்கல் பிரியாணி",
      "pakki biryani",
      "tamil chicken biryani",
      "authentic dindigul biryani",
      "commercial biryani recipe",
    ],
  },
  {
    slug: "dindigul-mujib-mutton-dalcha",
    title: {
      en: "Dindigul Mutton Dalcha (Classic Biryani Side)",
      ta: "திண்டுக்கல் ஆட்டிறைச்சி தால்சா",
    },
    description: {
      en: "The authentic Dindigul-style mutton dalcha — a slow-cooked toor + chana dal gravy enriched with bone-in mutton pieces, brinjal, and a tangy tamarind finish. The classic side that lifts any Dindigul biryani above a basic raita or kurma. Deep, slow-simmered flavor with a spiced tempering.",
      ta: "திண்டுக்கல் பாணி ஆட்டிறைச்சி தால்சா — துவரம் பருப்பு + கடலை பருப்பு + எலும்புடன் ஆட்டிறைச்சி, கத்திரிக்காய், புளி கொண்ட மெதுவாக கொதிக்கும் குழம்பு. திண்டுக்கல் பிரியாணியின் சிறந்த பக்கம் — சாதாரண ரைதா அல்லது குருமாவை மீறும் ஆழ்ந்த ருசி.",
    },
    keywords: [
      "dindigul dalcha",
      "mutton dalcha",
      "biryani side dish",
      "ஆட்டிறைச்சி தால்சா",
      "திண்டுக்கல் தால்சா",
      "dalcha recipe",
      "tamil dalcha",
      "dum biryani side",
      "toor chana dal mutton",
      "authentic dalcha",
    ],
  },
  {
    slug: "dindigul-jaffer-kalyana-veetu-mutton-biryani",
    title: {
      en: "Dindigul Wedding-Style Mutton Biryani (Kalyana Veetu)",
      ta: "திண்டுக்கல் கல்யாண வீட்டு ஆட்டிறைச்சி பிரியாணி",
    },
    description: {
      en: "The authentic Dindigul Muslim-wedding mutton biryani, scaled for a 1.5 kg home batch. Built on the celebration-style 'kalyana veetu' method — a deep mutton-stock base, whole-spice tempered ghee, and the precise pakki rice technique that gives every grain a separate, fragrant bite.",
      ta: "திண்டுக்கல் முஸ்லிம் கல்யாண பாணி ஆட்டிறைச்சி பிரியாணி (1.5 கிலோ வீட்டு அளவில்) — கொண்டாட்ட பாணி: ஆழ்ந்த ஆட்டிறைச்சி குழம்பு அடிப்படை, முழு மசாலா-நெய் தாளிப்பு, துல்லியமான பக்கி அரிசி நுட்பம். ஒவ்வொரு பிரியாணி அரிசியும் தனித்தனி, நறுமணமான ருசி.",
    },
    keywords: [
      "dindigul mutton biryani",
      "kalyana veetu biryani",
      "wedding mutton biryani",
      "ஆட்டிறைச்சி பிரியாணி",
      "திண்டுக்கல் ஆட்டிறைச்சி பிரியாணி",
      "muslim wedding biryani",
      "seeraga samba mutton biryani",
      "kalyana biryani",
      "tamil mutton biryani",
      "authentic wedding biryani",
    ],
  },
  {
    slug: "dindigul-jaffer-veg-dum-biryani",
    title: {
      en: "Dindigul Veg Dum Biryani (Wedding-Style Vegetarian)",
      ta: "திண்டுக்கல் சைவ தம் பிரியாணி",
    },
    description: {
      en: "A rich vegetarian Dindigul-style dum biryani built deliberately on the same intense masala base as the mutton version — so the dish stays bold and aromatic without going light or pulao-style. Mixed vegetables, paneer, and seeraga samba rice layered, sealed, and slow-dum cooked.",
      ta: "திண்டுக்கல் பாணி சைவ தம் பிரியாணி — ஆட்டிறைச்சி பிரியாணியின் அதே ஆழ்ந்த மசாலா அடிப்படையில் கட்டப்பட்டது (இலகுவான புலாவ் அல்ல). கலந்த காய்கறிகள், பனீர், சீரக சம்பா அரிசி அடுக்கி, மூடி, தம் வைத்து சமைக்கப்பட்டது.",
    },
    keywords: [
      "dindigul veg biryani",
      "vegetable dum biryani",
      "சைவ தம் பிரியாணி",
      "திண்டுக்கல் சைவ பிரியாணி",
      "paneer veg biryani",
      "wedding veg biryani",
      "tamil veg biryani",
      "seeraga samba veg biryani",
      "rich vegetarian biryani",
      "dum biryani recipe",
    ],
  },
  {
    slug: "dindigul-kola-urundai",
    title: {
      en: "Dindigul Kola Urundai (Spiced Mutton Meatballs)",
      ta: "திண்டுக்கல் கொள உருண்டை",
    },
    description: {
      en: "Authentic Dindigul-style kola urundai — golden, crispy-outside, juicy-inside spiced mutton meatballs. Bound naturally with roasted gram (pottu kadalai) and poppy seeds (no egg, no flour), shaped firm, and deep-fried on medium heat for the classic deep-golden Dindigul finish. Serve as a starter, drop into kuzhambu, or pair with biryani.",
      ta: "திண்டுக்கல் பாணி கொள உருண்டை — தங்க நிறம், வெளியில் மிருதுவாக உள்ளே சுவையான மசாலா ஆட்டிறைச்சி உருண்டை. பொட்டுக்கடலை மற்றும் கசகசா இயற்கை பிசுபிசுப்பு (முட்டை/மாவு வேண்டாம்), நடுத்தர சூட்டில் ஆழமாக பொரிக்கப்பட்டது. ஸ்டார்ட்டர், குழம்பில் சேர்க்க அல்லது பிரியாணியுடன் பரிமாற.",
    },
    keywords: [
      "kola urundai",
      "mutton meatballs",
      "dindigul kola urundai",
      "கொள உருண்டை",
      "ஆட்டிறைச்சி உருண்டை",
      "tamil mutton balls",
      "deep fried meatballs",
      "pottu kadalai meatballs",
      "biryani side starter",
      "no egg meatballs",
    ],
  },

  // ============================================================
  // 10 recipes with attribution baked in — clean it out
  // ============================================================
  {
    slug: "erode-malli-poo-idly-with-tomato-chutney",
    title: {
      en: "Erode Malli Poo Idly with Tomato Chutney",
      ta: "ஈரோடு மல்லிப்பூ இட்லி மற்றும் தக்காளி சட்னி",
    },
    description: {
      en: "Incredibly soft, jasmine-flower-style Erode idlies paired with a vibrant, spicy cold-pressed gingelly oil tomato chutney. Built on a finely calibrated rice-to-urad ratio that yields melt-in-the-mouth texture without any fenugreek.",
      ta: "மல்லிப்பூ போன்று மென்மையான ஈரோடு பாணி இட்லி மற்றும் காரசாரமான தக்காளி சட்னி காம்போ — மரச்செக்கு எள்ளெண்ணெய் சுவையில். வெந்தயம் இல்லாமல் சரியான அரிசி-உளுத்த விகிதத்தில் மென்மையான இட்லி.",
    },
    keywords: [
      "erode malli poo idly",
      "jasmine flower idly",
      "soft idly without fenugreek",
      "erode idly recipe",
      "tomato chutney",
      "ஈரோடு மல்லிப்பூ இட்லி",
      "தக்காளி சட்னி",
      "soft idly batter",
      "idly chutney combo",
      "tamil breakfast",
    ],
  },
  {
    slug: "erode-aaya-murungaikeerai-chutney",
    title: {
      en: "Murungaikeerai Chutney (Drumstick Leaves Chutney)",
      ta: "முருங்கைக்கீரை சட்னி",
    },
    description: {
      en: "A traditional Kongu chutney that turns iron-rich drumstick leaves (murungaikeerai) into a delicious, tangy, mildly spicy chutney — completely masking the natural bitterness. Slow-roasted in gingelly oil with tamarind and dry red chillies, ground coarse. Pairs perfectly with hot rice + ghee, idly, or dosa.",
      ta: "இரும்புச்சத்து நிறைந்த முருங்கைக்கீரையின் கசப்பு தெரியாமல், சுவையான, மென்மையான காரசாரமான சட்னியாக மாற்றும் பாரம்பரிய கொங்கு நாட்டு செய்முறை. மரச்செக்கு எள்ளெண்ணெயில் வறுத்து, புளி மற்றும் காய்ந்த மிளகாயுடன் கொரகொரப்பாக அரைக்கப்பட்டது. சூடான சாதம்-நெய், இட்லி, தோசையுடன் சிறந்தது.",
    },
    keywords: [
      "murungaikeerai chutney",
      "drumstick leaves chutney",
      "moringa chutney",
      "முருங்கைக்கீரை சட்னி",
      "kongu chutney",
      "iron rich chutney",
      "healthy green chutney",
      "tamil chutney recipe",
      "moringa leaves recipe",
      "erode style chutney",
    ],
  },
  {
    slug: "sundakkai-chutney",
    title: {
      en: "Sundakkai Chutney (Turkey Berry Chutney)",
      ta: "சுண்டக்காய் சட்னி",
    },
    description: {
      en: "An authentic Tamil-style chutney that transforms bitter turkey berries (sundakkai) into a deliciously balanced side dish. Traditionally known as a 'tasty medicine' for mouth and stomach ulcers — the bitter berry is dry-roasted, ground with tamarind and dry chillies, and finished with a mustard + curry-leaf tempering. Eat with hot rice + ghee or gingelly oil.",
      ta: "கசப்பான சுண்டக்காயை ருசியான தொட்டுக்கொள்ளியாக மாற்றும் பாரம்பரிய தமிழ் சட்னி — வாய்ப்புண் மற்றும் வயிற்றுப்புண்ணுக்கு பாரம்பரிய 'ருசியான மருந்து'. வறுத்து, புளி-மிளகாயுடன் அரைத்து, கடுகு-கருவேப்பிலை தாளிப்பு. சூடான சாதம்-நெய் அல்லது எள்ளெண்ணெயுடன் பரிமாற.",
    },
    keywords: [
      "sundakkai chutney",
      "turkey berry chutney",
      "சுண்டக்காய் சட்னி",
      "ulcer remedy chutney",
      "tamil chutney",
      "kongu chutney",
      "sundakkai thogayal",
      "bitter berry recipe",
      "traditional tamil chutney",
      "healing food",
    ],
  },
  {
    slug: "paruppu-thuvayal",
    title: {
      en: "Paruppu Thuvayal (Toor Dal Chutney)",
      ta: "பருப்பு துவையல்",
    },
    description: {
      en: "A nearly-forgotten Kongu village classic — a thick, rustic toor dal chutney built from kurunai (small broken bits of toor dal). Dry-roasted, then ground with garlic, dry red chillies, and tamarind into a creamy, deep-flavored thuvayal. Eat with hot rice + ghee for kids, or with raw cold-pressed groundnut oil for elders.",
      ta: "மறக்கப்பட்ட கொங்கு கிராம உணவு — உடைந்த துவரம் பருப்பு (குருணை) கொண்டு செய்யப்படும் கெட்டியான, பரம்பரை சுவையான துவையல். வறுத்து, பூண்டு, காய்ந்த மிளகாய், புளியுடன் அரைத்தது. குழந்தைகளுக்கு நெய்யுடன், பெரியவர்களுக்கு பச்சை மரச்செக்கு வேர்க்கடலை எண்ணெயுடன்.",
    },
    keywords: [
      "paruppu thuvayal",
      "toor dal chutney",
      "பருப்பு துவையல்",
      "kurunai thuvayal",
      "broken dal recipe",
      "kongu thuvayal",
      "rustic chutney",
      "tamil thogayal",
      "village recipe",
      "paruppu thogayal",
    ],
  },
  {
    slug: "vayirukku-idhama-biryani",
    title: {
      en: "Vayirukku Idhama Naatu Kozhi Biryani (Stomach-Soothing Country Chicken Biryani)",
      ta: "வயிற்றுக்கு இதமா நாட்டு கோழி பிரியாணி",
    },
    description: {
      en: "A home-style country chicken (naatu kozhi) biryani famously called 'vayirukku idhama' — soothing to the stomach. Unlike heavy commercial biryanis, this uses a pre-marinated naatu kozhi base and a double-ghee technique that gives a deep ghee aroma with zero heartburn or bloating. Slow-cooked seeraga samba rice, fluffy and fragrant.",
      ta: "வயிற்றுக்கு இதமான நாட்டு கோழி பிரியாணி — 'வயிற்றுக்கு இதமா' என்று பிரபலம். கனமான ஹோட்டல் பிரியாணி போல் இல்லாமல், முன்-மரினேட் நாட்டு கோழி மற்றும் இரட்டை-நெய் நுட்பத்தில் — நெய் வாசனை, நெஞ்செரிச்சல் இல்லை. சீரக சம்பா அரிசியில் மென்மையாக சமைக்கப்பட்டது.",
    },
    keywords: [
      "naatu kozhi biryani",
      "country chicken biryani",
      "stomach friendly biryani",
      "vayirukku idhama biryani",
      "வயிற்றுக்கு இதமா பிரியாணி",
      "நாட்டு கோழி பிரியாணி",
      "home style biryani",
      "pre marinated biryani",
      "double ghee biryani",
      "kongu biryani",
    ],
  },
  {
    slug: "thengai-poondu-podi",
    title: {
      en: "Thengai Poondu Podi (Coconut Garlic Podi)",
      ta: "தேங்காய் பூண்டு பொடி",
    },
    description: {
      en: "A zero-stove, no-cook, no-roast Kongu side podi ready in 4 minutes — just dry copra coconut, raw garlic, dry red chillies, and salt pulsed in a bone-dry mixer. Served drizzled with raw cold-pressed gingelly oil for an instant, fragrant side for idly, dosa, or hot rice.",
      ta: "அடுப்பு வேண்டாத, வறுக்க வேண்டாத கொங்கு பொடி — 4 நிமிடத்தில் தயார். வறண்ட கொப்பரை, பச்சை பூண்டு, காய்ந்த மிளகாய், உப்பு — வறண்ட மிக்ஸியில் பல்ஸ். பச்சை மரச்செக்கு எள்ளெண்ணெய் ஊற்றி இட்லி, தோசை, சூடான சாதத்துடன் பரிமாற.",
    },
    keywords: [
      "thengai poondu podi",
      "coconut garlic podi",
      "no cook podi",
      "தேங்காய் பூண்டு பொடி",
      "instant podi",
      "kopparai podi",
      "idicha podi",
      "kongu podi",
      "dosa side podi",
      "raw garlic podi",
    ],
  },
  {
    slug: "porichi-kotuna-paruppu-kuzhambu",
    title: {
      en: "Porichi Kotuna Paruppu Kuzhambu (Quick Dal Gravy)",
      ta: "பொரிச்சி கொட்டின பருப்பு குழம்பு",
    },
    description: {
      en: "A rustic 4-ingredient comfort dal gravy where dal is boiled on one burner while a spicy onion-tomato-tamarind tempering is built on another — then the hot tempering is 'poured' (kotuna) over the dal. A lifesaver weeknight kuzhambu, no sambar powder needed.",
      ta: "4-பொருள் வாழ்வு-காப்பாளர் பருப்பு குழம்பு — ஒரு அடுப்பில் பருப்பு வேக, மற்றொன்றில் காரமான வெங்காயம்-தக்காளி-புளி தாளிப்பு; சூடான தாளிப்பை பருப்பில் கொட்டினதே. சாம்பார் பொடி வேண்டாம், பிஸி நாட்களின் ரகசிய ஆயுதம்.",
    },
    keywords: [
      "porichi kotuna paruppu",
      "paruppu kuzhambu",
      "quick dal gravy",
      "பொரிச்சி கொட்டின பருப்பு",
      "no sambar powder dal",
      "4 ingredient kuzhambu",
      "weeknight dal",
      "tamil dal recipe",
      "kongu paruppu kuzhambu",
      "rustic dal gravy",
    ],
  },
  {
    slug: "pottu-kadalai-kuzhambu",
    title: {
      en: "Pottu Kadalai Kuzhambu (Roasted Gram Tomato Gravy)",
      ta: "பொட்டுக்கடலை குழம்பு",
    },
    description: {
      en: "A clever tiffin-shop style tomato gravy that uses ground roasted gram (pottu kadalai) as the thickener instead of toor dal or coconut paste — giving a velvety, smooth, light, gut-friendly kuzhambu. Pour over hot idlies or pair with dosa for a deeply satisfying side.",
      ta: "டிஃபன் கடை பாணி தக்காளி குழம்பு — பருப்பு/தேங்காய்க்கு பதிலாக அரைத்த பொட்டுக்கடலை கொண்டு வெல்வெட் பதம். மென்மையான, இலகுவான, வயிற்றுக்கு நல்ல குழம்பு. சூடான இட்லியில் ஊற்றியோ, தோசையுடனோ சிறந்தது.",
    },
    keywords: [
      "pottu kadalai kuzhambu",
      "roasted gram gravy",
      "fried gram kuzhambu",
      "பொட்டுக்கடலை குழம்பு",
      "tiffin shop kuzhambu",
      "tomato gravy",
      "no coconut kuzhambu",
      "no dal kuzhambu",
      "idly kuzhambu",
      "tamil tomato gravy",
    ],
  },
  {
    slug: "karuveppilai-thokku",
    title: {
      en: "Karuveppilai Thokku (Curry Leaves Chutney)",
      ta: "கருவேப்பிலை தொக்கு",
    },
    description: {
      en: "A traditional Kongu summer chutney built around large handfuls of fresh curry leaves, slow-roasted in gingelly oil with whole coriander, dry chillies, and heavy cumin (which prevents heartburn). No urad dal — it would turn slimy. Iron-rich, naturally cooling, and a known hair-fall remedy. Eat with hot rice + a drizzle of gingelly oil.",
      ta: "பாரம்பரிய கொங்கு கோடைகால கருவேப்பிலை சட்னி — பெரிய கைப்பிடி கருவேப்பிலை, மரச்செக்கு எள்ளெண்ணெயில் முழு கொத்தமல்லி, காய்ந்த மிளகாய் மற்றும் அதிக சீரகத்துடன் (நெஞ்செரிச்சல் இல்லை). உளுந்து கட்டாயம் வேண்டாம் (வளவளப்பாக்கும்). இரும்புச்சத்து, தலைமுடி உதிர்வு மருந்து. சூடான சாதம்-எள்ளெண்ணெயுடன் சிறந்தது.",
    },
    keywords: [
      "karuveppilai thokku",
      "curry leaves chutney",
      "கருவேப்பிலை தொக்கு",
      "summer chutney",
      "hair fall remedy chutney",
      "iron rich chutney",
      "no urad dal thokku",
      "kongu thokku",
      "traditional tamil chutney",
      "curry leaves recipe",
    ],
  },
  {
    slug: "thakkali-mozhagu-aracha-kuzhambu",
    title: {
      en: "Thakkali Mozhagu Aracha Kuzhambu (Tomato 'Kuruma' Spiced Gravy)",
      ta: "தக்காளி மிளகு அரைச்ச குழம்பு",
    },
    description: {
      en: "A 'kuruma-illusion' tomato gravy that looks ordinary but tastes shockingly rich — almost like a non-veg kuruma. The secret is a freshly-ground spice paste with whole spices and poppy seeds (kasagasa) in the aracha base. A 3-meal champion — pour over hot idlies for breakfast, with rice for lunch, with chapati for dinner.",
      ta: "சாதாரண தக்காளி குழம்பு போல தோன்றினாலும், அசைவ குருமா போல சுவை — 'குருமா-மாயை' குழம்பு. ரகசியம்: அரைப்பு அடிப்படையில் முழு மசாலா மற்றும் கசகசா. '3-வேளை சாம்பியன்' — காலையில் இட்லியில் ஊற்றி, மதியம் சாதத்துடன், இரவில் சப்பாத்தியுடன்.",
    },
    keywords: [
      "thakkali kuzhambu",
      "thakkali mozhagu aracha kuzhambu",
      "tomato kuruma gravy",
      "தக்காளி குழம்பு",
      "kuruma illusion",
      "kasagasa thakkali",
      "kongu tomato gravy",
      "tamil kuzhambu",
      "idly kuzhambu",
      "veg kuruma style",
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);

  let ok = 0;
  let miss = 0;
  for (const patch of PATCHES) {
    const r: any = await Recipe.findOne({ slug: patch.slug });
    if (!r) {
      console.log(`MISS: ${patch.slug}`);
      miss++;
      continue;
    }
    r.seo = {
      title: patch.title,
      description: patch.description,
      keywords: patch.keywords,
    };
    await r.save();
    console.log(
      `OK  : ${patch.slug.padEnd(50)} → "${patch.title.en.slice(0, 60)}"`
    );
    ok++;
  }

  console.log(`\nDONE — ${ok} updated, ${miss} missing in DB`);

  // Re-run dirty scan to confirm cleanup
  const BANNED = [
    "jaffer",
    "mujib",
    "chef deena",
    "deena's",
    "professor",
    "yasin",
    "thottathu virundhu",
    "erode aaya",
    "kavithamani",
    "anusiya",
    "windsor castle",
    "master caterer",
  ];

  const all: any[] = await Recipe.find({}).select("slug seo").lean();
  const dirty: any[] = [];
  for (const r of all) {
    if (!r.seo?.title?.en) continue;
    const haystack = [
      r.seo.title?.en,
      r.seo.title?.ta,
      r.seo.description?.en,
      r.seo.description?.ta,
      (r.seo.keywords || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    const hits = BANNED.filter((b) => haystack.includes(b));
    if (hits.length > 0) dirty.push({ slug: r.slug, hits });
  }
  console.log(`\nPOST-SCAN REMAINING ATTRIBUTION: ${dirty.length}`);
  dirty.forEach((d) => console.log(`  ${d.slug} → hits: ${d.hits.join(", ")}`));

  await mongoose.disconnect();
})();
