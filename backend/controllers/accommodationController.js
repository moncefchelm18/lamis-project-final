const accommodationService = require('../services/accommodationService');

exports.listAccommodations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await accommodationService.listAccommodations(page, limit);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getAccommodationById = async (req, res) => {
  try {
    const accommodation = await accommodationService.getAccommodationById(
      req.params.id,
      req.user?.role
    );
    
    return res.status(200).json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.approveAccommodation = async (req, res) => {
  try {
    await accommodationService.approveAccommodation(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Accommodation approved'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.rejectAccommodation = async (req, res) => {
  try {
    await accommodationService.rejectAccommodation(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Accommodation rejected'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createAccommodation = async (req, res) => {
  try {
    const result = await accommodationService.createAccommodation(req.body);
    
    return res.status(201).json({
      success: true,
      accommodationId: result.accommodationId
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};