const validateAccommodation = (req, res, next) => {
  const { name, description, address, phone, contactEmail, roomCount, mainImage, galleryImages } = req.body;

  // Check for required fields
  if (!name || !description || !address || !phone || !contactEmail || !mainImage || roomCount === undefined) {
    return res.status(400).json({
      message: 'Please provide all required fields'
    });
  }

  // Validate phone number (8-15 digits)
  const phoneRegex = /^\d{8,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      message: 'Phone number must be between 8 and 15 digits'
    });
  }

  // Validate email
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(contactEmail)) {
    return res.status(400).json({
      message: 'Please provide a valid email address'
    });
  }

  // Validate roomCount
  if (roomCount < 0) {
    return res.status(400).json({
      message: 'Room count cannot be negative'
    });
  }

  // Validate mainImage URL
  if (!mainImage.trim()) {
    return res.status(400).json({
      message: 'Main image URL cannot be empty'
    });
  }

  // Validate galleryImages array
  if (galleryImages && !Array.isArray(galleryImages)) {
    return res.status(400).json({
      message: 'Gallery images must be an array of URLs'
    });
  }

  next();
};

module.exports = validateAccommodation;