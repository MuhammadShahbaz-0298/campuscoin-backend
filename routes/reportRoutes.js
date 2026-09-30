import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  categoryBreakdown,
  incomeVsExpense,
} from "../controllers/reportController.js";

const router = Router();
router.use(authMiddleware);
router.get("/category-breakdown", categoryBreakdown);
router.get("/income-vs-expense", incomeVsExpense);

export default router;
