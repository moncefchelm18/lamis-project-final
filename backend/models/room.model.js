// backend/models/room.model.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    floor: Number,
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    isAvailable: { // Service/admin can use this to manage general availability status
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.virtual('id').get(function() { return this._id.toHexString(); });
roomSchema.index({ accommodation: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);