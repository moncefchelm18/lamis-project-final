const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getRoot, getContext } = require('../controllers/health.controller');

// GET / - Basic application information
router.get('/', getRoot);

// GET /api/context - System context information (Admin only)
router.get('/context', protect, authorize('admin'), getContext);

module.exports = router;