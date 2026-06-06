import { NextFunction, Request, Response } from "express";

import Recipe from "../models/Recipe.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../utils/logger.js";
import { generateUniqueSlug } from "../utils/slug.js";
import { buildPaginationMeta, parsePagination } from "../utils/pagination.js";

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

export const getPendingRecipes = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as { page?: string; limit?: string; search?: string };
  const { page, limit, skip } = parsePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const query: any = { isApproved: false };
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
    .populate("createdBy", "username firstName lastName email")
    .populate(recipeCategoryPopulate)
    .populate(recipeIngredientPopulate)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Recipe.countDocuments(query);
  const pagination = buildPaginationMeta(page, limit, total);

  res.status(200).json({
    success: true,
    message: "Pending recipes fetched successfully",
    data: recipes,
    pagination,
  });
});

export const getAllAdminRecipes = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as {
    page?: string;
    limit?: string;
    search?: string;
    isApproved?: string;
    isPublic?: string;
    category?: string;
    subCategory?: string;
    difficulty?: string;
    source?: string;
    country?: string;
    state?: string;
    region?: string;
    hasImage?: string;
    sort?: string;
  };
  const { page, limit, skip } = parsePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const query: any = {};
  if (queryParams.isApproved !== undefined && queryParams.isApproved !== "") {
    query.isApproved = queryParams.isApproved === "true";
  }
  if (queryParams.isPublic !== undefined && queryParams.isPublic !== "") {
    query.isPublic = queryParams.isPublic === "true";
  }
  if (queryParams.category) query.category = queryParams.category;
  if (queryParams.subCategory) query.subCategory = queryParams.subCategory;
  if (queryParams.difficulty) query.difficulty = queryParams.difficulty;
  if (queryParams.source) query.source = queryParams.source;
  if (queryParams.country) query["location.country"] = queryParams.country;
  if (queryParams.state) query["location.state"] = queryParams.state;
  if (queryParams.region) query["location.region"] = queryParams.region;
  if (queryParams.hasImage === "true") {
    query.imageUrl = { $exists: true, $nin: [null, ""] };
  } else if (queryParams.hasImage === "false") {
    query.$or = [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: "" }];
  }
  if (queryParams.search) {
    const searchRegex = { $regex: queryParams.search, $options: "i" };
    const searchClauses = [
      { "dishName.en": searchRegex },
      { "dishName.ta": searchRegex },
      { "seo.title.en": searchRegex },
      { "seo.title.ta": searchRegex },
      { "description.en": searchRegex },
      { "description.ta": searchRegex },
      { tags: searchRegex },
    ];
    // If we already use $or for hasImage=false, merge via $and
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchClauses }];
      delete query.$or;
    } else {
      query.$or = searchClauses;
    }
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  switch (queryParams.sort) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "name-asc":
      sortOption = { "dishName.en": 1 };
      break;
    case "name-desc":
      sortOption = { "dishName.en": -1 };
      break;
    case "rating-desc":
      sortOption = { averageRating: -1, createdAt: -1 };
      break;
    case "newest":
    default:
      sortOption = { createdAt: -1 };
  }

  const recipes = await Recipe.find(query)
    .populate("createdBy", "username firstName lastName email")
    .populate(recipeCategoryPopulate)
    .populate(recipeIngredientPopulate)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const total = await Recipe.countDocuments(query);
  const pagination = buildPaginationMeta(page, limit, total);

  res.status(200).json({
    success: true,
    message: "Admin recipes fetched successfully",
    data: recipes,
    pagination,
  });
});

export const approveRecipe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  if (!recipe.slug && recipe.dishName?.en) {
    recipe.slug = await generateUniqueSlug(Recipe, recipe.dishName.en, {
      excludeId: recipe._id,
    });
  }

  recipe.isApproved = true;
  await recipe.save();
  await recipe.populate(recipeCategoryPopulate);
  await recipe.populate(recipeIngredientPopulate);

  logger.info("Recipe approved by admin", {
    recipeId: recipe._id.toString(),
    approvedBy: req.user?.id,
  });

  res.status(200).json({
    success: true,
    message: "Recipe approved successfully",
    data: recipe,
  });
});

export const deleteRecipeByAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new AppError("Recipe not found", 404));
    }

    await recipe.deleteOne();

    logger.warn("Recipe deleted by admin", {
      recipeId: recipe._id.toString(),
      deletedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  },
);
