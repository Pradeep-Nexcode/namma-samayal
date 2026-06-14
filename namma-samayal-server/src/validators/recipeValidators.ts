import { body, param, query } from "express-validator";

const difficulties = ["easy", "medium", "hard"] as const;

export const listRecipeValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("limit must be between 1 and 500"),
  query("category").optional().isMongoId().withMessage("Invalid category id"),
  query("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory id"),
  query("search").optional().trim().isString().withMessage("search must be a string"),
  query("difficulty")
    .optional()
    .isIn(difficulties)
    .withMessage("Invalid difficulty level"),
];

export const recipeIdValidation = [
  // :id can be either a Mongo ObjectId or a URL slug
  param("id")
    .isString()
    .matches(/^([a-fA-F0-9]{24}|[a-z0-9][a-z0-9-]*[a-z0-9])$/)
    .withMessage("Invalid recipe id or slug"),
];

export const createRecipeValidation = [
  body("dishName.en").trim().notEmpty().withMessage("Dish name (EN) is required"),
  body("location.country").trim().notEmpty().withMessage("Country is required"),
  body("description.en").trim().notEmpty().withMessage("Description is required"),
  body("ingredients")
    .isArray({ min: 1 })
    .withMessage("At least one ingredient is required"),
  body("ingredients.*.ingredient")
    .isMongoId()
    .withMessage("Each ingredient must be a valid ingredient id"),
  body("ingredients.*.quantity")
    .optional()
    .isString()
    .withMessage("Ingredient quantity must be a string"),
  body("ingredients.*.unit")
    .optional()
    .isString()
    .withMessage("Ingredient unit must be a string"),
  body("steps").optional().isArray().withMessage("Steps must be an array"),
  body("sections").optional().isArray().withMessage("Sections must be an array"),
  body("prepTime").optional().isNumeric().withMessage("Prep time must be a number"),
  body("cookingTime").optional().isNumeric().withMessage("Cooking time must be a number"),
  body("totalTime").optional().isNumeric().withMessage("Total time must be a number"),
  body("category").optional().isMongoId().withMessage("Invalid category id"),
  body("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory id"),
  body("slug").optional().trim().isString().withMessage("slug must be a string"),
  body("difficulty")
    .optional()
    .isIn(difficulties)
    .withMessage("Invalid difficulty level"),
  body("seo").optional().isObject().withMessage("seo must be an object"),
  body("seo.title.en").optional().trim().isString().isLength({ max: 100 }).withMessage("seo.title.en must be a string ≤ 100 chars"),
  body("seo.title.ta").optional().trim().isString().isLength({ max: 100 }).withMessage("seo.title.ta must be a string ≤ 100 chars"),
  body("seo.description.en").optional().trim().isString().isLength({ max: 300 }).withMessage("seo.description.en must be a string ≤ 300 chars"),
  body("seo.description.ta").optional().trim().isString().isLength({ max: 300 }).withMessage("seo.description.ta must be a string ≤ 300 chars"),
  body("seo.keywords").optional().isArray().withMessage("seo.keywords must be an array"),
  body("seo.keywords.*").optional().isString().withMessage("each seo.keywords entry must be a string"),
];

export const updateRecipeValidation = [
  body("dishName.en")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Dish name cannot be empty"),
  body("description.en")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("ingredients")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one ingredient is required"),
  body("ingredients.*.ingredient")
    .optional()
    .isMongoId()
    .withMessage("Each ingredient must be a valid ingredient id"),
  body("ingredients.*.quantity")
    .optional()
    .isString()
    .withMessage("Ingredient quantity must be a string"),
  body("ingredients.*.unit")
    .optional()
    .isString()
    .withMessage("Ingredient unit must be a string"),
  body("steps")
    .optional()
    .isArray()
    .withMessage("Steps must be an array"),
  body("sections")
    .optional()
    .isArray()
    .withMessage("Sections must be an array"),
  body("prepTime")
    .optional()
    .isNumeric()
    .withMessage("Prep time must be a number"),
  body("cookingTime")
    .optional()
    .isNumeric()
    .withMessage("Cooking time must be a number"),
  body("totalTime")
    .optional()
    .isNumeric()
    .withMessage("Total time must be a number"),
  body("category").optional().isMongoId().withMessage("Invalid category id"),
  body("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory id"),
  body("slug").optional().trim().isString().withMessage("slug must be a string"),
  body("difficulty")
    .optional()
    .isIn(difficulties)
    .withMessage("Invalid difficulty level"),
  body("seo").optional().isObject().withMessage("seo must be an object"),
  body("seo.title.en").optional().trim().isString().isLength({ max: 100 }).withMessage("seo.title.en must be a string ≤ 100 chars"),
  body("seo.title.ta").optional().trim().isString().isLength({ max: 100 }).withMessage("seo.title.ta must be a string ≤ 100 chars"),
  body("seo.description.en").optional().trim().isString().isLength({ max: 300 }).withMessage("seo.description.en must be a string ≤ 300 chars"),
  body("seo.description.ta").optional().trim().isString().isLength({ max: 300 }).withMessage("seo.description.ta must be a string ≤ 300 chars"),
  body("seo.keywords").optional().isArray().withMessage("seo.keywords must be an array"),
  body("seo.keywords.*").optional().isString().withMessage("each seo.keywords entry must be a string"),
];

export const recipeRatingValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];
