import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ||  "hfdhgshdgghd" 

export const judgeAuthMiddleware = (req, res, next) =>{
    const token= req.headers["authorization"]?.split(" ")[1];

    if(!token) return res.status(401).json({message: "Unauthorized judge"})

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            req.judge ={
                id: decoded.id,
                role: decoded.role,
                judgeId: decoded.judgeId
            };
            next();
            
        } catch (err) {
            res.status(401).json({ message: "Invalid token" });
        }
}

