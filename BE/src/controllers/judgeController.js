import Judge from "../models/judgeModel.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "hfdhgshdgghd";


//create judge
export const createJudge = async(req , res)=>{
    try {
        const {username, password, email, contact, eventId} = req.body;
        
        // Check if user already exists
        const existingUser = await Users.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: "User with this email or username already exists" 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user with judge role
        const user = await Users.create({
            username,
            email,
            password: hashedPassword,
            role: "judge"
        });
      
        // Create judge record
        const judge = new Judge({
            contact,
            user: user._id,
            event: eventId
        });
        
        await judge.save();

        res.status(201).json({
            message: "Judge created successfully", 
            judge: {
                id: judge._id,
                username: user.username,
                email: user.email,
                contact: judge.contact,
                role: user.role,
                userId: user._id,
                eventId: judge.event
            }
        });
    } catch (error) {
        console.error("Error creating judge:", error);
        res.status(500).json({error: error.message});
    }
}

// Judge Sign In
export const signInJudge = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with judge role
        const user = await Users.findOne({ email, role: "judge" });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }


        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Find judge details
        const judge = await Judge.findOne({ user: user._id }).populate('event');
        if (!judge) {
            return res.status(400).json({ message: "Judge profile not found" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role, judgeId: judge._id }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            judge: {
                id: judge._id,
                username: user.username,
                password:user.password,
                email: user.email,
                contact: judge.contact,
                role: user.role,
                userId: user._id,
                eventId: judge.event?._id,
                eventName: judge.event?.name
            }
        });
    } catch (error) {
        console.error("Error signing in judge:", error);
        res.status(500).json({ error: error.message });
    }
};

//get judges
export const getJudge = async( req , res)=>{
    try {
        const judges = await Judge.find({});
        res.status(200).json({judges});
    } catch (err) {
        res.status(500).json({error: err.message})
        }
}

//get single judge
export const getSingleJudge = async (req , res) => {
    try {
        const {id} = req.params;
        const judge= await Judge.findById(id);

        if (!judge){
            return res.status(404).json({message: "Judge not found"})
        }

        res.status(200).json({message:"Fetched judge by id", judge})
    } catch (error) {
     res.status(500).json({error: err.message})   
    }

}

