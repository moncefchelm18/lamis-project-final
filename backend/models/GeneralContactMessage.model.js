// models/GeneralContactMessage.model.js
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2"); // For potential admin panel pagination

const generalContactMessageSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true, // Optional
    },
    senderEmail: {
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
      // For tracking if an admin has seen it
      type: String,
      enum: ["unread", "read", "archived", "replied"],
      default: "unread",
    },
  },
  { timestamps: true }
);

generalContactMessageSchema.index({ status: 1, createdAt: -1 });
generalContactMessageSchema.plugin(mongoosePaginate); // Add pagination plugin

module.exports = mongoose.model(
  "GeneralContactMessage",
  generalContactMessageSchema
);
