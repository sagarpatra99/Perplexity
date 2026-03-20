import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat ID is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "ai"],
      required: [true, "Message role is required"],
    },
  },
  { timestamps: true },
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
