
import { Router } from "express";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is running"
  });
});

export default router;
