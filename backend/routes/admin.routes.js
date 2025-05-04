const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateSettings, updateSettings, getSettings } = require('../controllers/admin.controller');

// GET /api/admin/settings - Get site settings
router.get(
  '/settings',
  protect,
  authorize('admin'),
  getSettings
);

// PUT /api/admin/settings - Update site settings
router.put(
  '/settings',
  protect,
  authorize('admin'),
  validateSettings,
  updateSettings
);

module.exports = router;