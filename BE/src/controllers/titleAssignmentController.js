import TitleAssignmentModel from "../models/titleAssignmentModel.js";

export const assignTitle = async (req, res) => {
  try {
    const { titleId, contestantId } = req.body;

    if (!titleId || !contestantId) {
      return res.status(400).json({ message: "Title and contestant are required" });
    }

    // Find all assignments for this title
    const existingAssignments = await TitleAssignmentModel.find({ title: titleId });

    if (existingAssignments.length >= 2) {
      return res.status(409).json({
        message: "This title already has 2 contestants assigned",
        assignedTo: existingAssignments.map(a => a.contestant),
      });
    }

    // Check if this contestant is already assigned to this title
    const alreadyAssigned = existingAssignments.find(a => a.contestant.toString() === contestantId);
    if (alreadyAssigned) {
      return res.status(409).json({
        message: "This contestant is already assigned to this title",
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

export const getAssignedContestants= async (req,res) =>{
  try {
    const {titleId}= req.params;
    if(!titleId){
      return res.status(400).json({message:"Title Id is required"});
    }

    const assignments= await TitleAssignmentModel.find({title: titleId}).populate("contestant").exec();

      if (!assignments|| assignments.length === 0) {
  return res.status(200).json({ contestants: [] });
}


     res.status(200).json({
      message: "Contestants retrieved successfully",
      contestants: assignments.map(a => a.contestant),
    });

  } catch (error) {
     res.status(500).json({
      message: "Error retrieving contestants",
      error: error.message,
    });

  }
}