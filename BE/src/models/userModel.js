import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // user_id: {
    //   type: Number,
    //   required: true
    // },

    name: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allows multiple null values
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "judge"],
      default: "admin",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Users", userSchema);
