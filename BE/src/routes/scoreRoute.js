// routes/scoreRoute.js
import express from "express";
import { submitScore } from "../controllers/scoreController.js";
import { judgeAuthMiddleware } from "../middlewares/judgeAuthMiddleware.js";

const router = express.Router();

router.post("/", judgeAuthMiddleware, submitScore);

export default router;
