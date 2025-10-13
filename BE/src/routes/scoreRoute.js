// routes/scoreRoute.js
import express from "express";
import {
  submitScore,
  getScores,
  getContestantAnalytics,
  getScoresPerContestantPerRound,
  getJudgeWiseBreakdown,
} from "../controllers/scoreController.js";
import { judgeAuthMiddleware } from "../middlewares/judgeAuthMiddleware.js";
import {
  adminOnlyMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/create", judgeAuthMiddleware, submitScore);
router.get("/", authMiddleware, adminOnlyMiddleware, getScores);
router.get(
  "/getanalytics",
  authMiddleware,
  adminOnlyMiddleware,
  getContestantAnalytics
);
router.get(
  "/per-contestant-round",
  authMiddleware,
  adminOnlyMiddleware,
  getScoresPerContestantPerRound
);
router.get(
  "/judge-breakdown",
  authMiddleware,
  adminOnlyMiddleware,
  getJudgeWiseBreakdown
);

export default router;
