import { body, param, query } from "express-validator";

export const ingredientIdValidation = [
  param("id").isMongoId().withMessage("Invalid ingredient id"),
];

export const createIngredientValidation = [
  body("name.en").trim().notEmpty().withMessage("name.en is required"),
  body("name.ta").optional().isString().withMessage("name.ta must be a string"),
  body("slug").optional().trim().isString().withMessage("slug must be a string"),
  body("category").isMongoId().withMessage("category must be a valid category id"),
  body("subCategory")
    .optional()
    .isMongoId()
    .withMessage("subCategory must be a valid category id"),
  body("description.en").optional().isString().withMessage("description.en must be a string"),
  body("description.ta").optional().isString().withMessage("description.ta must be a string"),
  body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
  body("nutrition.calories").optional().isFloat({ min: 0 }).withMessage("calories must be >= 0"),
  body("nutrition.protein").optional().isFloat({ min: 0 }).withMessage("protein must be >= 0"),
  body("nutrition.carbs").optional().isFloat({ min: 0 }).withMessage("carbs must be >= 0"),
  body("nutrition.fat").optional().isFloat({ min: 0 }).withMessage("fat must be >= 0"),
  body("tags").optional().isArray().withMessage("tags must be an array"),
  body("tags.*").optional().isString().withMessage("each tag must be a string"),
];

export const updateIngredientValidation = [
  body("name.en").optional().trim().notEmpty().withMessage("name.en cannot be empty"),
  body("name.ta").optional().isString().withMessage("name.ta must be a string"),
  body("slug").optional().trim().isString().withMessage("slug must be a string"),
  body("category").optional().isMongoId().withMessage("category must be a valid category id"),
  body("subCategory")
    .optional()
    .isMongoId()
    .withMessage("subCategory must be a valid category id"),
  body("description.en").optional().isString().withMessage("description.en must be a string"),
  body("description.ta").optional().isString().withMessage("description.ta must be a string"),
  body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
  body("nutrition.calories").optional().isFloat({ min: 0 }).withMessage("calories must be >= 0"),
  body("nutrition.protein").optional().isFloat({ min: 0 }).withMessage("protein must be >= 0"),
  body("nutrition.carbs").optional().isFloat({ min: 0 }).withMessage("carbs must be >= 0"),
  body("nutrition.fat").optional().isFloat({ min: 0 }).withMessage("fat must be >= 0"),
  body("tags").optional().isArray().withMessage("tags must be an array"),
  body("tags.*").optional().isString().withMessage("each tag must be a string"),
];

export const listIngredientValidation = [
  query("category").optional().isMongoId().withMessage("category must be a valid category id"),
  query("subCategory")
    .optional()
    .isMongoId()
    .withMessage("subCategory must be a valid category id"),
  query("search").optional().trim().isString().withMessage("search must be a string"),
  query("includeInactive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("includeInactive must be true or false"),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 3000 })
    .withMessage("limit must be between 1 and 3000"),
];
