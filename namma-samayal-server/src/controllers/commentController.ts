import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";

import Comment from "../models/Comment.js";
import Recipe from "../models/Recipe.js";
import { AppError } from "../utils/appError.js";
import {
  RawComment,
  buildCommentTree,
  serializeComment,
} from "../utils/buildCommentTree.js";
import { catchAsync } from "../utils/catchAsync.js";
import { buildPaginationMeta, parsePagination } from "../utils/pagination.js";

const USER_FIELDS = "username firstName lastName profileImage";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new AppError("Not authenticated", 401);
  }
  return req.user.id;
};

export const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400));
    }

    const userId = getAuthenticatedUserId(req);
    const { recipeId, content, parentComment } = req.body as {
      recipeId: string;
      content: string;
      parentComment?: string;
    };

    const recipe = await Recipe.findById(recipeId).select("_id");
    if (!recipe) {
      return next(new AppError("Recipe not found", 404));
    }

    let parentId: Types.ObjectId | null = null;
    let replyTo: Types.ObjectId | null = null;

    if (parentComment) {
      const parent = await Comment.findOne({
        _id: parentComment,
        recipe: recipeId,
        isDeleted: false,
        status: "active",
      });

      if (!parent) {
        return next(new AppError("Parent comment not found", 404));
      }

      // Normalize reply-to-a-reply up to the top-level ancestor (2-level model).
      parentId = parent.parentComment ?? parent._id;
      replyTo = parent.user;
    }

    const comment = await Comment.create({
      recipe: recipeId,
      user: userId,
      content,
      parentComment: parentId,
      replyTo,
    });

    if (parentId) {
      await Comment.updateOne({ _id: parentId }, { $inc: { repliesCount: 1 } });
    }

    await comment.populate([
      { path: "user", select: USER_FIELDS },
      { path: "replyTo", select: "username firstName lastName" },
    ]);

    res.status(201).json({
      success: true,
      message: "Comment posted",
      data: serializeComment(comment.toObject() as unknown as RawComment),
    });
  },
);

export const getRecipeComments = catchAsync(
  async (req: Request, res: Response) => {
    const { recipeId } = req.params;
    const { page, limit, skip } = parsePagination(req.query, 100);
    const topSort = req.query.sort === "oldest" ? 1 : -1; // default: newest first

    const baseFilter = { recipe: recipeId, status: "active" } as const;

    const [topLevel, topTotal, count] = await Promise.all([
      Comment.find({ ...baseFilter, parentComment: null })
        .sort({ createdAt: topSort })
        .skip(skip)
        .limit(limit)
        .populate("user", USER_FIELDS)
        .lean(),
      Comment.countDocuments({ ...baseFilter, parentComment: null }),
      // "Kitchen Talk (N)" — total non-deleted comments + replies on this recipe.
      Comment.countDocuments({ ...baseFilter, isDeleted: false }),
    ]);

    const topIds = topLevel.map((c) => c._id);

    const replies = topIds.length
      ? await Comment.find({ ...baseFilter, parentComment: { $in: topIds } })
          .sort({ createdAt: 1 })
          .populate("user", USER_FIELDS)
          .populate("replyTo", "username")
          .lean()
      : [];

    const tree = buildCommentTree(
      topLevel as unknown as RawComment[],
      replies as unknown as RawComment[],
    );

    res.status(200).json({
      success: true,
      count,
      data: tree,
      pagination: buildPaginationMeta(page, limit, topTotal),
    });
  },
);

export const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError("Validation failed", 400));
    }

    const userId = getAuthenticatedUserId(req);
    const { content } = req.body as { content: string };

    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return next(new AppError("Comment not found", 404));
    }

    if (comment.user.toString() !== userId) {
      return next(new AppError("You can only edit your own comment", 403));
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate([
      { path: "user", select: USER_FIELDS },
      { path: "replyTo", select: "username firstName lastName" },
    ]);

    res.status(200).json({
      success: true,
      message: "Comment updated",
      data: serializeComment(comment.toObject() as unknown as RawComment),
    });
  },
);

export const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = getAuthenticatedUserId(req);

    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) {
      return next(new AppError("Comment not found", 404));
    }

    const isOwner = comment.user.toString() === userId;
    if (!isOwner && req.user?.role !== "admin") {
      return next(
        new AppError("You can only delete your own comment", 403),
      );
    }

    // Soft delete — keep the row so its replies survive ("[deleted]" shown).
    comment.isDeleted = true;
    await comment.save();

    if (comment.parentComment) {
      await Comment.updateOne(
        { _id: comment.parentComment, repliesCount: { $gt: 0 } },
        { $inc: { repliesCount: -1 } },
      );
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted",
    });
  },
);
