import express, { Router } from "express";
import { createJudge, signInJudge ,getJudge, getSingleJudge} from "../controllers/judgeController.js";
import { authMiddleware, adminOnlyMiddleware } from "../middlewares/authMiddleware.js";
import { judgeAuthMiddleware } from "../middlewares/judgeAuthMiddleware.js";


const router = express.Router()

// Public routes (no authentication required)
router.post('/signIn', signInJudge)

// Admin-only routes
router.post('/create', authMiddleware, adminOnlyMiddleware, createJudge)
router.get('/', authMiddleware, adminOnlyMiddleware, getJudge)
router.get('/:id', authMiddleware, adminOnlyMiddleware, getSingleJudge)

export default router;
