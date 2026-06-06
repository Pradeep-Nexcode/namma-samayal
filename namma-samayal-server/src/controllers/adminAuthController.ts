import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import config from "../config/config.js";
import Admin from "../models/Admin.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: admin._id.toString() },
    config.jwtSecret,
    { expiresIn: (config.jwtExpire || "1d") as any }
  );

  res.status(200).json({
    success: true,
    token,
    message: "Login successful"
  });
});

// Temporary seed function to create initial admin
export const seedAdmin = catchAsync(async (_req: Request, res: Response) => {
  const adminExists = await Admin.findOne({ email: "admin@gmail.com" });
  
  if (adminExists) {
    return res.status(200).json({
      success: true,
      message: "Admin already exists"
    });
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await Admin.create({
    email: "admin@gmail.com",
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    message: "Initial admin created successfully. Email: admin@gmail.com, Password: admin123"
  });
});
