import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import { listBudgets, upsertBudget } from "../controllers/budgetController.js";

const router = Router();
const budgetSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be MM"),
  limitAmount: z.coerce.number().nonnegative(),
});

router.use(authMiddleware);
router.get("/", listBudgets);
router.post("/", validateMiddleware(budgetSchema), upsertBudget);
router.put("/", validateMiddleware(budgetSchema), upsertBudget);

export default router;
