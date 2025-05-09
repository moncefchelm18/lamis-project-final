const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth.middleware');

// Register user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['student', 'service', 'admin'])
      .withMessage('Role must be either student, service or admin'),
    body('studentId')
      .custom((value, { req }) => {
        if (req.body.role === 'student' && !value) {
          throw new Error('Student ID is required for student role');
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      const { name, email, password, role, studentId } = req.body;
      
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user object with required fields
      const userObj = {
        name,
        email,
        password,
        role
      };

      // Add studentId if role is student
      if (role === 'student') {
        userObj.studentId = studentId;
      }

      user = await User.create(userObj);

      // Create token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...(user.role === 'student' && { studentId: user.studentId }),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check for user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get current logged in user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
