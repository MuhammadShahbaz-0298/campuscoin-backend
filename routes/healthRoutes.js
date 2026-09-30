import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, data: { ok: true } });
});

export default router;
