import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

import config from "../config/config.js";
import User from "../models/User.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/emailService.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { createHashedToken, hashToken } from "../utils/cryptoToken.js";
import { logger } from "../utils/logger.js";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

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
  favoriteCuisine?: string;
  cookingLevel?: "beginner" | "home-cook" | "intermediate" | "expert" | "master";
  specialDish?: string;
  location?: string;
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

  const { rawToken, hashedToken } = createHashedToken();

  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
    verificationToken: hashedToken,
    verificationTokenExpires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  });

  await sendVerificationEmail(user.email, rawToken);

  logger.info("User registered (pending verification)", { userId: user._id.toString() });

  res.status(201).json({
    success: true,
    message:
      "Registration successful. Please check your email to verify your account.",
  });
});

export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new AppError("Invalid verification request", 400));
    }

    const { token } = req.body as { token: string };
    const hashedToken = hashToken(token);

    const user = await User.findOneAndUpdate(
      {
        verificationToken: hashedToken,
        verificationTokenExpires: { $gt: new Date() },
      },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: "", verificationTokenExpires: "" },
      },
      { new: true },
    );

    if (!user) {
      return next(
        new AppError("Verification link is invalid or has expired.", 400),
      );
    }

    await sendWelcomeEmail(user.email, user.firstName);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  },
);

export const resendVerification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400));
    }

    const { email } = req.body as { email: string };
    const user = await User.findOne({ email });

    // Only act for an existing, still-unverified account. Always return the
    // same generic response to avoid leaking which emails are registered.
    if (user && !user.isVerified) {
      const { rawToken, hashedToken } = createHashedToken();

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            verificationToken: hashedToken,
            verificationTokenExpires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
          },
        },
      );

      await sendVerificationEmail(user.email, rawToken);
    }

    res.status(200).json({
      success: true,
      message:
        "If an unverified account exists for that email, a new verification link has been sent.",
    });
  },
);

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

  if (!user.isVerified) {
    return next(
      new AppError("Please verify your email before logging in.", 403),
    );
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
    "favoriteCuisine",
    "cookingLevel",
    "specialDish",
    "location",
  ];

  const payload = req.body as UpdateProfileBody;

  const updateData = allowedFields.reduce<Record<string, unknown>>((acc, field) => {
    const value = payload[field];
    if (value !== undefined) {
      acc[field] = value;
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

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400));
    }

    const { email } = req.body as { email: string };
    const user = await User.findOne({ email });

    // Generic response regardless of whether the account exists (no enumeration).
    if (user) {
      const { rawToken, hashedToken } = createHashedToken();

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetToken: hashedToken,
            passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
          },
        },
      );

      await sendPasswordResetEmail(user.email, rawToken);
    }

    res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400));
    }

    const { token, password } = req.body as { token: string; password: string };
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return next(new AppError("Reset link is invalid or has expired.", 400));
    }

    // Assigning password triggers the pre-save hook which re-hashes it.
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  },
);
