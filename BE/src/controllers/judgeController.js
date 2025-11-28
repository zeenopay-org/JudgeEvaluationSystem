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

    // Empty fields
    if (!username || !password || !email || !contact || !eventId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Username validation
    if (username.length < 5 || username.length > 25) {
      return res.status(400).json({
        error: "Username must be between 5–25 characters",
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        error: "Username can only contain letters, numbers, and underscores",
      });
    }

    // STRONG EMAIL VALIDATION
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // STRONG PASSWORD VALIDATION
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must include uppercase, lowercase, number, special character, and be at least 8 characters",
      });
    }

    // Contact validation
    if (!/^[0-9]{10}$/.test(contact)) {
      return res
        .status(400)
        .json({ error: "Contact must be exactly 10 digits" });
    }

    // Check if user exists
    const existingUser = await Users.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
      role: "judge",
    });

    const judge = await Judge.create({
      contact,
      user: user._id,
      event: eventId,
    });

    res.status(201).json({
      message: "Judge created successfully",
      judge,
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
    const judges = await Judge.find({})
      .populate("user", "username email role")
      .populate("event", "name");
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
    const judge = await Judge.findById(id)
      .populate("user", "username email role")
      .populate("event", "name");

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

    const contestants = await Contestant.find({
      event: { $in: eventIds },
    }).populate("event", "name");

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

export const getJudgeRounds = async (req, res) => {
  try {
    const judgeId = req.judge.judgeId;
    const { eventId } = req.query;

    const judge = await Judge.findById(judgeId).populate("event");
    if (!judge) return res.status(404).json({ message: "Judge not found" });

    // Collect event IDs assigned to judge
    const eventIds = Array.isArray(judge.event)
      ? judge.event.map((evt) => evt._id)
      : [judge.event?._id].filter(Boolean);

    // Ensure requested event belongs to judge
    if (eventId && !eventIds.some((id) => id.toString() === eventId)) {
      return res.status(403).json({ message: "Unauthorized event" });
    }

    const filter = eventId ? { event: eventId } : { event: { $in: eventIds } };

    const rounds = await Round.find(filter).populate("event", "name");

    res.status(200).json({
      message: "Rounds fetched successfully",
      rounds,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get contestants per round
export const getRoundContestants = async (req, res) => {
  try {
    const judgeId = req.judge.judgeId;
    const { roundId } = req.params;

    // Validate judge
    const judge = await Judge.findById(judgeId).populate("event");
    if (!judge) return res.status(404).json({ message: "Judge not found" });

    // Validate round
    const round = await Round.findById(roundId).populate("event", "name");
    if (!round) return res.status(404).json({ message: "Round not found" });

    // Collect event IDs assigned to judge
    const judgeEventIds = Array.isArray(judge.event)
      ? judge.event.map((evt) => (evt?._id ? evt._id.toString() : String(evt)))
      : [judge.event?._id || judge.event]
          .filter(Boolean)
          .map((id) => id.toString());

    // Ensure the round's event is assigned to this judge
    const roundEventId =
      round.event?._id?.toString() || round.event?.toString();
    if (!roundEventId || !judgeEventIds.includes(roundEventId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view contestants for this round" });
    }

    // Contestants are linked to events; fetch by the round's event
    const contestants = await Contestant.find({ event: roundEventId })
      .select("name contestant_number event")
      .populate("event", "name");

    res.status(200).json({
      message: "Contestants for round fetched successfully",
      round: {
        id: round._id,
        name: round.name,
        type: round.type,
        max_score: round.max_score,
        questions: round.questions,
        event: round.event,
      },
      contestants,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
