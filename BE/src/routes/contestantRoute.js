import express, { Router } from "express";
import {
  createContestant,
  deleteContestants,
  editContestant,
  getContestant,
  getSingleContestant,
} from "../controllers/contestantController.js";
import {
  authMiddleware,
  adminOnlyMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/create", authMiddleware, adminOnlyMiddleware, createContestant);
router.get("/", authMiddleware, adminOnlyMiddleware, getContestant);
router.get("/:id", authMiddleware, adminOnlyMiddleware, getSingleContestant);
router.put("/edit/:id", authMiddleware, adminOnlyMiddleware, editContestant);
router.delete(
  "/delete/:id",
  authMiddleware,
  adminOnlyMiddleware,
  deleteContestants
);
export default router;
