import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
  getStats,
  listDefaultCategories,
  listUsers,
  updateDefaultCategory,
  updateUser,
} from "../controllers/adminController.js";

const router = Router();
const updateSchema = z.record(z.any());
router.use(authMiddleware, adminMiddleware);
router.get("/stats", getStats);
router.get("/users", listUsers);
router.put("/users/:id", validateMiddleware(updateSchema), updateUser);
router.get("/categories", listDefaultCategories);
router.put(
  "/categories/:id",
  validateMiddleware(updateSchema),
  updateDefaultCategory,
);

export default router;
