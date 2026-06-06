import { Router } from "express";
import { loginAdmin, seedAdmin } from "../controllers/adminAuthController.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/seed", seedAdmin); // One-time use to create initial admin

export default router;
