import TitleAssignmentModel from "../models/titleAssignmentModel.js";

export const assignTitle = async (req, res) => {
  try {
    const { titleId, contestantId } = req.body;

    if (!titleId || !contestantId) {
      return res.status(400).json({ message: "Title and contestant are required" });
    }

    const assignment = new TitleAssignmentModel({
      title: titleId,
      contestant: contestantId,
    });

    await assignment.save();

    res.status(200).json({
      message: "Title assigned successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error assigning title",
      error: error.message,
    });
  }
};