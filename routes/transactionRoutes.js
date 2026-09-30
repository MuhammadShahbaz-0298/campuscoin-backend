import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  suggestTransactionCategory,
  updateTransaction,
  getSavingsProgress,
} from "../controllers/transactionController.js";

const router = Router();
const transactionSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().max(240).optional(),
  date: z.coerce.date().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z.string().optional(),
});

router.use(authMiddleware);
router.get("/", listTransactions);
router.get("/savings", getSavingsProgress);
router.post("/", validateMiddleware(transactionSchema), createTransaction);
router.put(
  "/:id",
  validateMiddleware(transactionSchema.partial()),
  updateTransaction,
);
router.delete("/:id", deleteTransaction);
router.post(
  "/suggest-category",
  validateMiddleware(z.object({ description: z.string().min(1) })),
  suggestTransactionCategory,
);

export default router;
