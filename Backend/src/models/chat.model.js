import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Chat title is required"],
      trim: true,
      maxlength: [100, "Chat title cannot exceed 100 characters"],
    },
  },
  { timestamps: true },
);

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel;
