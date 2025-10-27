import express from "express";
import { createTitle, deleteTitle, getTitles} from "../controllers/titleController.js";
import { adminOnlyMiddleware, authMiddleware } from "../middlewares/authMiddleware.js";

const router= express. Router();

router.post("/create", authMiddleware ,adminOnlyMiddleware,createTitle);
router.get("/",authMiddleware, adminOnlyMiddleware, getTitles);
router.delete("/delete/:id", authMiddleware, adminOnlyMiddleware, deleteTitle)
export default router;