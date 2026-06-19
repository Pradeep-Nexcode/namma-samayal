import { body, param } from "express-validator";

export const createCommentValidation = [
  body("recipeId").isMongoId().withMessage("Invalid recipe id"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
  body("parentComment")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent comment id"),
];

export const updateCommentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
];

export const commentIdValidation = [
  param("id").isMongoId().withMessage("Invalid comment id"),
];

export const recipeCommentsValidation = [
  param("recipeId").isMongoId().withMessage("Invalid recipe id"),
];
