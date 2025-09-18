import express from "express";
import { registerAdmin, signinAdmin } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/signIn", signinAdmin);
export default router;
