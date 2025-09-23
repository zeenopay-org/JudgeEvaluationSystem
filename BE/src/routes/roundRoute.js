import express, { Router } from "express";
import { createRound } from "../controllers/roundController.js";
import { authMiddleware, adminOnlyMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/create', authMiddleware, adminOnlyMiddleware, createRound);

export default router;