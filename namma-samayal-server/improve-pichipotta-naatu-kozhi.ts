import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./src/models/Recipe";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

/**
 * Additive improvement to the existing admin-approved
 * `erode-pichipotta-naatu-kozhi` recipe. Enriches description and
 * speciality with details from recipes.txt that were missing:
 *   1) Maanthoppu Virundhu restaurant attribution + "10 kg/day" anecdote
 *   2) The Erode semi-dry vs typical-restaurant dosa-kal-dry-fry distinction
 *
 * Does NOT touch ingredients, steps, sections, isApproved, source, or anything else.
 */

async function improveRecipe() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const slug = "erode-pichipotta-naatu-kozhi";
    const existing = await Recipe.findOne({ slug });
    if (!existing) {
      console.log(`Recipe not found: ${slug}`);
      return;
    }
    console.log(`Found existing recipe _id=${existing._id}`);

    const enrichedDescriptionEn =
      "A fiery and incredibly flavorful Kongu-style shredded country chicken roast from Maanthoppu Virundhu in Erode — famous for selling around 10 kg of this single dish every day. Unlike typical city restaurants that toss shredded broiler chicken on a hot dosa kal with dry powders (resulting in a dusty, dry fry), this authentic Erode version boils tough country chicken, shreds it by hand, and slow-cooks it back in its own bone broth in a clay pot — creating a deeply flavorful, juicy, semi-dry roast rather than a dry one. Finished with fresh eggs scrambled directly into the spicy shredded chicken to bind the masala and balance the heat.";

    const enrichedDescriptionTa =
      "ஈரோடு மான்தோப்பு விருந்து கடையின் புகழ்பெற்ற கொங்கு பாணி பிச்சிப்போட்ட நாட்டு கோழி வறுவல் — தினமும் சுமார் 10 கிலோ இந்த ஒற்றை உணவையே விற்கின்றனர். பெரும்பாலான நகர உணவகங்கள் பாய்லர் கோழியை சிதைத்து சூடான தோசைக்கல்லில் மசாலா தூள் தூவி உலர்ந்த வறுவலாக செய்கின்றனர் — ஆனால் இந்த அசலான ஈரோடு பாணி, கடினமான நாட்டு கோழியை வேக வைத்து, கையால் பிய்த்து, அதே எலும்பு சாற்றில் மண்சட்டியில் மீண்டும் மெதுவாக வேக வைத்து, ஆழமான சுவை மற்றும் சதைப்பற்றான அரை-உலர் (semi-dry) வறுவலாக மாற்றுகிறது — உலர்ந்த வறுவல் அல்ல. கடைசியில் காரமான பிய்த்த கோழியில் முட்டை சேர்த்து மசாலாவை இணைத்து, காரத்தை சமன் செய்து முடிக்கப்படுகிறது.";

    const enrichedSpecialityEn =
      "Three signatures define the authentic Erode (Maanthoppu Virundhu) version: " +
      "(1) The Semi-Dry Erode Twist — most city restaurants make Pichipotta as a dry dosa-kal toss with broiler chicken and powdered spices; Maanthoppu Virundhu instead boils tough country chicken, shreds it, and slow-roasts it BACK INTO ITS OWN STOCK in a clay pot, giving a juicy semi-dry gravy roast rather than a dusty dry fry. " +
      "(2) The Double-Flavor Hack — 'Pichipotta' literally means 'torn to pieces'. Stripping meat from bones by hand massively increases its surface area; cooking that shredded meat back into its own bone stock makes every single fiber act like a sponge for the Kongu spices. " +
      "(3) The Egg Scramble Finale — fresh eggs cracked directly into the spicy shredded chicken at the end scramble into the masala, binding the spices to the meat, balancing the heat, and creating a soft texture even kids love. This egg-finale is the specific reason the dish became legendary at Maanthoppu Virundhu (~10 kg sold daily).";

    const enrichedSpecialityTa =
      "அசலான ஈரோடு (மான்தோப்பு விருந்து) பதிப்பின் மூன்று சிறப்புகள்: " +
      "(1) ஈரோடு அரை-உலர் (semi-dry) நுட்பம் — பெரும்பாலான நகர உணவகங்கள் பாய்லர் கோழியை சிதைத்து சூடான தோசைக்கல்லில் மசாலா தூளுடன் வறுத்து உலர்ந்த வறுவலாக செய்கிறார்கள்; ஆனால் மான்தோப்பு விருந்து, கடினமான நாட்டு கோழியை வேக வைத்து, பிய்த்து, மண்சட்டியில் அதே எலும்பு சாற்றில் மீண்டும் மெதுவாக வேக வைக்கிறார்கள் — உலர்ந்த வறுவல் அல்ல, சதைப்பற்றான அரை-உலர் வறுவல். " +
      "(2) இரட்டை சுவை நுட்பம் — 'பிச்சிப்போட்ட' என்றால் 'பிய்த்தது'. கையால் கோழியை எலும்பிலிருந்து பிய்க்கும் போது மேற்பரப்பு பல மடங்கு அதிகரிக்கிறது; அதே பிய்த்த இறைச்சியை அதன் சொந்த எலும்பு சாற்றில் மீண்டும் வேக வைக்கும் போது, ஒவ்வொரு நாரும் கொங்கு மசாலாக்களை ஸ்பாஞ்ச் போல உள்ளீர்க்கிறது. " +
      "(3) முட்டை இறுதி படி — காரமான பிய்த்த கோழியில் கடைசியில் புதிய முட்டைகளை நேரடியாக உடைத்து கலக்கும் போது, முட்டை மசாலாவில் கலந்து, மசாலாவை இறைச்சியுடன் பிணைத்து, காரத்தை சமன் செய்து, குழந்தைகள் கூட விரும்பும் மென்மையான பதத்தை கொடுக்கிறது. மான்தோப்பு விருந்தில் இந்த உணவே புகழடைய காரணம் இந்த முட்டை இறுதிப்படிதான் (தினமும் ~10 கிலோ விற்பனை).";

    existing.description = { en: enrichedDescriptionEn, ta: enrichedDescriptionTa };
    existing.speciality = { en: enrichedSpecialityEn, ta: enrichedSpecialityTa };

    await existing.save();
    console.log(`Successfully enriched recipe _id=${existing._id}`);
    console.log("  - description.en/ta: added Maanthoppu Virundhu attribution + 10 kg/day + semi-dry vs dry-fry distinction");
    console.log("  - speciality.en/ta: expanded from 2 bullets to 3 (added semi-dry-vs-city distinction)");
    console.log("Untouched: ingredients, sections, steps, source, recipeSource, searchKeywords, tags, isApproved, isPublic.");
  } catch (error) {
    console.error("Error improving recipe:", error);
  } finally {
    mongoose.disconnect();
  }
}

improveRecipe();
