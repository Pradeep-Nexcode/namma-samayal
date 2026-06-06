
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from './src/models/Recipe.js';

dotenv.config();

async function checkRecipeData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const recipe = await Recipe.findOne({}).lean();
    console.log('Raw recipe from DB (lean):', JSON.stringify(recipe, null, 2));

    const populatedRecipe = await Recipe.findOne({}).populate({
        path: 'ingredients.ingredient'
    });
    console.log('Populated recipe ingredients:', JSON.stringify(populatedRecipe?.ingredients, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRecipeData();
