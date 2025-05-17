const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
    },
    wilaya: {
      type: String,
      required: [true, "Please provide a wilaya"],
      trim: true,
    },
    type: {
      type: String,
      default: "Room", // Or perhaps 'Residency'
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    totalRoomCount: { // Crucial for booking logic
      type: Number,
      required: [true, "Total room count is required"],
      min: [0, "Total room count cannot be negative"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    // This userId refers to the manager of the residency (likely a 'service' role user)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A residency must be linked to a manager"],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'unavailable'],
      default: "approved",
    },
  },
  
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

accommodationSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

accommodationSchema.index({ title: 'text', description: 'text', wilaya: 'text' });

module.exports = mongoose.model("Accommodation", accommodationSchema);
