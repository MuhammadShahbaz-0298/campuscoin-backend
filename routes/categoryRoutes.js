import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/categoryController.js";

const router = Router();
const categorySchema = z.object({
  name: z.string().min(2),
  type: z.enum(["income", "expense"]),
});

router.use(authMiddleware);
router.get("/", listCategories);
router.post("/", validateMiddleware(categorySchema), createCategory);
router.put(
  "/:id",
  validateMiddleware(categorySchema.partial()),
  updateCategory,
);
router.delete("/:id", deleteCategory);

export default router;
