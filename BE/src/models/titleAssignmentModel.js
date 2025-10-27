import mongoose from "mongoose";

const titleAssignmenrSchema = {

  title: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Titles",
    required: true,
  },
  contestant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contestants",
    required: true,
  },
};
export default mongoose.model("TitleAssignment", titleAssignmenrSchema);
