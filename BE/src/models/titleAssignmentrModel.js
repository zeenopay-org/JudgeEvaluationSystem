import mongoose from "mongoose";

const titleAssignmenrSchema = {
  // id : {
  //     type : Number,
  //     required : true
  // },
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
