import Admin from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hfdhgshdgghd";

// Admin Register
export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();

    const { id, name, role, timestamps } = admin;

    res
      .status(201)
      .json({
        message: "Admin registered successfully",
        admin: { id, name, email, role },
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin Signin
export const signinAdmin = async (req, res) => {
  try {
    const { email, password, timestamps } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const { role } = admin;

    //payload,secret,options
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token, admin: { email, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
