const { body, query, validationResult } = require('express-validator');
const residentService = require('../services/resident.service');

exports.validateResident = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('enrollmentDate')
    .notEmpty().withMessage('Enrollment date is required')
    .isISO8601().withMessage('Invalid enrollment date format')
];

exports.validateResidentUpdate = [
  body('roomNumber')
    .optional()
    .notEmpty().withMessage('Room number cannot be empty'),
  body('enrollmentDate')
    .optional()
    .isISO8601().withMessage('Invalid enrollment date format'),
  body('fullName')
    .optional()
    .notEmpty().withMessage('Full name cannot be empty')
    .isString().withMessage('Full name must be a string')
];

exports.addResident = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, roomNumber, enrollmentDate } = req.body;

    // Add resident through service
    const resident = await residentService.addResident({
      studentId,
      roomNumber,
      enrollmentDate: new Date(enrollmentDate)
    });

    res.status(201).json({
      success: true,
      data: {
        residentId: resident._id
      }
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        message: error.message
      });
    }
    next(error);
  }
};

exports.deleteResident = async (req, res, next) => {
  try {
    const { id } = req.params;

    await residentService.deleteResident(id);

    res.status(200).json({
      success: true,
      message: 'Resident removed'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        message: error.message
      });
    }
    next(error);
  }
};

exports.updateResident = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    await residentService.updateResident(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Resident updated'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }
    if (error.statusCode === 409) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

exports.validateSearch = [
  query('query').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
];

exports.searchResidents = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query: searchQuery, page = 1, limit = 10 } = req.query;
    const result = await residentService.searchResidents(searchQuery, page, limit);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};