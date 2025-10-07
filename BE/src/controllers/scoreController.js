import Score from "../models/scoreModel.js";
import Round from "../models/roundModel.js";
import Contestant from "../models/contestantsModel.js";

/**
 * Submit a score for a contestant in a specific round (and question if applicable)
 */
export const submitScore = async (req, res) => {
  try {
    // Support both FE payload (round, contestant, question) and BE expected fields (roundId, contestantId, questionId)
    const roundId = req.body.roundId || req.body.round;
    const contestantId = req.body.contestantId || req.body.contestant;
    const questionId = req.body.questionId || req.body.question || null;
    const score = req.body.score;
    const comment = req.body.comment;
    const judgeId = req.judge?.judgeId || req.user?.id; 

    // 🔹 Validation
    if (!roundId || !contestantId || score === undefined) {
      return res.status(400).json({ message: "roundId, contestantId, and score are required" });
    }

    const round = await Round.findById(roundId);
    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      return res.status(404).json({ message: "Contestant not found" });
    }

    // 🔹 For Q&A rounds, ensure questionId is provided
    if (round.type === "qna" && !questionId) {
      return res.status(400).json({ message: "questionId is required for Q&A rounds" });
    }

    // 🔹 Check duplicate score
    const existingScore = await Score.findOne({
      round: roundId,
      judge: judgeId,
      contestant: contestantId,
      ...(round.type === "qna" ? { question: questionId } : {})
    });

    if (existingScore) {
      return res.status(400).json({ message: "Score already submitted for this contestant in this round/question" });
    }

    // 🔹 Validate score limit
    if (score > round.max_score) {
      return res.status(400).json({
        message: `Score cannot exceed maximum score of ${round.max_score}`
      });
    }

    // 🔹 Create score record
    const newScore = new Score({
      round: roundId,
      judge: judgeId,
      contestant: contestantId,
      score,
      comment,
      question: questionId || null
    });

    await newScore.save();

    res.status(201).json({
      message: "Score submitted successfully",
      newScore
    });
  } catch (error) {
    console.error("Error submitting score:", error);
    res.status(500).json({ error: error.message });
  }
};


export const getScores = async (req, res) => {
  try {
    const scores = await Score.find().populate('round', 'name type max_score').populate('contestant', 'name ').populate('judge', 'name ') ;
    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 