import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
  bookmarkInsight,
  clearAllInsights,
  generateInsight,
  listInsights,
} from "../controllers/insightController.js";

const router = Router();

const monthSchema = z.object({
  month: z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must use YYYY-MM format")
    .optional(),
});

router.use(authMiddleware);

router.get("/", listInsights);

router.post("/generate", validateMiddleware(monthSchema), generateInsight);

router.delete("/clear-all", clearAllInsights);

router.put(
  "/:id/bookmark",
  validateMiddleware(z.object({ isBookmarked: z.boolean() })),
  bookmarkInsight,
);

export default router;
