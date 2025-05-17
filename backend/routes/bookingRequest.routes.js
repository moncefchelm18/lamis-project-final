// bookingRequest.routes.js
const express = require("express");
const {
  getAllBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
  markBookingAsPaid,
  createBookingRequest,
  // Import new student-specific controllers
  getStudentActiveRoomRequest,
  cancelStudentRoomRequest,
  updateStudentRoomRequest,
} = require("../controllers/bookingRequest.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// --- Student Specific Routes ---
// These should be defined before more generic routes like /:id if there's a naming overlap
router.get("/student/my-request", protect, authorize("student"), getStudentActiveRoomRequest);
router.delete("/student/my-request/:id", protect, authorize("student"), cancelStudentRoomRequest);
router.put("/student/my-request/:id", protect, authorize("student"), updateStudentRoomRequest); // For editing

// --- Existing Routes ---
router.post("/student", protect, authorize("student", "service", "admin"), createBookingRequest); // This seems to be for creating a request

// Admin/Service routes
router.get("/", protect, authorize("service", "admin"), getAllBookingRequests);
router.put("/:id/approve", protect, authorize("service", "admin"), approveBookingRequest);
router.put("/:id/reject", protect, authorize("service", "admin"), rejectBookingRequest);
router.put("/:id/mark-paid", protect, authorize("service", "admin"), markBookingAsPaid);

module.exports = router;