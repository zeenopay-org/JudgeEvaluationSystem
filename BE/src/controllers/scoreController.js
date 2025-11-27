import Score from "../models/scoreModel.js";
import Round from "../models/roundModel.js";
import Contestant from "../models/contestantsModel.js";
import { broadcastScore } from "../utils/socket.js";

export const submitScore = async (req, res) => {
  try {
    const roundId = req.body.roundId || req.body.round;
    const contestantId = req.body.contestantId || req.body.contestant;
    const questionId = req.body.questionId || req.body.question || null;
    const score = req.body.score;
    const comment = req.body.comment;
    const judgeId = req.judge?.judgeId || req.user?.id;

    if (!roundId || !contestantId || score === undefined) {
      return res
        .status(400)
        .json({ message: "roundId, contestantId, and score are required" });
    }

    const round = await Round.findById(roundId);
    if (!round) return res.status(404).json({ message: "Round not found" });

    const contestant = await Contestant.findById(contestantId);
    if (!contestant)
      return res.status(404).json({ message: "Contestant not found" });

    if (round.type === "qna" && !questionId) {
      return res
        .status(400)
        .json({ message: "questionId is required for Q&A rounds" });
    }

    const existingScore = await Score.findOne({
      round: roundId,
      judge: judgeId,
      contestant: contestantId,
      ...(round.type === "qna" ? { question: questionId } : {}),
    });

    if (existingScore) {
      return res.status(400).json({
        message:
          "Score already submitted for this contestant in this round/question",
      });
    }

    if (score > round.max_score) {
      return res.status(400).json({
        message: `Score cannot exceed maximum score of ${round.max_score}`,
      });
    }

    const selectedQuestion = round.questions.find(
      (q) => q._id.toString() === questionId
    );
    const newScore = new Score({
      round: roundId,
      judge: judgeId,
      contestant: contestantId,
      score,
      comment,
      question: selectedQuestion?.question_text || null,
    });

    await newScore.save();
    try {
      broadcastScore({
        scoreId: newScore._id,
        roundId,
        contestantId,
        judgeId,
        score,
        comment,
        roundName: round.name,
        contestantName: contestant.name,
        contestantNumber: contestant.contestant_number,
        timestamp: new Date().toISOString(),
      });
    } catch (wsError) {
      console.error("Error in broadcastScore:", wsError);
    }

    res.status(201).json({ message: "Score submitted successfully", newScore });
  } catch (error) {
    console.error("Error submitting score:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getJudgeWiseBreakdown = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate("round", "name type max_score")
      .populate("contestant", "name contestant_number")
      .populate({
        path: "judge",
        populate: [
          { path: "user", select: "username" },
          { path: "event", select: "name" },
        ],
      });

    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContestantAnalytics = async (req, res) => {
  try {
    const analytics = await Score.aggregate([
      {
        $group: {
          _id: "$contestant", // Group by contestant ID
          totalScore: { $sum: "$score" },
          averageScore: { $avg: "$score" },
          scoreCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "contestants",
          localField: "_id",
          foreignField: "_id",
          as: "contestantDetails",
        },
      },
      {
        $unwind: "$contestantDetails",
      },
      {
        $project: {
          _id: 0,
          contestantId: "$contestantDetails._id",
          name: "$contestantDetails.name",
          contestant_number: "$contestantDetails.contestant_number",
          totalScore: 1,
          averageScore: { $round: ["$averageScore", 2] }, // Optional: round to 2 decimals
          scoreCount: 1,
        },
      },
    ]);

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getScoresPerContestantPerRound = async (req, res) => {
  try {
    const result = await Score.aggregate([
      {
        $group: {
          _id: {
            contestant: "$contestant",
            round: "$round",
          },
          totalScore: { $sum: "$score" },
          averageScore: { $avg: "$score" },
          scoreCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "contestants",
          localField: "_id.contestant",
          foreignField: "_id",
          as: "contestantDetails",
        },
      },
      { $unwind: "$contestantDetails" },
      {
        $lookup: {
          from: "rounds",
          localField: "_id.round",
          foreignField: "_id",
          as: "roundDetails",
        },
      },
      { $unwind: "$roundDetails" },
      {
        $project: {
          contestantId: "$contestantDetails._id",
          contestantName: "$contestantDetails.name",
          contestantNumber: "$contestantDetails.contestant_number",
          roundName: "$roundDetails.name",
          totalScore: 1,
          averageScore: { $round: ["$averageScore", 2] },
          scoreCount: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching scores per contestant per round:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getScores = async (req, res) => {
  try {
    const result = await Score.aggregate([
      {
        $lookup: {
          from: "judges",
          localField: "judge",
          foreignField: "_id",
          as: "judgeDetails",
        },
      },
      { $unwind: "$judgeDetails" },
      {
        $lookup: {
          from: "users",
          localField: "judgeDetails.user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $lookup: {
          from: "contestants",
          localField: "contestant",
          foreignField: "_id",
          as: "contestantDetails",
        },
      },
      { $unwind: "$contestantDetails" },
      {
        $lookup: {
          from: "rounds",
          localField: "round",
          foreignField: "_id",
          as: "roundDetails",
        },
      },
      { $unwind: "$roundDetails" },
      {
        $group: {
          _id: {
            contestantId: "$contestantDetails._id",
            roundId: "$roundDetails._id",
          },
          contestantName: { $first: "$contestantDetails.name" },
          contestantNumber: { $first: "$contestantDetails.contestant_number" },
          roundName: { $first: "$roundDetails.name" },
          maxScorePerJudge: { $first: "$roundDetails.max_score" },
          totalScore: { $sum: "$score" },
          judgeCount: { $sum: 1 },
          judges: {
            $push: {
              judgeId: "$judgeDetails._id",
              judgeName: "$userDetails.username",
              score: "$score",
            },
          },
        },
      },
      {
        $addFields: {
          totalPossibleScore: {
            $multiply: ["$maxScorePerJudge", "$judgeCount"],
          },
          averageScore: {
            $cond: [
              { $gt: ["$judgeCount", 0] },
              { $divide: ["$totalScore", "$judgeCount"] },
              0,
            ],
          },
        },
      },
      {
        $sort: { contestantNumber: 1, roundName: 1 },
      },
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getJudgeScoresDetailed = async (req, res) => {
  try {
    const judgeId = req.judge?.judgeId || req.user?.id;

    if (!judgeId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const scores = await Score.find({ judge: judgeId })
      .populate("contestant", "name contestant_number")
      .populate("round", "name type max_score")
      .sort({ "contestant.contestant_number": 1, "round.name": 1 });

    res.status(200).json(scores);
  } catch (error) {
    console.error("Error fetching judge's scores:", error);
    res.status(500).json({ error: error.message });
  }
};
