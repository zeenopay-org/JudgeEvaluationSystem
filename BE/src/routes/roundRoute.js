import express, { Router } from "express";
import {
  createRound,
  getRounds,
  getRoundById,
  editRound,
  deleteRound,
} from "../controllers/roundController.js";
import {
  authMiddleware,
  adminOnlyMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, adminOnlyMiddleware, createRound);
router.get("/", authMiddleware, adminOnlyMiddleware, getRounds);
router.get("/:id", authMiddleware, adminOnlyMiddleware, getRoundById);
router.put("/edit/:id", authMiddleware, adminOnlyMiddleware, editRound);
router.delete("/delete/:id", authMiddleware, adminOnlyMiddleware, deleteRound);

export default router;
