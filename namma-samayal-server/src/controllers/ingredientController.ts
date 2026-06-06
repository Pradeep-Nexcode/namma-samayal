import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import Category from "../models/Category.js";
import Ingredient from "../models/Ingredient.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { deleteImageByUrl } from "../utils/imageHelper.js";
import { logger } from "../utils/logger.js";
import { buildPaginationMeta, parsePagination } from "../utils/pagination.js";
import { generateUniqueSlug } from "../utils/slug.js";

interface IngredientBody {
  name?: {
    en: string;
    ta?: string;
  };
  slug?: string;
  category?: string;
  subCategory?: string;
  description?: {
    en: string;
    ta?: string;
  };
  imageUrl?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  tags?: string[];
  isActive?: boolean | string;
}

interface IngredientQuery {
  category?: string;
  subCategory?: string;
  search?: string;
  includeInactive?: string;
  page?: string;
  limit?: string;
}

const validateCategoryLink = async (
  categoryId: string | undefined,
  subCategoryId: string | undefined,
  next: NextFunction,
): Promise<boolean> => {
  if (!categoryId) {
    next(new AppError("category is required", 400));
    return false;
  }

  const category = await Category.findOne({ _id: categoryId, isActive: true });

  if (!category) {
    next(new AppError("Category not found or inactive", 404));
    return false;
  }

  if (category.level !== 0) {
    next(new AppError("category must be a main category", 400));
    return false;
  }

  if (subCategoryId) {
    const subCategory = await Category.findOne({ _id: subCategoryId, isActive: true });

    if (!subCategory) {
      next(new AppError("Subcategory not found or inactive", 404));
      return false;
    }

    if (!subCategory.parent || subCategory.parent.toString() !== category._id.toString()) {
      next(new AppError("subCategory must belong to the selected category", 400));
      return false;
    }
  }

  return true;
};

export const createIngredient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as IngredientBody;
  const uploadedImageUrl = req.file?.path;

  if (!payload.name?.en) {
    return next(new AppError("Ingredient name.en is required", 400));
  }

  const isValidCategoryLink = await validateCategoryLink(
    payload.category,
    payload.subCategory,
    next,
  );

  if (!isValidCategoryLink) {
    return;
  }

  const ingredient = await Ingredient.create({
    name: payload.name,
    slug: await generateUniqueSlug(Ingredient, payload.slug ?? payload.name.en),
    category: payload.category,
    subCategory: payload.subCategory,
    description: payload.description,
    imageUrl: uploadedImageUrl ?? payload.imageUrl,
    nutrition: payload.nutrition,
    tags: payload.tags ?? [],
    isActive: true,
  });

  await ingredient.populate("category", "name slug parent level");
  await ingredient.populate("subCategory", "name slug parent level");

  logger.info("Ingredient created", {
    ingredientId: ingredient._id.toString(),
    createdBy: req.user?.id,
  });

  res.status(201).json({
    success: true,
    message: "Ingredient created successfully",
    data: ingredient,
  });
});

export const getAllIngredients = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as IngredientQuery & {
    status?: string;
    hasImage?: string;
    sort?: string;
  };

  const { page, limit, skip } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const filter: Record<string, any> = {};

  if (query.category) filter.category = query.category;
  if (query.subCategory) filter.subCategory = query.subCategory;

  // Status filter: "active" | "inactive" | "all" — overrides legacy includeInactive
  if (query.status === "active") {
    filter.isActive = true;
  } else if (query.status === "inactive") {
    filter.isActive = false;
  } else if (query.status === "all" || query.includeInactive === "true") {
    // no isActive constraint
  } else {
    // default — only active
    filter.isActive = true;
  }

  if (query.hasImage === "true") {
    filter.imageUrl = { $exists: true, $nin: [null, ""] };
  } else if (query.hasImage === "false") {
    filter.$or = [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: "" }];
  }

  if (query.search) {
    const searchRegex = { $regex: query.search, $options: "i" };
    const searchClauses = [
      { "name.en": searchRegex },
      { "name.ta": searchRegex },
      { "description.en": searchRegex },
      { "description.ta": searchRegex },
      { tags: searchRegex },
    ];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchClauses }];
      delete filter.$or;
    } else {
      filter.$or = searchClauses;
    }
  }

  let sortOption: Record<string, 1 | -1> = { "name.en": 1 };
  switch (query.sort) {
    case "name-desc":
      sortOption = { "name.en": -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    case "name-asc":
    default:
      sortOption = { "name.en": 1 };
  }

  const [ingredients, total] = await Promise.all([
    Ingredient.find(filter)
      .populate("category", "name slug parent level")
      .populate("subCategory", "name slug parent level")
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Ingredient.countDocuments(filter),
  ]);
  const pagination = buildPaginationMeta(page, limit, total);

  res.status(200).json({
    success: true,
    data: ingredients,
    pagination,
  });
});

export const getIngredientById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ingredient = await Ingredient.findById(req.params.id)
    .populate("category", "name slug parent level")
    .populate("subCategory", "name slug parent level");

  if (!ingredient) {
    return next(new AppError("Ingredient not found", 404));
  }

  res.status(200).json({
    success: true,
    data: ingredient,
  });
});

export const updateIngredient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as IngredientBody;
  const uploadedImageUrl = req.file?.path;
  const ingredient = await Ingredient.findById(req.params.id);

  if (!ingredient) {
    return next(new AppError("Ingredient not found", 404));
  }

  const categoryId = payload.category ?? ingredient.category.toString();
  const subCategoryId = payload.subCategory ?? ingredient.subCategory?.toString();

  const isValidCategoryLink = await validateCategoryLink(categoryId, subCategoryId, next);

  if (!isValidCategoryLink) {
    return;
  }

  if (payload.name) {
    ingredient.name = payload.name;
  }

  if (payload.slug) {
    ingredient.slug = await generateUniqueSlug(Ingredient, payload.slug, {
      excludeId: ingredient._id,
    });
  } else if (payload.name?.en) {
    ingredient.slug = await generateUniqueSlug(Ingredient, payload.name.en, {
      excludeId: ingredient._id,
    });
  }

  ingredient.category = new Types.ObjectId(categoryId);
  ingredient.subCategory = subCategoryId ? new Types.ObjectId(subCategoryId) : undefined;

  if (payload.description !== undefined) {
    ingredient.description = payload.description;
  }

  if (uploadedImageUrl) {
    await deleteImageByUrl(ingredient.imageUrl);
    ingredient.imageUrl = uploadedImageUrl;
  } else if (payload.imageUrl !== undefined) {
    ingredient.imageUrl = payload.imageUrl;
  }

  if (payload.nutrition !== undefined) {
    ingredient.nutrition = payload.nutrition;
  }

  if (payload.tags !== undefined) {
    ingredient.tags = payload.tags;
  }

  if (payload.isActive !== undefined) {
    ingredient.isActive = payload.isActive === true || payload.isActive === "true";
  }

  await ingredient.save();
  await ingredient.populate("category", "name slug parent level");
  await ingredient.populate("subCategory", "name slug parent level");

  logger.info("Ingredient updated", {
    ingredientId: ingredient._id.toString(),
    updatedBy: req.user?.id,
  });

  res.status(200).json({
    success: true,
    message: "Ingredient updated successfully",
    data: ingredient,
  });
});

export const deleteIngredient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ingredient = await Ingredient.findById(req.params.id);

  if (!ingredient) {
    return next(new AppError("Ingredient not found", 404));
  }

  await deleteImageByUrl(ingredient.imageUrl);
  ingredient.isActive = false;
  await ingredient.save();

  logger.warn("Ingredient soft deleted", {
    ingredientId: ingredient._id.toString(),
    deletedBy: req.user?.id,
  });

  res.status(200).json({
    success: true,
    message: "Ingredient deleted successfully",
  });
});
