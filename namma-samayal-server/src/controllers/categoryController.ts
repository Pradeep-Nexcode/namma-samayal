import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import Category, { ICategory } from "../models/Category.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../utils/logger.js";
import { buildPaginationMeta, parsePagination } from "../utils/pagination.js";
import { generateUniqueSlug } from "../utils/slug.js";

interface CategoryBody {
  name?: {
    en: string;
    ta?: string;
  };
  slug?: string;
  parent?: string | null;
}

interface CategoryQuery {
  level?: string;
  includeInactive?: string;
  search?: string;
  page?: string;
  limit?: string;
}

interface CategoryTreeNode {
  category: ICategory;
  subCategories: ICategory[];
}

const resolveParentCategory = async (
  parentId: string | null | undefined,
  next: NextFunction,
): Promise<Types.ObjectId | null> => {
  if (!parentId) {
    return null;
  }

  const parent = await Category.findOne({ _id: parentId, isActive: true });

  if (!parent) {
    next(new AppError("Parent category not found or inactive", 404));
    return null;
  }

  if (parent.level !== 0) {
    next(new AppError("Parent category must be a main category", 400));
    return null;
  }

  return parent._id;
};

export const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CategoryBody;

  if (!payload.name?.en) {
    return next(new AppError("Category name.en is required", 400));
  }

  const resolvedParent = await resolveParentCategory(payload.parent, next);

  if (payload.parent && !resolvedParent) {
    return;
  }

  const category = await Category.create({
    name: payload.name,
    slug: await generateUniqueSlug(Category, payload.slug ?? payload.name.en),
    parent: resolvedParent,
    level: resolvedParent ? 1 : 0,
    isActive: true,
  });

  logger.info("Category created", {
    categoryId: category._id.toString(),
    createdBy: req.user?.id,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as CategoryQuery;
  const includeInactive = query.includeInactive === "true";
  const { page, limit, skip } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const filter: Record<string, any> = {};
  
  if (query.level !== undefined && query.level !== "all") {
    filter.level = Number(query.level);
  } else if (query.level === undefined) {
    // Default to level 0 if not specified (for backward compatibility / consumer API)
    filter.level = 0;
  }

  if (query.search) {
    const searchRegex = { $regex: query.search, $options: "i" };
    filter.$or = [{ "name.en": searchRegex }, { "name.ta": searchRegex }];
  }

  if (!includeInactive) {
    filter.isActive = true;
  }

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .populate("parent", "name slug level")
      .sort({ "name.en": 1 })
      .skip(skip)
      .limit(limit),
    Category.countDocuments(filter),
  ]);
  const pagination = buildPaginationMeta(page, limit, total);

  res.status(200).json({
    success: true,
    data: categories,
    pagination,
  });
});

export const getSubCategories = catchAsync(async (req: Request, res: Response) => {
  const subCategories = await Category.find({
    parent: req.params.id,
    level: 1,
    isActive: true,
  }).sort({ "name.en": 1 });

  res.status(200).json({
    success: true,
    data: subCategories,
  });
});

export const getCategoryTree = catchAsync(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ level: 1, "name.en": 1 });

  const mainCategories = categories.filter((category) => category.level === 0);
  const tree: CategoryTreeNode[] = mainCategories.map((category) => ({
    category,
    subCategories: categories.filter(
      (candidate) => candidate.parent?.toString() === category._id.toString(),
    ),
  }));

  res.status(200).json({
    success: true,
    data: tree,
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as CategoryBody;
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  if (payload.parent !== undefined) {
    if (payload.parent === req.params.id) {
      return next(new AppError("Category cannot be its own parent", 400));
    }

    const resolvedParent = await resolveParentCategory(payload.parent, next);

    if (payload.parent && !resolvedParent) {
      return;
    }

    category.parent = resolvedParent;
    category.level = resolvedParent ? 1 : 0;
  }

  if (payload.name) {
    category.name = payload.name;
  }

  if (payload.slug) {
    category.slug = await generateUniqueSlug(Category, payload.slug, {
      excludeId: category._id,
    });
  } else if (payload.name?.en) {
    category.slug = await generateUniqueSlug(Category, payload.name.en, {
      excludeId: category._id,
    });
  }

  await category.save();

  logger.info("Category updated", {
    categoryId: category._id.toString(),
    updatedBy: req.user?.id,
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  category.isActive = false;
  await category.save();

  logger.warn("Category soft deleted", {
    categoryId: category._id.toString(),
    deletedBy: req.user?.id,
  });

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
