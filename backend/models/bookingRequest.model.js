// models/BookingRequest.js
const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming your student user model is named 'User'
    required: [true, "Student ID is required"],
  },
  residencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accommodation', // Assuming your residency model is named 'Residency'
    required: [true, "Residency ID is required"],
  },
  roomNumber: { // The specific room number the student applied for
    type: String, // Storing as string to match frontend input, can be number if preferred
    required: [true, "Room number is required"],
  },
  matriculeBac: { type: String, required: [true, "Matricule BAC is required"] },
  anneeBac: { type: String, required: [true, "Année BAC is required"] },
  sex: {
    type: String,
    enum: ['male', 'female'],
    required: [true, "Sex is required"],
  },
  dateNaissance: { type: Date, required: [true, "Date de naissance is required"] },
  filiere: { type: String, required: [true, "Filière is required"] },
  anneeEtude: { type: String, required: [true, "Année d'étude is required"] },
  wilayaResidenceStudent: { type: String, required: [true, "Wilaya de résidence is required"] },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'], // 'paid' could be a further step
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure a student cannot have multiple active (pending/approved) requests for the same room in the same residency
bookingRequestSchema.index({ studentId: 1, residencyId: 1, roomNumber: 1, status: 1 });
// Index for querying by residency and room number to check availability
bookingRequestSchema.index({ residencyId: 1, roomNumber: 1, status: 1 });


module.exports = mongoose.model('BookingRequest', bookingRequestSchema);