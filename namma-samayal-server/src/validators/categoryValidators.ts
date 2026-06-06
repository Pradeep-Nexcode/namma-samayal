import { body, param, query } from "express-validator";

export const categoryIdValidation = [
  param("id").isMongoId().withMessage("Invalid category id"),
];

export const createCategoryValidation = [
  body("name.en").trim().notEmpty().withMessage("name.en is required"),
  body("name.ta").optional().isString().withMessage("name.ta must be a string"),
  body("slug").optional().trim().isString().withMessage("slug must be a string"),
  body("parent").optional({ nullable: true }).isMongoId().withMessage("parent must be a valid category id"),
];

export const updateCategoryValidation = [
  body("name.en").optional().trim().notEmpty().withMessage("name.en cannot be empty"),
  body("name.ta").optional().isString().withMessage("name.ta must be a string"),
  body("slug").optional().trim().isString().withMessage("slug must be a string"),
  body("parent")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) {
        return true;
      }

      return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
    })
    .withMessage("parent must be null or a valid category id"),
];

export const listCategoryValidation = [
  query("level").optional().custom((value) => {
    if (value === "all" || value === "0" || value === "1" || value === 0 || value === 1) {
      return true;
    }
    throw new Error("level must be 0, 1, or all");
  }),
  query("search").optional().trim().isString().withMessage("search must be a string"),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("includeInactive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("includeInactive must be true or false"),
];
