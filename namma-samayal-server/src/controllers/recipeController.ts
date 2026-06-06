import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";

import Category from "../models/Category.js";
import Ingredient from "../models/Ingredient.js";
import Recipe from "../models/Recipe.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { deleteImageByUrl } from "../utils/imageHelper.js";
import { logger } from "../utils/logger.js";
import { buildPaginationMeta, parsePagination } from "../utils/pagination.js";
import { generateUniqueSlug } from "../utils/slug.js";

interface RecipeQuery {
  page?: string;
  limit?: string;
  category?: string;
  subCategory?: string;
  difficulty?: string;
  country?: string;
  state?: string;
  region?: string;
  search?: string;
}

interface RateRecipeBody {
  rating: number;
}

interface RecipeIngredientInput {
  ingredient: string;
  quantity?: string;
  unit?: string;
}

interface RecipePayload {
  dishName?: {
    en: string;
    ta?: string;
  };
  slug?: string;
  imageUrl?: string;
  ingredients?: RecipeIngredientInput[];
  category?: string;
  subCategory?: string;
  sections?: any[];
}

const recipeIngredientPopulate = {
  path: "ingredients",
  populate: {
    path: "ingredient",
    model: "Ingredient",
    populate: [
      { path: "category", select: "name slug parent level" },
      { path: "subCategory", select: "name slug parent level" },
    ],
  },
};

const recipeCategoryPopulate = [
  { path: "category", select: "name slug parent level" },
  { path: "subCategory", select: "name slug parent level" },
];

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new AppError("Not authenticated", 401);
  }

  return req.user.id;
};

const isAdminRequest = (req: Request): boolean => req.user?.role === "admin";

const getRecipeOwnerId = (createdBy: unknown): string => {
  if (createdBy instanceof Types.ObjectId) {
    return createdBy.toString();
  }

  if (
    typeof createdBy === "object" &&
    createdBy !== null &&
    "_id" in createdBy &&
    (createdBy as { _id: Types.ObjectId })._id
  ) {
    return (createdBy as { _id: Types.ObjectId })._id.toString();
  }

  return String(createdBy);
};

const validateIngredientReferences = async (
  ingredients: RecipeIngredientInput[] | undefined,
  next: NextFunction,
): Promise<boolean> => {
  if (!ingredients || ingredients.length === 0) {
    return true;
  }

  const ids = ingredients.map((item) => item.ingredient);

  const uniqueIngredientIds = Array.from(new Set(ids)).map((id) => new Types.ObjectId(id));
  const existingIngredients = await Ingredient.countDocuments({
    _id: { $in: uniqueIngredientIds },
    isActive: true,
  });

  if (existingIngredients !== uniqueIngredientIds.length) {
    next(new AppError("One or more ingredients are invalid or inactive", 400));
    return false;
  }

  return true;
};

const validateCategoryReferences = async (
  payload: RecipePayload,
  next: NextFunction,
): Promise<boolean> => {
  if (!payload.category && !payload.subCategory) {
    return true;
  }

  let categoryId: Types.ObjectId | undefined;
  let subCategoryId: Types.ObjectId | undefined;

  if (payload.category) {
    categoryId = new Types.ObjectId(payload.category);
    const category = await Category.findOne({
      _id: categoryId,
      isActive: true,
    }).select("_id parent");

    if (!category) {
      next(new AppError("Category is invalid or inactive", 400));
      return false;
    }

    if (category.parent) {
      next(new AppError("Category must be a top-level category", 400));
      return false;
    }
  }

  if (payload.subCategory) {
    subCategoryId = new Types.ObjectId(payload.subCategory);
    const subCategory = await Category.findOne({
      _id: subCategoryId,
      isActive: true,
    }).select("_id parent");

    if (!subCategory) {
      next(new AppError("Subcategory is invalid or inactive", 400));
      return false;
    }

    if (!subCategory.parent) {
      next(new AppError("Subcategory must have a parent category", 400));
      return false;
    }

    if (categoryId && subCategory.parent.toString() !== categoryId.toString()) {
      next(new AppError("Subcategory does not belong to selected category", 400));
      return false;
    }
  }

  return true;
};

export const getAllRecipes = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as RecipeQuery;

  const { page, limit, skip } = parsePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const query: Record<string, any> = { isPublic: true, isApproved: true };

  if (queryParams.category) query.category = queryParams.category;
  if (queryParams.subCategory) query.subCategory = queryParams.subCategory;
  if (queryParams.difficulty) query.difficulty = queryParams.difficulty;
  if (queryParams.country) query["location.country"] = queryParams.country;
  if (queryParams.state) query["location.state"] = queryParams.state;
  if (queryParams.region) query["location.region"] = queryParams.region;
  if (queryParams.search) {
    const searchRegex = { $regex: queryParams.search, $options: "i" };
    query.$or = [
      { "dishName.en": searchRegex },
      { "dishName.ta": searchRegex },
      { "description.en": searchRegex },
      { "description.ta": searchRegex },
      { tags: searchRegex },
    ];
  }

  const recipes = await Recipe.find(query)
    .populate("createdBy", "username firstName lastName")
    .populate(recipeCategoryPopulate)
    .populate(recipeIngredientPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Recipe.countDocuments(query);
  const pagination = buildPaginationMeta(page, limit, total);

  res.status(200).json({
    success: true,
    data: recipes,
    pagination,
    message: "Recipes fetched successfully",
  });
});

export const getRecipeById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate("createdBy", "username firstName lastName")
    .populate(recipeCategoryPopulate)
    .populate(recipeIngredientPopulate)
    .populate("ratings.user", "username");

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  if (!recipe.isPublic) {
    const requestUserId = req.user?.id;
    const ownerId = getRecipeOwnerId(recipe.createdBy);

    if (!requestUserId || ownerId !== requestUserId) {
      return next(new AppError("Access denied", 403));
    }
  }

  res.status(200).json({
    success: true,
    data: recipe,
  });
});

export const createRecipe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new AppError(
        errors
          .array()
          .map((error) => error.msg)
          .join(", "),
        400,
      ),
    );
  }

  const userId = getAuthenticatedUserId(req);
  const payload = req.body as RecipePayload;
  const uploadedImageUrl = req.file?.path;

  if (uploadedImageUrl) {
    payload.imageUrl = uploadedImageUrl;
  }

  const isIngredientRefsValid = await validateIngredientReferences(
    payload.ingredients,
    next,
  );

  if (!isIngredientRefsValid) {
    return;
  }
  const isCategoryRefsValid = await validateCategoryReferences(payload, next);

  if (!isCategoryRefsValid) {
    return;
  }
  const slugSource = payload.slug ?? payload.dishName?.en;

  if (!slugSource) {
    return next(new AppError("slug or dishName.en is required", 400));
  }

  const slug = await generateUniqueSlug(Recipe, slugSource);

  const recipe = await Recipe.create({
    ...payload,
    slug,
    createdBy: userId,
  });

  await recipe.populate("createdBy", "username firstName lastName");
  await recipe.populate(recipeCategoryPopulate);
  await recipe.populate(recipeIngredientPopulate);

  logger.info("Recipe created", { recipeId: recipe._id.toString(), userId });

  res.status(201).json({
    success: true,
    message: "Recipe created successfully",
    data: recipe,
  });
});

export const updateRecipe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new AppError(
        errors
          .array()
          .map((error) => error.msg)
          .join(", "),
        400,
      ),
    );
  }

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  const userId = getAuthenticatedUserId(req);
  const payload = req.body as RecipePayload;
  const uploadedImageUrl = req.file?.path;

  if (getRecipeOwnerId(recipe.createdBy) !== userId && !isAdminRequest(req)) {
    return next(new AppError("You can only update your own recipes", 403));
  }

  const isIngredientRefsValid = await validateIngredientReferences(
    payload.ingredients,
    next,
  );

  if (!isIngredientRefsValid) {
    return;
  }
  const isCategoryRefsValid = await validateCategoryReferences(payload, next);

  if (!isCategoryRefsValid) {
    return;
  }

  if (payload.slug || payload.dishName?.en) {
    const slugSource = payload.slug ?? payload.dishName?.en;

    if (!slugSource) {
      return next(new AppError("slug or dishName.en is required", 400));
    }

    payload.slug = await generateUniqueSlug(Recipe, slugSource, {
      excludeId: recipe._id,
    });
  }

  if (uploadedImageUrl) {
    await deleteImageByUrl(recipe.imageUrl);
    payload.imageUrl = uploadedImageUrl;
  }

  // Explicitly handle nested arrays to ensure Mongoose detects reordering without _id
  if (payload.sections) {
    recipe.set('sections', payload.sections);
    recipe.markModified('sections');
    delete payload.sections;
  }
  if (payload.ingredients) {
    recipe.set('ingredients', payload.ingredients);
    recipe.markModified('ingredients');
    delete payload.ingredients;
  }

  Object.assign(recipe, payload);

  await recipe.save();
  await recipe.populate("createdBy", "username firstName lastName");
  await recipe.populate(recipeCategoryPopulate);
  await recipe.populate(recipeIngredientPopulate);

  logger.info("Recipe updated", { recipeId: recipe._id.toString(), userId });

  res.status(200).json({
    success: true,
    message: "Recipe updated successfully",
    data: recipe,
  });
});

export const deleteRecipe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  const userId = getAuthenticatedUserId(req);

  if (getRecipeOwnerId(recipe.createdBy) !== userId && !isAdminRequest(req)) {
    return next(new AppError("You can only delete your own recipes", 403));
  }

  await deleteImageByUrl(recipe.imageUrl);
  await recipe.deleteOne();

  logger.warn("Recipe deleted", { recipeId: recipe._id.toString(), userId });

  res.status(200).json({
    success: true,
    message: "Recipe deleted successfully",
  });
});

export const rateRecipe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { rating } = req.body as RateRecipeBody;

  if (rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  const userId = getAuthenticatedUserId(req);

  const existingRating = recipe.ratings.find((item) => item.user.toString() === userId);

  if (existingRating) {
    existingRating.rating = rating;
  } else {
    recipe.ratings.push({ user: new Types.ObjectId(userId), rating });
  }

  const total = recipe.ratings.reduce((sum, item) => sum + item.rating, 0);
  recipe.averageRating = recipe.ratings.length > 0 ? total / recipe.ratings.length : 0;

  await recipe.save();

  logger.info("Recipe rated", {
    recipeId: recipe._id.toString(),
    userId,
    rating,
  });

  res.status(200).json({
    success: true,
    message: "Recipe rated successfully",
    data: recipe,
  });
});
