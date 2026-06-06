import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const updateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const categoriesCollection = db.collection('categories');

    // 1. Get the "Food" category
    const foodCategory = await categoriesCollection.findOne({ slug: 'food' });
    
    if (!foodCategory) {
      console.log('Food category not found!');
      process.exit(0);
    }

    const foodId = foodCategory._id;
    console.log('Found Food category:', foodId);

    // 2. Find all Level 1 categories (whose parent is Food)
    const level1Categories = await categoriesCollection.find({ parent: foodId }).toArray();
    console.log(`Found ${level1Categories.length} Level 1 categories to promote.`);

    // Promote Level 1 to Level 0 (Main Categories)
    const promoteResult = await categoriesCollection.updateMany(
      { parent: foodId },
      { $set: { parent: null, level: 0 } }
    );
    console.log(`Promoted ${promoteResult.modifiedCount} categories to Level 0 (Main).`);

    // 3. Promote all Level 2 categories to Level 1
    const level2Result = await categoriesCollection.updateMany(
      { level: 2 },
      { $set: { level: 1 } }
    );
    console.log(`Promoted ${level2Result.modifiedCount} categories to Level 1.`);

    // 4. Delete the "Food" category
    const deleteResult = await categoriesCollection.deleteOne({ _id: foodId });
    console.log(`Deleted "Food" category.`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

updateCategories();
