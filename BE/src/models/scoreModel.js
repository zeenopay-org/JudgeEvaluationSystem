import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    // id : {
    //     type : Number,
    //     required : true
    // },
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rounds",
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Judges",
      required: true,
    },
    contestant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contestants",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    comment: {
      type: String,
    },
    question: { type: String }, 
  },
  { timestamps: true }
);
export default mongoose.model("Scores", scoreSchema);
