import { configDotenv } from "dotenv";
import Score from "../models/scoreModel.js";
import Round from "../models/roundModel.js";

/**
 * @desc Judge gives score to a contestant
 */
export const giveScore = async (req, res) => {
    
  try {
    const { roundId, contestantId, score, comment, questionId } = req.body;
    const judgeId = req.user.id; // judge from JWT

    // 1. Validate round
    const round = await Round.findById(roundId);
    if (!round) return res.status(404).json({ message: "Round not found" });

    if (score > round.max_score) {
      return res
        .status(400)
        .json({ message: `Score cannot exceed ${round.max_score}` });
    }

    let questionText = null;

    // 2. Handle QnA rounds
    if (round.type === "qna") {
      const question = round.questions.id(questionId); // subdocument lookup

      if (!question) {
        return res
          .status(404)
          .json({ message: "Question not found in this round" });
      }
      if (question.used) {
        return res
          .status(400)
          .json({ message: "This question has already been asked" });
      }

      // Mark question as used
      question.used = true;
      await round.save();

      questionText = question.question_text;
    }

    // 3. Save score
    const newScore = new Score({
      round: roundId,
      judge: judgeId,
      contestant: contestantId,
      score,
      comment,
      question: questionId || null,
    });

    await newScore.save();

    return res.status(201).json({
      message: "Score submitted successfully",
      data: newScore,
      askedQuestion: questionText || null,
    });
  } catch (error) {
    console.error("Error in giveScore:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all scores for a round
 */
export const getScoresByRound = async (req, res) => {
  try {
    const { roundId } = req.params;
    const scores = await Score.find({ round: roundId })
      .populate("judge", "username email")
      .populate("contestant", "name email")
      .populate("round", "name type max_score");

    return res.status(200).json(scores);
  } catch (error) {
    console.error("Error in getScoresByRound:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all scores of a contestant across rounds
 */
export const getScoresByContestant = async (req, res) => {
  try {
    const { contestantId } = req.params;
    const scores = await Score.find({ contestant: contestantId })
      .populate("judge", "username email")
      .populate("round", "name type max_score");

    return res.status(200).json(scores);
  } catch (error) {
    console.error("Error in getScoresByContestant:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get scores given by a specific judge
 */
export const getScoresByJudge = async (req, res) => {
  try {
    const { judgeId } = req.params;
    const scores = await Score.find({ judge: judgeId })
      .populate("contestant", "name email")
      .populate("round", "name type max_score");

    return res.status(200).json(scores);
  } catch (error) {
    console.error("Error in getScoresByJudge:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
