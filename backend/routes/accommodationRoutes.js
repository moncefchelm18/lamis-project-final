const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const validateAccommodation = require('../middleware/validateAccommodation.middleware');
const { createAccommodation, approveAccommodation, rejectAccommodation, listAccommodations, getAccommodationById } = require('../controllers/accommodationController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('service', 'admin'),
  validateAccommodation,
  createAccommodation
);

router.put(
  '/:id/approve',
  protect,
  authorize('admin'),
  approveAccommodation
);

router.put(
  '/:id/reject',
  protect,
  authorize('admin'),
  rejectAccommodation
);

// Public endpoints
router.get('/', listAccommodations);
router.get('/:id', getAccommodationById);

module.exports = router;