import { Router } from "express";

import {
  addToFavorites,
  getProfile,
  login,
  register,
  removeFromFavorites,
  saveRecipe,
  unsaveRecipe,
  updateProfile,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import {
  loginValidation,
  recipeParamValidation,
  registerValidation,
  updateProfileValidation,
} from "../validators/userValidators.js";

const router = Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfileValidation, validateRequest, updateProfile);

router.post(
  "/favorites/:recipeId",
  auth,
  recipeParamValidation,
  validateRequest,
  addToFavorites,
);
router.delete(
  "/favorites/:recipeId",
  auth,
  recipeParamValidation,
  validateRequest,
  removeFromFavorites,
);

router.post("/saved/:recipeId", auth, recipeParamValidation, validateRequest, saveRecipe);
router.delete(
  "/saved/:recipeId",
  auth,
  recipeParamValidation,
  validateRequest,
  unsaveRecipe,
);

export default router;
