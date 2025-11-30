import express from "express";
import { registerAdmin, signinAdmin } from "../controllers/userController.js";
import { loginLimiter } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/signIn", loginLimiter, signinAdmin);
export default router;
