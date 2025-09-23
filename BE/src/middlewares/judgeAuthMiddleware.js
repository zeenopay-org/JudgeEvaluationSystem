import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hfdhgshdgghd";

export const judgeAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized judge" });

  // Split "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized judge" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach judge info to request
    req.judge = {
      id: decoded.id,       // userId
      role: decoded.role,
      judgeId: decoded.judgeId
    };

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
