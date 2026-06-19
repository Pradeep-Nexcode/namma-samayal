import { Router } from "express";

import {
  createComment,
  deleteComment,
  getRecipeComments,
  updateComment,
} from "../controllers/commentController.js";
import auth from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import {
  commentIdValidation,
  createCommentValidation,
  recipeCommentsValidation,
  updateCommentValidation,
} from "../validators/commentValidators.js";

const router = Router();

// Public: read the Kitchen Talk thread for a recipe.
router.get(
  "/recipe/:recipeId",
  recipeCommentsValidation,
  validateRequest,
  getRecipeComments,
);

// Authenticated actions.
router.post("/", auth, createCommentValidation, validateRequest, createComment);
router.patch(
  "/:id",
  auth,
  commentIdValidation,
  updateCommentValidation,
  validateRequest,
  updateComment,
);
router.delete(
  "/:id",
  auth,
  commentIdValidation,
  validateRequest,
  deleteComment,
);

export default router;
