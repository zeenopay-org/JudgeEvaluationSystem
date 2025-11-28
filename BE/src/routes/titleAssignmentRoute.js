import express from "express";
import {assignTitle, getWinner} from "../controllers/titleAssignmentController.js";
import { authMiddleware, adminOnlyMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/assign-title", authMiddleware,adminOnlyMiddleware,assignTitle);
router.get("/winner", authMiddleware,adminOnlyMiddleware,getWinner);

export default router;