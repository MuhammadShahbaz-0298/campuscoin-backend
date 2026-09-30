import { Router } from "express";
import { z } from "zod";
import authMiddleware from "../middleware/authMiddleware.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import { getMe, updateMe } from "../controllers/userController.js";

const router = Router();
const profileSchema = z.object({
  name: z.string().min(2).optional(),
  academicYear: z.string().max(40).optional(),
  monthlyAllowanceBaseline: z.coerce.number().min(0).optional(),
  savingsGoal: z.coerce.number().min(0).optional(),
});

router.use(authMiddleware);
router.get("/me", getMe);
router.put("/me", validateMiddleware(profileSchema), updateMe);

export default router;
