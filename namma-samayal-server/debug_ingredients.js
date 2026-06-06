
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ingredient from './src/models/Ingredient.js';

dotenv.config();

async function checkIngredients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const ingredients = await Ingredient.find({}).limit(5);
    console.log('Ingredients in DB:', JSON.stringify(ingredients, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIngredients();
