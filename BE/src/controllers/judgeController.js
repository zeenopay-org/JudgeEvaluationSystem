import Judge from "../models/judgeModel.js";
import Users from "../models/userModel.js";
import Contestant from "../models/contestantsModel.js";
import Round from "../models/roundModel.js";
import Event from "../models/eventModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hfdhgshdgghd";

// ============================
// Create a new judge (Admin Only)
// ============================
export const createJudge = async (req, res) => {
  try {
    const { username, password, email, contact, eventId } = req.body;

    // Check if user already exists
    const existingUser = await Users.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with judge role
    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
      role: "judge",
    });

    // Create judge record
    const judge = new Judge({
      contact,
      user: user._id,
      event: eventId,
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
        eventId: judge.event,
      },
    });
  } catch (error) {
    console.error("Error creating judge:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// Judge Sign In
// ============================
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

    // Find judge profile linked to this user
    const judge = await Judge.findOne({ user: user._id }).populate("event");
    if (!judge) {
      return res.status(400).json({ message: "Judge profile not found" });
    }

    // JWT payload
    const tokenPayload = {
      id: user._id.toString(),
      role: user.role,
      judgeId: judge._id.toString(),
    };

    // Sign JWT
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token,
      judge: {
        id: judge._id,
        username: user.username,
        email: user.email,
        contact: judge.contact,
        role: user.role,
        userId: user._id,
        eventId: judge.event?._id,
        eventName: judge.event?.name,
      },
    });
  } catch (error) {
    console.error("Error signing in judge:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================
// Get all judges (Admin Only)
// ============================
export const getJudge = async (req, res) => {
  try {
    const judges = await Judge.find({}).populate("user", "username email role").populate("event", "name");
    res.status(200).json({ judges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// Get single judge by ID (Admin Only)
// ============================
export const getSingleJudge = async (req, res) => {
  try {
    const { id } = req.params;
    const judge = await Judge.findById(id).populate("user", "username email role").populate("event", "name");

    if (!judge) {
      return res.status(404).json({ message: "Judge not found" });
    }

    res.status(200).json({ message: "Fetched judge by id", judge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================
// Get contestants for logged-in judge
// ============================
export const getJudgeContestants = async (req, res) => {
  try {
    const judgeId = req.judge.judgeId;
    console.log("Judge ID from token:", judgeId);

    const judge = await Judge.findById(judgeId).populate("event");
    if (!judge) {
      return res.status(404).json({ message: "Judge not found" });
    }

    // Normalize judge events to an array of ObjectIds
    const eventIds = Array.isArray(judge.event)
      ? judge.event.map((evt) => (evt?._id ? evt._id : evt)).filter(Boolean)
      : [judge.event?._id || judge.event].filter(Boolean);

    const contestants = await Contestant.find({ event: { $in: eventIds } }).populate("event", "name");

    res.status(200).json({
      message: "Contestants for judge's event fetched successfully",
      events: Array.isArray(judge.event)
        ? judge.event.map((evt) => evt?.name).filter(Boolean)
        : [judge.event?.name].filter(Boolean),
      contestants,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get event for logged in judge

export const getJudgeEvents = async (req, res) => {
  try {
    const judgeId = req.judge.judgeId;
    console.log("Judge ID from token:", judgeId);

    const judge = await Judge.findById(judgeId).populate("event");
    if (!judge) {
      return res.status(404).json({ message: "Judge not found" });
    }

    // If judge.event is an array of ObjectIds
    const events = await Event.find({ _id: { $in: judge.event } });

    res.status(200).json({
      message: "Events assigned to judge fetched successfully",
      events,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getJudgeRounds = async(req, res) =>{
  try {
    const judgeId = req.judge.judgeId;
    console.log("Judge ID from token:", judgeId);

    const judge = await Judge.findById(judgeId).populate("event");
    if (!judge) {
      return res.status(404).json({ message: "Judge not found" });
    }

    //filter
    const { type, name } = req.query;
    const filter = {};

    // Normalize judge events to an array of ObjectIds
    const eventIds = Array.isArray(judge.event)
      ? judge.event.map((evt) => (evt?._id ? evt._id : evt)).filter(Boolean)
      : [judge.event?._id || judge.event].filter(Boolean);

    if (eventIds.length > 0) {
      filter.event = { $in: eventIds };
    }

    if (type) {
      filter.type = type; 
    }

    if (name) {
      filter.name = new RegExp(name, 'i'); // case-insensitive partial match
    }

const rounds = await Round.find(filter).populate("event", "name");

    res.status(200).json({
      message: "Rounds for events fetched successfully",
      events: Array.isArray(judge.event)
        ? judge.event.map((evt) => evt?.name).filter(Boolean)
        : [judge.event?.name].filter(Boolean),
      rounds,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
   }


