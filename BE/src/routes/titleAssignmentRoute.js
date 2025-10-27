import express from "express";
import {assignTitle} from "../controllers/titleAssignmentController.js";
import { authMiddleware, adminOnlyMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/assign-title", authMiddleware,adminOnlyMiddleware,assignTitle);

export default router;