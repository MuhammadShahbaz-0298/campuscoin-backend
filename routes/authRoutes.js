import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import validateMiddleware from "../middleware/validateMiddleware.js";
import { login, register } from "../controllers/authController.js";

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });
const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const registration = credentials.extend({ name: z.string().min(2) });

router.post("/register", limiter, validateMiddleware(registration), register);
router.post("/login", limiter, validateMiddleware(credentials), login);
router.post("/admin-login", limiter, validateMiddleware(credentials), login);

export default router;
