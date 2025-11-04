import express from "express";
import { createTitle, deleteTitle, getTitles} from "../controllers/titleController.js";
import { adminOnlyMiddleware, authMiddleware } from "../middlewares/authMiddleware.js";
import { getAssignedContestants } from "../controllers/titleAssignmentController.js";
import { upload } from "../middlewares/multer.js";

const router= express. Router();

router.post("/create", upload.single("image"),authMiddleware ,adminOnlyMiddleware,createTitle);
router.get("/",authMiddleware, adminOnlyMiddleware, getTitles);
router.delete("/delete/:id", authMiddleware, adminOnlyMiddleware, deleteTitle)
router.get("/assigned/:titleId", getAssignedContestants);
export default router;