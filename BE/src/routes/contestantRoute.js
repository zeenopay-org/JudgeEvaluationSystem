import express, { Router } from "express";
import { upload } from "../middlewares/multer.js";
import {
  bulkUploadContestants,
  createContestant,
  deleteContestants,
  editContestant,
  getContestant,
  getEventContestants,
  getSingleContestant,
} from "../controllers/contestantController.js";
import {
  authMiddleware,
  adminOnlyMiddleware,
} from "../middlewares/authMiddleware.js";
1;
const router = express.Router();
router.post(
  "/create",
  upload.single("image"),
  authMiddleware,
  adminOnlyMiddleware,
  createContestant
);
router.get("/", authMiddleware, adminOnlyMiddleware, getContestant);
router.get("/:id", authMiddleware, adminOnlyMiddleware, getSingleContestant);
router.get(
  "/event/:eventId",
  authMiddleware,
  adminOnlyMiddleware,
  getEventContestants
);
router.put(
  "/edit/:id",
  upload.single("image"),
  authMiddleware,
  adminOnlyMiddleware,
  editContestant
);
router.delete(
  "/delete/:id",
  authMiddleware,
  adminOnlyMiddleware,
  deleteContestants
);

router.post(
  "/bulk-upload",
  authMiddleware,
  adminOnlyMiddleware,
  upload.single("file"),
  bulkUploadContestants
);
export default router;
