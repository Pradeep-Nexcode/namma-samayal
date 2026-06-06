import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import config from "../config/config.js";

async function seedAdmin() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB...");

    const email = "admin@gmail.com";
    const password = "admin123";

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      console.log("Admin already exists. No action taken.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: hashedPassword,
    });

    console.log("-----------------------------------------");
    console.log("✅ Admin Created Successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");

  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seedAdmin();
