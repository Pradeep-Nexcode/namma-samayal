import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryTree,
  getSubCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import auth, { authorize } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { validateRequest } from "../middleware/validate.js";
import {
  categoryIdValidation,
  createCategoryValidation,
  listCategoryValidation,
  updateCategoryValidation,
} from "../validators/categoryValidators.js";

const router = Router();

router.get("/", listCategoryValidation, validateRequest, getAllCategories);
router.get("/tree", getCategoryTree);
router.get("/:id/subcategories", categoryIdValidation, validateRequest, getSubCategories);

router.post(
  "/",
  adminAuth,
  createCategoryValidation,
  validateRequest,
  createCategory,
);

router.patch(
  "/:id",
  adminAuth,
  categoryIdValidation,
  updateCategoryValidation,
  validateRequest,
  updateCategory,
);

router.delete(
  "/:id",
  adminAuth,
  categoryIdValidation,
  validateRequest,
  deleteCategory,
);

export default router;
