import { Router } from "express";

import {
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeById,
  rateRecipe,
  updateRecipe,
} from "../controllers/recipeController.js";
import auth from "../middleware/auth.js";
import { adminAuth, userOrAdminAuth } from "../middleware/adminAuth.js";
import { uploadSingle } from "../middleware/upload.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createRecipeValidation,
  listRecipeValidation,
  recipeIdValidation,
  recipeRatingValidation,
  updateRecipeValidation,
} from "../validators/recipeValidators.js";

const router = Router();

// ─── Public reads ───────────────────────────────────────────────────────────
router.get("/", listRecipeValidation, validateRequest, getAllRecipes);
router.get("/:id", recipeIdValidation, validateRequest, getRecipeById);

// ─── Create: both users and admin ───────────────────────────────────────────
router.post(
  "/",
  userOrAdminAuth,          // accepts User tokens AND Admin tokens
  uploadSingle("image"),
  createRecipeValidation,
  validateRequest,
  createRecipe,
);

// ─── Update: user can update THEIR OWN only, admin can update any ─────────
router.put(
  "/:id",
  userOrAdminAuth,          // controller enforces ownership check
  uploadSingle("image"),
  recipeIdValidation,
  updateRecipeValidation,
  validateRequest,
  updateRecipe,
);

// ─── Delete: admin only via admin routes ─────────────────────────────────────
// Note: admin panel uses /admin/recipes/:id/delete (adminController.deleteRecipeByAdmin)
// This route allows users to delete their OWN recipes from the user-facing app
router.delete("/:id", userOrAdminAuth, recipeIdValidation, validateRequest, deleteRecipe);

// ─── Rate: registered users only ────────────────────────────────────────────
router.post(
  "/:id/rate",
  auth,
  recipeIdValidation,
  recipeRatingValidation,
  validateRequest,
  rateRecipe,
);

export default router;
