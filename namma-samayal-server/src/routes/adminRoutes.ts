import { Router } from "express";
import { param } from "express-validator";

import {
  approveRecipe,
  deleteRecipeByAdmin,
  getPendingRecipes,
  getAllAdminRecipes,
} from "../controllers/adminController.js";
import {
  listUsers,
  getUserById,
  updateUser,
  softDeleteUser,
} from "../controllers/adminUserController.js";
import { getYoutubeTranscript } from "../controllers/youtubeController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

const recipeIdValidation = [
  param("id").isMongoId().withMessage("Invalid recipe id"),
];

const userIdValidation = [
  param("id").isMongoId().withMessage("Invalid user id"),
];

router.use(adminAuth);

router.get("/recipes/pending", getPendingRecipes);
router.get("/recipes", getAllAdminRecipes);

router.patch(
  "/recipes/:id/approve",
  recipeIdValidation,
  validateRequest,
  approveRecipe,
);

router.delete("/recipes/:id", recipeIdValidation, validateRequest, deleteRecipeByAdmin);

// ─── Users ──────────────────────────────────────────────────────────────────
router.get("/users", listUsers);
router.get("/users/:id", userIdValidation, validateRequest, getUserById);
router.patch("/users/:id", userIdValidation, validateRequest, updateUser);
router.delete("/users/:id", userIdValidation, validateRequest, softDeleteUser);

// ─── YouTube Transcript ─────────────────────────────────────────────────────
router.post("/youtube-transcript", getYoutubeTranscript);

export default router;
