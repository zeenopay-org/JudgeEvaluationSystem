import mongoose from "mongoose";

const titleSchema = {
  // title_id : {
  //     type : Number,
  //     required : true
  // },
  name: {
    type: String,
    required: true,
  },
   image: {
      type: String,
    },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Events",
    required: true,
  },
};
export default mongoose.model("Titles", titleSchema);
