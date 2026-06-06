import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const fixOrphans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const foodId = new mongoose.Types.ObjectId('660000000000000000000001');

    // Remove the invalid food category reference from Ingredients
    const updateIngCat = await db.collection('ingredients').updateMany(
      { category: foodId },
      { $unset: { category: "" } }
    );
    console.log(`Unset category for ${updateIngCat.modifiedCount} ingredients.`);

    const updateIngSubCat = await db.collection('ingredients').updateMany(
      { subCategory: foodId },
      { $unset: { subCategory: "" } }
    );
    console.log(`Unset subCategory for ${updateIngSubCat.modifiedCount} ingredients.`);

    // Remove the invalid food category reference from Recipes
    const updateRecCat = await db.collection('recipes').updateMany(
      { category: foodId },
      { $unset: { category: "" } }
    );
    console.log(`Unset category for ${updateRecCat.modifiedCount} recipes.`);

    const updateRecSubCat = await db.collection('recipes').updateMany(
      { subCategory: foodId },
      { $unset: { subCategory: "" } }
    );
    console.log(`Unset subCategory for ${updateRecSubCat.modifiedCount} recipes.`);
    
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixOrphans();
