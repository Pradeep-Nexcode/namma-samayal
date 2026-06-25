import { Router } from "express";

import {
  createComment,
  deleteComment,
  getRecipeComments,
  likeComment,
  unlikeComment,
  updateComment,
} from "../controllers/commentController.js";
import auth from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";
import { validateRequest } from "../middleware/validate.js";
import {
  commentIdValidation,
  createCommentValidation,
  recipeCommentsValidation,
  updateCommentValidation,
} from "../validators/commentValidators.js";

const router = Router();

// Public: read the Kitchen Talk thread for a recipe. optionalAuth lets us flag
// `likedByMe` when a logged-in user's token is present.
router.get(
  "/recipe/:recipeId",
  optionalAuth,
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

// Likes.
router.post("/:id/like", auth, commentIdValidation, validateRequest, likeComment);
router.delete(
  "/:id/like",
  auth,
  commentIdValidation,
  validateRequest,
  unlikeComment,
);

export default router;
