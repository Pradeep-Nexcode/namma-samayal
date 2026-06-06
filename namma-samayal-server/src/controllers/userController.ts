import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

import config from "../config/config.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../utils/logger.js";

interface RegisterBody {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
}

const jwtOptions: SignOptions = {
  expiresIn: config.jwtExpire as SignOptions["expiresIn"],
};

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, jwtOptions);
};

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new AppError("Not authenticated", 401);
  }

  return req.user.id;
};

const getUserOrThrow = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const getRecipeIdParam = (req: Request): string => {
  const recipeId = req.params.recipeId;

  if (!recipeId || Array.isArray(recipeId)) {
    throw new AppError("Invalid recipe id", 400);
  }

  return recipeId;
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400));
  }

  const { username, email, password, firstName, lastName } = req.body as RegisterBody;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }

  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
  });

  const token = generateToken(user._id.toString());

  logger.info("User registered", { userId: user._id.toString() });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { user, token },
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400));
  }

  const { email, password } = req.body as LoginBody;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Account is deactivated", 401));
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id.toString());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user, token },
  });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);

  const user = await User.findById(userId)
    .populate({
      path: "favoriteRecipes",
      populate: [
        { path: "category", select: "name slug parent level" },
        { path: "subCategory", select: "name slug parent level" },
        {
          path: "ingredients.ingredient",
          populate: [
            { path: "category", select: "name slug parent level" },
            { path: "subCategory", select: "name slug parent level" },
          ],
        },
      ],
    })
    .populate({
      path: "savedRecipes",
      populate: [
        { path: "category", select: "name slug parent level" },
        { path: "subCategory", select: "name slug parent level" },
        {
          path: "ingredients.ingredient",
          populate: [
            { path: "category", select: "name slug parent level" },
            { path: "subCategory", select: "name slug parent level" },
          ],
        },
      ],
    });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);

  const allowedFields: Array<keyof UpdateProfileBody> = [
    "firstName",
    "lastName",
    "bio",
    "profileImage",
  ];

  const payload = req.body as UpdateProfileBody;

  const updateData = allowedFields.reduce<UpdateProfileBody>((acc, field) => {
    if (payload[field] !== undefined) {
      acc[field] = payload[field];
    }

    return acc;
  }, {});

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

export const addToFavorites = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const recipeId = getRecipeIdParam(req);
  const user = await getUserOrThrow(userId);

  const alreadyExists = user.favoriteRecipes.some((id) => id.toString() === recipeId);

  if (!alreadyExists) {
    user.favoriteRecipes.push(new Types.ObjectId(recipeId));
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Recipe added to favorites",
  });
});

export const removeFromFavorites = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const recipeId = getRecipeIdParam(req);
  const user = await getUserOrThrow(userId);

  user.favoriteRecipes = user.favoriteRecipes.filter((id) => id.toString() !== recipeId);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Recipe removed from favorites",
  });
});

export const saveRecipe = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const recipeId = getRecipeIdParam(req);
  const user = await getUserOrThrow(userId);

  const alreadyExists = user.savedRecipes.some((id) => id.toString() === recipeId);

  if (!alreadyExists) {
    user.savedRecipes.push(new Types.ObjectId(recipeId));
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Recipe saved",
  });
});

export const unsaveRecipe = catchAsync(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  const recipeId = getRecipeIdParam(req);
  const user = await getUserOrThrow(userId);

  user.savedRecipes = user.savedRecipes.filter((id) => id.toString() !== recipeId);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Recipe removed from saved list",
  });
});
