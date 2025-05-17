const express = require("express");
const { protect, authorize } = require("../middleware/auth.middleware");
const residencyController = require("../controllers/accommodationController");
const {
  validateResidency,
} = require("../middleware/validateAccommodation.middleware");

const router = express.Router();

// Service provider routes - Require service provider role
router.post(
  "/",
  protect,
  authorize("service", "admin"),
  validateResidency,
  residencyController.createResidency
);

router.get(
  "/",
  protect,
  authorize("service", "admin"),
  residencyController.getUserResidency
);

router.put(
  "/:id",
  protect,
  authorize("service", "admin"),
  validateResidency,
  residencyController.updateResidency
);
router.delete(
  "/:id",
  protect,
  authorize("service", "admin"),
  residencyController.deleteResidency
);

// Public endpoints
router.get("/student", residencyController.getPublicAccommodations); // No protection, or protect if students must be logged in
router.get("/student/:id", residencyController.getAccommodationById);   // No protection, or protect
router.get("/student/:residencyId/rooms", residencyController.getRoomsForAccommodation);



module.exports = router;
