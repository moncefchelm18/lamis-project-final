const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    required: [true, 'Site title is required'],
    trim: true
  },
  maxOccupancyPerRoom: {
    type: Number,
    required: [true, 'Maximum occupancy per room is required'],
    min: [1, 'Maximum occupancy must be at least 1'],
    default: 4
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);