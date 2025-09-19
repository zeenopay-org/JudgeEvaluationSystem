import express, { Router } from "express";
import { createContestant } from "../controllers/contestantController.js";
import { authMiddleware , adminOnlyMiddleware} from "../middlewares/authMiddleware.js";


const router = express. Router()
router.post('/create', authMiddleware, adminOnlyMiddleware, createContestant)

export default router;
