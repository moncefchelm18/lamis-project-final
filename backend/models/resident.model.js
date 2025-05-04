const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a student ID']
  },
  roomNumber: {
    type: String,
    required: [true, 'Please provide a room number']
  },
  enrollmentDate: {
    type: Date,
    required: [true, 'Please provide an enrollment date']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resident', residentSchema);