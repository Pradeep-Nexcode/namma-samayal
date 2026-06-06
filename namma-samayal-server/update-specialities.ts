import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const updates = [
  {
    slug: "erode-varamilagai-kozhi-varuval",
    speciality: {
      en: "* The 75-Year-Old Secret: The 50-year-old grandma in the video has 75 years of ancestral cooking wisdom and has run her shop for 25 years. When asked who taught her, she simply says, 'Aandavane solli kuduthathu' (God taught me).\n* Zero Masala: The dish uses absolutely no pre-made masala powders. The deep red color and fiery flavor come entirely from slow-cooking the chicken for over an hour until the dry red chillies completely dissolve into the peanut oil.",
      ta: "* 75 வருட ரகசியம்: இந்த பாட்டிக்கு 75 வருட பாரம்பரிய சமையல் அறிவு உள்ளது. 'ஆண்டவனே சொல்லிக் கொடுத்தது' என்று கூறுகிறார்.\n* மசாலா இல்லை: இந்த உணவில் கடைகளில் விற்கும் மசாலா பொடிகள் சேர்க்கப்படுவதில்லை. காய்ந்த மிளகாயின் காரம் மற்றும் நிறம் மட்டுமே இதன் சிறப்பு."
    }
  },
  {
    slug: "erode-pichipotta-naatu-kozhi",
    speciality: {
      en: "* The Shredding Technique: 'Pichipotta' means shredded. By stripping the meat from the bones by hand, the surface area increases, allowing the roasted spices to penetrate every single fiber of the chicken.\n* The Double-Flavor Hack: Instead of using plain water to roast the chicken, they use the deeply flavorful stock from boiling the meat. Finally, tossing in soft-scrambled eggs at the end creates an incredible texture contrast and balances out the intense heat.",
      ta: "* பிய்த்துப் போட்ட கோழி: கறியை எலும்பிலிருந்து பிரித்து பிய்த்துப் போடுவதால், மசாலா கறியின் ஒவ்வொரு நாரிலும் நன்கு இறங்கும்.\n* இரட்டை சுவை: சாதாரண தண்ணீருக்கு பதிலாக கறி வேகவைத்த தண்ணீரை பயன்படுத்துகின்றனர். கடைசியில் முட்டை சேர்ப்பது இதன் காரத்தை குறைத்து சுவையை கூட்டுகிறது."
    }
  },
  {
    slug: "erode-malli-poo-idly-with-tomato-chutney",
    speciality: {
      en: "* The Castor Bean Secret: Normal idly recipes use fenugreek (vendhayam), but this specific shop skips it entirely. Instead, their magic ingredient is the inner white kernel of Castor Beans (Amanakku / Kotta Muthu). This is what makes their idlies incredibly soft, bouncy, blindingly white like a jasmine flower (Malli Poo), and prevents the batter from sticking to the steaming cloth!",
      ta: "* ஆமணக்கு ரகசியம்: சாதாரண இட்லி மாவில் வெந்தயம் சேர்ப்பார்கள், ஆனால் இங்கு ஆமணக்கு முத்து (ஆமணக்கு கொட்டை) சேர்க்கப்படுகிறது. இதுவே இட்லியை மல்லிகைப்பூ போல வெள்ளையாகவும் மிருதுவாகவும் மாற்றுகிறது."
    }
  },
  {
    slug: "coimbatore-catering-style-malli-chutney",
    speciality: {
      en: "* The 'Moisture' Rule: The chef specifically notes that you must fry the fresh coconut until all its natural water/moisture (sala-salappu) is gone. This guarantees the chutney won't spoil quickly.\n* The Golden Salt Rule: You must never add salt while the onions and coriander are hot in the pan. Hot salt makes onions release water, turning the chutney soggy. Adding salt only after everything has cooled keeps the texture perfectly thick.",
      ta: "* ஈரப்பத விதி: தேங்காயின் ஈரப்பதம் போகும் வரை வதக்க வேண்டும். இது சட்னி கெட்டுப்போகாமல் இருக்க உதவும்.\n* உப்பு சேர்க்கும் ரகசியம்: சூடாக இருக்கும் போது உப்பு சேர்க்கக் கூடாது. ஆறிய பின் உப்பு சேர்ப்பதே சட்னி கெட்டியாக இருக்க காரணம்."
    }
  },
  {
    slug: "erode-thanni-kulambu",
    speciality: {
      en: "* A 'Water' Gravy: 'Thanni' means water, and this gravy is famously soupy rather than thick. It uses absolutely no tomatoes.\n* The Rice Thickener: To give this watery gravy just a tiny bit of body without making it a thick paste, they dry-roast exactly one tablespoon of raw rice (Pacharisi) along with the spices.",
      ta: "* தண்ணீர் குழம்பு: தக்காளி இல்லாமல், மிகவும் தண்ணியாக வைக்கப்படும் புகழ் பெற்ற குழம்பு.\n* பச்சரிசி ரகசியம்: குழம்பு மிகவும் தண்ணியாக இல்லாமல் இருக்க சிறிதளவு பச்சரிசியை வறுத்து அரைத்து சேர்க்கின்றனர்."
    }
  },
  {
    slug: "erode-chinthamani-chicken",
    speciality: {
      en: "* The Bare Minimum: True Chinthamani chicken completely skips ginger-garlic paste, tomatoes, and ground masala powders. It relies 100% on a massive amount of deseeded dry red chillies and small onions.\n* The Hot Water Rule: Because country chicken (Naattu Kozhi) can be tough, the golden rule is to only pour boiling hot water into the pan when cooking it. Using cold water will shock the meat and make it rubbery.",
      ta: "* குறைந்த பொருட்கள்: இஞ்சி-பூண்டு, தக்காளி மற்றும் மசாலா பொடிகள் இல்லாமல், காய்ந்த மிளகாய் மற்றும் சின்ன வெங்காயம் மட்டுமே கொண்டு செய்யப்படும் உணவு.\n* வெந்நீர் விதி: நாட்டுக்கோழி கடினமாக இருக்கும் என்பதால், வேகவைக்கும் போது குளிர்ந்த நீருக்கு பதிலாக சுடுதண்ணீர் சேர்ப்பதே இதன் ரகசியம்."
    }
  },
  {
    slug: "erode-pallipalayam-chicken-tvs",
    speciality: {
      en: "* The Onion-to-Meat Ratio: This requires a massive amount of shallots—1 Kg of small onions for 4 Kg of chicken. By the end of the slow roast, those onions completely dissolve into a thick, sweet-and-spicy glaze over the meat.\n* Boiled Coconut: Instead of just garnishing with coconut, fresh coconut slices are added halfway through the boiling process so they soak up the chicken stock and spices like a sponge.",
      ta: "* வெங்காயம் மற்றும் கறி விகிதம்: 4 கிலோ கறிக்கு 1 கிலோ சின்ன வெங்காயம் தேவை. வறுவலின் முடிவில் வெங்காயம் முழுமையாக கரைந்து சுவையான மசாலாவாக மாறும்.\n* தேங்காய் சேர்க்கும் முறை: தேங்காயை கடைசியில் சேர்க்காமல், கொதிக்கும் போதே சேர்ப்பதால் அது கறியின் சுவையை முழுமையாக உறிஞ்சிக் கொள்ளும்."
    }
  },
  {
    slug: "pacha-payaru-satham",
    speciality: {
      en: "* The Roasted Dal: A highly nutritious one-pot meal where the green moong dal is dry-roasted until fragrant and lightly crushed to remove the husk before cooking.\n* The Coriander Oil Trick: Instead of just using coriander leaves as a garnish at the end, a handful is tossed directly into the hot oil base while sautéing. This unlocks a massive burst of herbal aroma into the rice.",
      ta: "* வறுத்த பருப்பு: பச்சை பயறை வறுத்து தோலை நீக்கி சமைப்பதால் சுவை மற்றும் மணம் கூடும்.\n* கொத்தமல்லி ரகசியம்: கொத்தமல்லியை கடைசியில் தூவாமல், சூடான எண்ணெயில் வதக்குவதே சாதத்தின் அபார வாசனையின் ரகசியம்."
    }
  },
  {
    slug: "erode-koottangulambu",
    speciality: {
      en: "* The Sambar Alternative: 'Koottu' means to bring together. This Kongu specialty brings together native country vegetables (drumstick, broad beans, pumpkin). It is a heavier, more intensely spiced, and deeply flavorful alternative to standard everyday sambar, thickened perfectly by a freshly roasted spice blend.",
      ta: "* சாம்பாருக்கு மாற்று: பலவகை நாட்டு காய்கறிகள் மற்றும் வறுத்து அரைத்த மசாலாவுடன் செய்யப்படும் இந்த கூட்டாங்குழம்பு, சாதாரண சாம்பாரை விட சுவையானது மற்றும் சத்தானது."
    }
  },
  {
    slug: "erode-thakkali-kuzhambu",
    speciality: {
      en: "* The Nattu Thakkali Tang: This relies completely on the natural, sharp tanginess of country tomatoes (Nattu Thakkali), completely skipping any store-bought sambar or chilli powders.\n* The Salt Trick: Adding crystal salt directly to the chopped tomatoes while sautéing is the classic trick to make them break down rapidly into a thick, jammy paste.",
      ta: "* நாட்டுத் தக்காளி சுவை: கடைகளில் விற்கும் மசாலா பொடிகள் இல்லாமல், நாட்டுத் தக்காளியின் இயற்கையான புளிப்புச் சுவையிலேயே செய்யப்படும் குழம்பு.\n* உப்பு ரகசியம்: தக்காளி வதங்கும் போதே கல் உப்பு சேர்ப்பதால் தக்காளி சீக்கிரம் மசிந்துவிடும்."
    }
  },
  {
    slug: "erode-selavu-paavakkai-puli-kuzhambu",
    speciality: {
      en: "* The 'Selavu' Blend: In the Erode region, 'Selavu' refers to a freshly ground, rustic spice paste. To naturally thicken the gravy, they grind a spoonful of fried gram (pottukadalai) into the paste.\n* The Balancing Act: This dish is a masterclass in flavor balance. The sharp tang of the tamarind extract completely neutralizes the harsh bitterness of the bitter gourd, making it delicious even for people who usually hate Paavakkai!",
      ta: "* செலவு மசாலா: வறுத்து அரைத்த மசாலாவுடன் சிறிது பொட்டுக்கடலை சேர்த்து அரைப்பது குழம்பை கெட்டியாக்கும்.\n* சுவை சமநிலை: புளியின் புளிப்பு பாகற்காயின் கசப்பை முழுமையாக நீக்கி, பாகற்காய் பிடிக்காதவர்களும் விரும்பும் வகையில் மாற்றுகிறது."
    }
  }
];

async function updateSpecialities() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const update of updates) {
      const result = await Recipe.updateOne(
        { slug: update.slug },
        { $set: { speciality: update.speciality } }
      );
      if (result.matchedCount > 0) {
        console.log(`Updated speciality for: ${update.slug}`);
      } else {
        console.log(`Recipe not found for slug: ${update.slug}`);
      }
    }

    console.log("Finished updating specialities!");

  } catch (error) {
    console.error("Error updating specialities:", error);
  } finally {
    mongoose.disconnect();
  }
}

updateSpecialities();
