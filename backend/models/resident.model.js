const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [false, "Please provide a student ID"],
  },
  accommodationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accommodation",
    required: [true, "Please provide an accommodation ID"],
  },
  roomNumber: {
    type: String,
    required: [true, "Please provide a room number"],
  },
  enrollmentDate: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    enum: ["approved", "rejected", "paid", "pending"],
    default: "pending",
  },
});

// Add index for faster querying by studentId and createdBy

residentSchema.index({ studentId: 1 });

module.exports = mongoose.model("Resident", residentSchema);
