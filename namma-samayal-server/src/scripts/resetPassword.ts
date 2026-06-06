import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import config from "../config/config.js";

async function resetPassword() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    const email = "pradeepprady005@gmail.com";
    const newPassword = "password123";
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (result) {
      console.log(`Successfully reset password for: ${email}`);
      console.log(`New password is: ${newPassword}`);
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
