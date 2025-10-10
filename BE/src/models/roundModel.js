import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["normal", "qna"],
    },
    max_score: {
      type: Number,
      required: true,
    },
    questions: {
      type: [
        {
          question_text: { type: String, required: true },
        },
      ],
      default: [],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Rounds", roundSchema);
