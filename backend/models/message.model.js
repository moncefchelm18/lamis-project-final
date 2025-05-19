// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    residencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
      required: true,
    },
    studentId: {
      // The student who sent the message (if logged in)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Assuming only logged-in students can send messages
    },
    senderEmail: {
      // Email provided in the form
      type: String,
      required: [true, "Sender email is required"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address."],
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      trim: true,
    },
    status: {
      // For tracking if the residency manager has seen it
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
    },
  },
  { timestamps: true }
);

messageSchema.index({ residencyId: 1, status: 1 });

module.exports = mongoose.model("Message", messageSchema);
