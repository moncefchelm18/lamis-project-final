const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateResident, validateResidentUpdate, validateSearch, addResident, deleteResident, updateResident, searchResidents } = require('../controllers/resident.controller');

// POST /api/residents - Add a new resident
router.post(
  '/',
  protect,
  authorize('admin', 'service'),
  validateResident,
  addResident
);

// DELETE /api/residents/:id - Remove a resident
router.delete(
  '/:id',
  protect,
  authorize('admin', 'service'),
  deleteResident
);

// PUT /api/residents/:id - Update a resident
router.put(
  '/:id',
  protect,
  authorize('admin', 'service'),
  validateResidentUpdate,
  updateResident
);

// GET /api/residents - Search residents
router.get(
  '/',
  protect,
  authorize('admin', 'service'),
  validateSearch,
  searchResidents
);

module.exports = router;