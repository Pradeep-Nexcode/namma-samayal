import { Router } from "express";

import config from "../config/config.js";
import adminRoutes from "./adminRoutes.js";
import adminAuthRoutes from "./adminAuthRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import devRoutes from "./devRoutes.js";
import ingredientRoutes from "./ingredientRoutes.js";
import recipesRouter from "./recipes.js";
import usersRouter from "./users.js";

const router = Router();

router.use("/users", usersRouter);
router.use("/recipes", recipesRouter);
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/ingredients", ingredientRoutes);

// Email-template previews — never exposed in production.
if (config.nodeEnv !== "production") {
  router.use("/dev", devRoutes);
}

export default router;
