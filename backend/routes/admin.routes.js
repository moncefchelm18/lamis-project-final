// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  validateSettings,
  updateSettings,
  getSettings,
  // Import new controller functions for user management
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllSystemUsers, // For general user listing by admin
} = require("../controllers/admin.controller"); // You'll create these controller functions

// --- Settings Routes ---
router.get("/settings", protect, authorize("admin"), getSettings);
router.put(
  "/settings",
  protect,
  authorize("admin"),
  validateSettings,
  updateSettings
);

// --- User Management Routes (Admin Only) ---
// Get all users with filters (includes pending, approved, etc.)
router.get("/users", protect, authorize("admin"), getAllSystemUsers);

// Get users specifically pending approval (could be a filtered version of /users or a dedicated route)
// router.get('/users/pending', protect, authorize('admin'), getPendingUsers); // Alternative

// Approve a user
router.patch(
  "/users/:userId/approve",
  protect,
  authorize("admin"),
  approveUser
);

// Reject a user
router.patch("/users/:userId/reject", protect, authorize("admin"), rejectUser);

// You might also want routes to suspend/unsuspend users, change roles, etc.

module.exports = router;
