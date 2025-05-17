// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { contactResidency, getMessagesForManagedResidencies, updateMessageStatus } = require('../controllers/messageController');
const { protect, authorize } = require("../middleware/auth.middleware");

// POST /api/messages/contact-residency
router.post('/contact-residency', protect, authorize("student"), contactResidency);

// You can add more routes here for admins/managers to view messages
// e.g., router.get('/residency/:residencyId', protectResidencyManager, getMessagesForResidency);
router.get('/my-residencies', protect, authorize('service'), getMessagesForManagedResidencies);

router.put('/:messageId/status', protect, authorize('service'), updateMessageStatus);

module.exports = router;