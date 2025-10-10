// routes/scoreRoute.js
import express from "express";
import { submitScore, getScores } from "../controllers/scoreController.js";
import { judgeAuthMiddleware } from "../middlewares/judgeAuthMiddleware.js";
import {
  adminOnlyMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/create", judgeAuthMiddleware, submitScore);
router.get("/", authMiddleware, adminOnlyMiddleware, getScores);

export default router;
