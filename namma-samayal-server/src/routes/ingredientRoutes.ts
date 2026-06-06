import { Router } from "express";

import {
  createIngredient,
  deleteIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
} from "../controllers/ingredientController.js";
import auth, { authorize } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { uploadSingle } from "../middleware/upload.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createIngredientValidation,
  ingredientIdValidation,
  listIngredientValidation,
  updateIngredientValidation,
} from "../validators/ingredientValidators.js";

const router = Router();

router.get("/", listIngredientValidation, validateRequest, getAllIngredients);
router.get("/:id", ingredientIdValidation, validateRequest, getIngredientById);

router.post(
  "/",
  adminAuth,
  uploadSingle("image"),
  createIngredientValidation,
  validateRequest,
  createIngredient,
);

router.patch(
  "/:id",
  adminAuth,
  uploadSingle("image"),
  ingredientIdValidation,
  updateIngredientValidation,
  validateRequest,
  updateIngredient,
);

router.delete(
  "/:id",
  adminAuth,
  ingredientIdValidation,
  validateRequest,
  deleteIngredient,
);

export default router;
