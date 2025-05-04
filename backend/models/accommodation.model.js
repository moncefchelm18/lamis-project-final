const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Please provide a contact email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  roomCount: {
    type: Number,
    required: [true, 'Please provide the number of rooms'],
    min: [0, 'Room count cannot be negative']
  },
  mainImage: {
    type: String,
    required: [true, 'Please provide a main image URL']
  },
  galleryImages: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Accommodation', accommodationSchema);