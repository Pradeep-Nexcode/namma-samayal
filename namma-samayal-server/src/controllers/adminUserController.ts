import { NextFunction, Request, Response } from "express";

import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../utils/logger.js";
import { buildPaginationMeta, parsePagination } from "../utils/pagination.js";

interface ListQuery {
  page?: string;
  limit?: string;
  search?: string;
  role?: "user" | "admin" | "all";
  status?: "active" | "inactive" | "all";
  language?: "en" | "ta" | "all";
  sort?: "newest" | "oldest" | "name-asc" | "name-desc" | "recipes-desc" | "lastLogin-desc";
}

// GET /admin/users
export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const q = req.query as ListQuery;
  const { page, limit, skip } = parsePagination({ page: q.page, limit: q.limit });

  const filter: Record<string, unknown> = {};

  if (q.role && q.role !== "all") {
    filter.role = q.role;
  }
  if (q.status && q.status !== "all") {
    filter.isActive = q.status === "active";
  }
  if (q.language && q.language !== "all") {
    filter.language = q.language;
  }
  if (q.search) {
    const re = { $regex: q.search, $options: "i" };
    filter.$or = [
      { username: re },
      { email: re },
      { firstName: re },
      { lastName: re },
    ];
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  switch (q.sort) {
    case "oldest":      sortOption = { createdAt: 1 }; break;
    case "name-asc":    sortOption = { firstName: 1, lastName: 1 }; break;
    case "name-desc":   sortOption = { firstName: -1, lastName: -1 }; break;
    case "lastLogin-desc": sortOption = { lastLogin: -1 }; break;
    case "newest":
    default:            sortOption = { createdAt: -1 };
  }

  // We don't pre-aggregate counts in the sort path. For "recipes-desc" we sort
  // client-side after the fetch (limited to the current page) or use $size on
  // createdRecipes. Keep it simple — use $size where possible:
  if (q.sort === "recipes-desc") {
    // Mongoose doesn't let you sort by array length without aggregation, so use aggregate.
    const pipeline: any[] = [
      { $match: filter },
      { $addFields: { recipesCount: { $size: { $ifNull: ["$createdRecipes", []] } } } },
      { $sort: { recipesCount: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { password: 0 } },
    ];
    const [items, total] = await Promise.all([
      User.aggregate(pipeline),
      User.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: items.map(decorateCounts),
      pagination: buildPaginationMeta(page, limit, total),
    });
    return;
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: users.map(decorateCounts),
    pagination: buildPaginationMeta(page, limit, total),
  });
});

// GET /admin/users/:id
export const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) return next(new AppError("User not found", 404));

  // Pull lightweight info about the user's recipes so admin can see their activity
  const recipes = await Recipe.find({ createdBy: user._id })
    .select("dishName slug title imageUrl isApproved difficulty createdAt source")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      ...decorateCounts(user),
      recentRecipes: recipes,
    },
  });
});

// PATCH /admin/users/:id  — toggle isActive or change role
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const allowed: Array<keyof typeof req.body> = ["isActive", "role", "language", "firstName", "lastName"];
  const payload: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) payload[key as string] = req.body[key];
  }

  if (payload.role && payload.role !== "user" && payload.role !== "admin") {
    return next(new AppError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).lean();
  if (!user) return next(new AppError("User not found", 404));

  logger.info("Admin updated user", { userId: user._id.toString(), changes: Object.keys(payload) });

  res.status(200).json({ success: true, data: decorateCounts(user) });
});

// DELETE /admin/users/:id  — soft delete (sets isActive = false)
export const softDeleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
  if (!user) return next(new AppError("User not found", 404));

  logger.info("Admin soft-deleted user", { userId: user._id.toString() });

  res.status(200).json({ success: true, message: "User deactivated", data: decorateCounts(user) });
});

// Helper: append count fields so the client doesn't need to count arrays itself
function decorateCounts(user: any) {
  const createdCount = Array.isArray(user.createdRecipes) ? user.createdRecipes.length : 0;
  const favoritesCount = Array.isArray(user.favoriteRecipes) ? user.favoriteRecipes.length : 0;
  const savedCount = Array.isArray(user.savedRecipes) ? user.savedRecipes.length : 0;
  return {
    ...user,
    counts: {
      createdRecipes: createdCount,
      favoriteRecipes: favoritesCount,
      savedRecipes: savedCount,
    },
  };
}
