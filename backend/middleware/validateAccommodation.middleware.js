exports.validateResidency = (req, res, next) => {
  const { title, wilaya } = req.body;
  const errors = [];

  // Check required fields
  if (!title || title.trim() === "") {
    errors.push("Title is required");
  }

  if (!wilaya || wilaya.trim() === "") {
    errors.push("Wilaya is required");
  }

  // Validate numberOfRooms if provided
  if (req.body.numberOfRooms !== undefined) {
    const numberOfRooms = parseInt(req.body.numberOfRooms);
    if (isNaN(numberOfRooms) || numberOfRooms < 0) {
      errors.push("Number of rooms must be a non-negative number");
    }
  }

  // Validate amenities if provided
  if (req.body.amenities !== undefined && !Array.isArray(req.body.amenities)) {
    errors.push("Amenities must be an array");
  }

  // Validate images if provided
  if (req.body.images !== undefined && !Array.isArray(req.body.images)) {
    errors.push("Images must be an array");
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  next();
};
