import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ||  "hfdhgshdgghd" 

export const authMiddleware = (req, res, next) => {

  const token = req.headers["authorization"]?.split(" ")[1];

if (!token) return res.status(401).json({ message: "Unauthorized User" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.admin = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnlyMiddleware = (req, res, next) => {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
// Combined middleware for admin and judge access
export const adminOrJudgeMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized User" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === 'admin') {
      req.admin = {
        id: decoded.id,
        role: decoded.role
      };
    } else if (decoded.role === 'judge') {
      req.judge = {
        id: decoded.id,
        role: decoded.role,
        judgeId: decoded.judgeId,
        eventId: decoded.eventId
      };
    } else {
      return res.status(403).json({ message: "Access denied. Admin or Judge access required." });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
