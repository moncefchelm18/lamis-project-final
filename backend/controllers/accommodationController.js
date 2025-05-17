const residencyService = require("./resident.controller");
const Resident = require("../models/resident.model");
const Accommodation = require("../models/accommodation.model");
const Room = require("../models/room.model");

/**
 * Get the current user's residency
 */
exports.getUserResidency = async (req, res) => {
  try {
    const residency = await Accommodation.find({ userId: req.user.id });
    return res.status(200).json({
      success: true,
      data: residency,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch residency",
      error: error.message,
    });
  }
};

/**
 * Create a new residency
 */
exports.createResidency = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user._id);
    const result = await Accommodation.create({
      ...req.body,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Residency created successfully",
      residencyId: result._id,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "ConflictError") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create residency",
      error: error.message,
    });
  }
};

/**
 * Update a residency
 */
exports.updateResidency = async (req, res) => {
  try {
    const residency = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Residency updated successfully",
      data: residency,
    });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update residency",
      error: error.message,
    });
  }
};

/**
 * Delete a residency
 */
exports.deleteResidency = async (req, res) => {
  try {
    await Accommodation.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Residency deleted successfully",
    });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete residency",
      error: error.message,
    });
  }
};

/**
 * Get a specific residency by ID
 */
exports.getResidencyById = async (req, res) => {
  try {
    const residency = await residencyService.getResidencyById(req.params.id);

    return res.status(200).json({
      success: true,
      data: residency,
    });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch residency",
      error: error.message,
    });
  }
};

/**
 * Search for residencies
 */
exports.searchResidencies = async (req, res) => {
  try {
    const { search, wilaya, page = 1, limit = 10 } = req.query;
    const filters = {};

    if (search) filters.search = search;
    if (wilaya) filters.wilaya = wilaya;

    const result = await residencyService.searchResidencies(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search residencies",
      error: error.message,
    });
  }
};

exports.getPublicAccommodations = async (req, res) => {
  try {
    const { search, wilaya, page = 1, limit = 6 } = req.query; // Default limit 6 as per frontend

    let query = {
        status: 'approved' // Only show approved residencies to students
    };

    if (search) {
      // Using $regex for broader search, or $text for text index search
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        // If you want to search by wilaya textually too
        // { wilaya: searchRegex }
      ];
      // If using $text index:
      // query.$text = { $search: search };
    }

    if (wilaya && wilaya.toLowerCase() !== "all") {
      query.wilaya = wilaya;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalAccommodations = await Accommodation.countDocuments(query);
    const accommodations = await Accommodation.find(query)
      .sort({ createdAt: -1 }) // Or sort by title, etc.
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: accommodations.length,
      total: totalAccommodations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalAccommodations / limitNum) || 1,
        limit: limitNum,
      },
      data: accommodations,
    });
  } catch (error) {
    console.error("Error fetching public accommodations:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getAccommodationById = async (req, res) => {
  try {
      const accommodation = await Accommodation.findById(req.params.id);

      if (!accommodation || accommodation.status !== 'approved') { // Ensure it's an approved one
          return res.status(404).json({ success: false, message: "Accommodation not found or not available" });
      }

      res.status(200).json({ success: true, data: accommodation });
  } catch (error) {
      console.error("Error fetching accommodation by ID:", error);
      if (error.kind === 'ObjectId') {
          return res.status(404).json({ success: false, message: "Accommodation not found" });
      }
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getRoomsForAccommodation = async (req, res) => { // Renamed for clarity
  try {
      const { residencyId } = req.params;
      const accommodation = await Accommodation.findById(residencyId);

      if (!accommodation || accommodation.status !== 'approved') {
          return res.status(404).json({ success: false, message: "Residency not found or not available." });
      }

      // Fetch ALL rooms for the accommodation, not just those marked isAvailable: true
      const rooms = await Room.find({
          accommodation: residencyId,
      }).select('id roomNumber type price capacity'); // Select relevant fields

      res.status(200).json({ success: true, data: rooms });

  } catch (error) {
      console.error("Error fetching rooms for accommodation:", error);
      if (error.kind === 'ObjectId') {
          return res.status(404).json({ success: false, message: "Invalid ID format." });
      }
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};