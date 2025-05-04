const { body, validationResult } = require('express-validator');
const adminService = require('../services/admin.service');

// Validation middleware for settings update
exports.validateSettings = [
  body('siteTitle').trim().notEmpty().withMessage('Site title is required'),
  body('maxOccupancyPerRoom')
    .isInt({ min: 1 })
    .withMessage('Maximum occupancy must be a positive number'),
  body('contactEmail')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('contactPhone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Update site settings
exports.updateSettings = async (req, res) => {
  try {
    const settings = await adminService.updateSettings(req.body);
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating site settings',
      error: err.message,
    });
  }
};

// Get site settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await adminService.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching site settings',
      error: err.message,
    });
  }
};