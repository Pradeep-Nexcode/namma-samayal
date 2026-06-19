import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  addToFavorites,
  forgotPassword,
  getProfile,
  login,
  register,
  removeFromFavorites,
  resendVerification,
  resetPassword,
  saveRecipe,
  unsaveRecipe,
  updateProfile,
  verifyEmail,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import {
  forgotPasswordValidation,
  loginValidation,
  recipeParamValidation,
  registerValidation,
  resendVerificationValidation,
  resetPasswordValidation,
  updateProfileValidation,
  verifyEmailValidation,
} from "../validators/userValidators.js";

const router = Router();

/**
 * Tight limiter for endpoints that send emails or check credentials, to curb
 * brute-force and email-bombing. Separate from the global /api limiter.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

router.post("/register", authLimiter, registerValidation, validateRequest, register);
router.post("/login", authLimiter, loginValidation, validateRequest, login);

router.post("/verify-email", verifyEmailValidation, validateRequest, verifyEmail);
router.post(
  "/resend-verification",
  authLimiter,
  resendVerificationValidation,
  validateRequest,
  resendVerification,
);

router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  validateRequest,
  forgotPassword,
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  resetPassword,
);

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
