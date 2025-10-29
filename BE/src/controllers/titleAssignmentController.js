import TitleAssignmentModel from "../models/titleAssignmentModel.js";

export const assignTitle = async (req, res) => {
  try {
    const { titleId, contestantId } = req.body;

    if (!titleId || !contestantId) {
      return res
        .status(400)
        .json({ message: "Title and contestant are required" });
    }

    const existingAssignment = await TitleAssignmentModel.findOne({
      title: titleId,
    });

    if (existingAssignment) {
      return res
        .status(409)
        .json({
          message: "This title is already assigned to a contestant",
          assignedTo: existingAssignment.contestant,
        });
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
