import express, { Router } from "express";
import { upload } from "../middlewares/multer.js";
import {
  createEvent,
  getEvent,
  getSingleEvent,
  deleteEvent,
  editEvent,
} from "../controllers/eventController.js";
import {
  authMiddleware,
  adminOnlyMiddleware,
} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/create",  upload.single("image"),authMiddleware, adminOnlyMiddleware, createEvent);
router.get("/", authMiddleware, adminOnlyMiddleware, getEvent);
router.get("/:id", authMiddleware, adminOnlyMiddleware, getSingleEvent);
router.put("/edit/:id", upload.single("image"),authMiddleware, adminOnlyMiddleware, editEvent);
router.delete("/delete/:id", authMiddleware, adminOnlyMiddleware, deleteEvent);

export default router;
