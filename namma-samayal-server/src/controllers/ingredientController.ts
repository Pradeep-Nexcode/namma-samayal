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

type IText = { en?: string; ta?: string };
type StrictText = { en: string; ta?: string };

interface IngredientBody {
  name?: StrictText;
  slug?: string;
  category?: string;
  subCategory?: string;
  description?: StrictText;
  imageUrl?: string;
  nutrition?: unknown;
  tags?: string[] | string;
  isActive?: boolean | string;

  // Extended fields
  origin?: unknown;
  season?: unknown;
  status?: string;
  isPremium?: boolean | string;
  whySpecial?: unknown;
  chefTip?: unknown;
  howToStore?: unknown;
  quickBenefits?: unknown;
  substitutes?: unknown;
  substituteNotes?: unknown;
}

interface IngredientQuery {
  category?: string;
  subCategory?: string;
  search?: string;
  includeInactive?: string;
  page?: string;
  limit?: string;
}

/** Parse a field that may arrive as a real object/array OR a JSON-stringified
 *  multipart form value. Returns undefined if value is null/undefined/empty. */
function parseMaybeJson<T>(value: unknown): T | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  return value as T;
}

/** Coerce a boolean coming from JSON or multipart strings. */
function parseBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return Boolean(value);
}

/** Normalise tags: accepts an array or a JSON string of an array. */
function parseTags(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === "string") {
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) return arr.map((v) => String(v));
    } catch {
      // Comma-separated fallback
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return undefined;
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

/** Build the extended-field payload from a request body. Each field is parsed
 *  and only included if the caller actually sent something for it — so unset
 *  fields don't clobber existing values on update. */
function extractExtendedFields(payload: IngredientBody): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (payload.origin !== undefined) {
    out.origin = parseMaybeJson<{ country?: string; state?: string }>(payload.origin);
  }
  if (payload.season !== undefined) {
    out.season = parseMaybeJson<{
      availability?: "year-round" | "seasonal";
      bestMonths?: number[];
    }>(payload.season);
  }
  if (payload.status !== undefined) {
    out.status = payload.status;
  }
  if (payload.isPremium !== undefined) {
    out.isPremium = parseBool(payload.isPremium);
  }
  if (payload.whySpecial !== undefined) {
    out.whySpecial = parseMaybeJson<IText>(payload.whySpecial);
  }
  if (payload.chefTip !== undefined) {
    out.chefTip = parseMaybeJson<{ en?: string; ta?: string; attributedTo?: string }>(
      payload.chefTip,
    );
  }
  if (payload.howToStore !== undefined) {
    out.howToStore = parseMaybeJson<IText>(payload.howToStore);
  }
  if (payload.quickBenefits !== undefined) {
    out.quickBenefits = parseMaybeJson<IText[]>(payload.quickBenefits);
  }
  if (payload.substitutes !== undefined) {
    out.substitutes = parseMaybeJson<string[]>(payload.substitutes);
  }
  if (payload.substituteNotes !== undefined) {
    out.substituteNotes = parseMaybeJson<Record<string, unknown>>(payload.substituteNotes);
  }
  if (payload.nutrition !== undefined) {
    out.nutrition = parseMaybeJson<Record<string, unknown>>(payload.nutrition);
  }

  return out;
}

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

  const extended = extractExtendedFields(payload);

  const ingredient = await Ingredient.create({
    name: payload.name,
    slug: await generateUniqueSlug(Ingredient, payload.slug ?? payload.name.en),
    category: payload.category,
    subCategory: payload.subCategory,
    description: payload.description,
    imageUrl: uploadedImageUrl ?? payload.imageUrl,
    nutrition: extended.nutrition ?? payload.nutrition,
    tags: parseTags(payload.tags) ?? [],
    isActive: true,
    ...extended,
  });

  await ingredient.populate("category", "name slug parent level");
  await ingredient.populate("subCategory", "name slug parent level");
  await ingredient.populate("substitutes", "name slug imageUrl category");

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
    isPremium?: string;
  };

  const { page, limit, skip } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const filter: Record<string, any> = {};

  if (query.category) filter.category = query.category;
  if (query.subCategory) filter.subCategory = query.subCategory;
  if (query.isPremium === "true") filter.isPremium = true;
  if (query.isPremium === "false") filter.isPremium = { $ne: true };

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
  // Accept either a Mongo ObjectId or a slug in the same :id param,
  // so /ingredients/:slug and /ingredients/:id both resolve to the same handler.
  const idOrSlug = String(req.params.id);
  const query = Types.ObjectId.isValid(idOrSlug)
    ? Ingredient.findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] })
    : Ingredient.findOne({ slug: idOrSlug });

  const ingredient = await query
    .populate("category", "name slug parent level")
    .populate("subCategory", "name slug parent level")
    .populate("substitutes", "name slug imageUrl category status");

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

  // Extended fields — apply only when caller actually sent something
  const extended = extractExtendedFields(payload);
  for (const [key, value] of Object.entries(extended)) {
    (ingredient as unknown as Record<string, unknown>)[key] = value;
  }

  const parsedTags = parseTags(payload.tags);
  if (parsedTags !== undefined) {
    ingredient.tags = parsedTags;
  }

  if (payload.isActive !== undefined) {
    const v = parseBool(payload.isActive);
    if (v !== undefined) ingredient.isActive = v;
  }

  await ingredient.save();
  await ingredient.populate("category", "name slug parent level");
  await ingredient.populate("subCategory", "name slug parent level");
  await ingredient.populate("substitutes", "name slug imageUrl category status");

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
