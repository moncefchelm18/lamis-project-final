const Residency = require("../models/residency.model");
const {
  NotFoundError,
  ConflictError,
  ValidationError,
} = require("../utils/errors");

/**
 * Create a new residency
 * @param {Object} residencyData - The residency data
 * @param {String} userId - The ID of the user creating the residency
 * @returns {Promise<Object>} - Created residency id
 */
exports.createResidency = async (residencyData, userId) => {
  // Check if the user already has a residency (limit of 1 residency per user)
  const existingResidency = await Residency.findOne({ userId });
  if (existingResidency) {
    throw new ConflictError(
      "You already have a residency. Please edit or delete it first."
    );
  }

  // Create the new residency
  const residency = new Residency({
    ...residencyData,
    userId,
  });

  await residency.save();
  return { residencyId: residency._id };
};

/**
 * Get a residency by ID
 * @param {String} residencyId - The residency ID
 * @returns {Promise<Object>} - Residency object
 */
exports.getResidencyById = async (residencyId) => {
  const residency = await Residency.findById(residencyId);
  if (!residency) {
    throw new NotFoundError("Residency not found");
  }
  return residency;
};

/**
 * Get a residency by user ID
 * @param {String} userId - The user ID
 * @returns {Promise<Object>} - Residency object
 */
exports.getResidencyByUserId = async (userId) => {
  const residency = await Residency.findOne({ userId });
  return residency; // Returns null if not found (expected behavior)
};

/**
 * Update a residency
 * @param {String} residencyId - The residency ID
 * @param {Object} updateData - The data to update
 * @param {String} userId - The user ID making the update
 * @returns {Promise<Object>} - Updated residency
 */
exports.updateResidency = async (residencyId, updateData, userId) => {
  const residency = await Residency.findOne({ _id: residencyId, userId });
  if (!residency) {
    throw new NotFoundError(
      "Residency not found or you do not have permission to update it"
    );
  }

  // Update only allowed fields
  const allowedUpdates = [
    "title",
    "wilaya",
    "type",
    "description",
    "numberOfRooms",
    "amenities",
    "images",
  ];
  const updates = Object.keys(updateData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  if (Object.keys(updates).length === 0) {
    throw new ValidationError("No valid fields to update");
  }

  Object.assign(residency, updates);
  await residency.save();

  return residency;
};

/**
 * Delete a residency
 * @param {String} residencyId - The residency ID
 * @param {String} userId - The user ID making the deletion
 * @returns {Promise<Boolean>} - Success flag
 */
exports.deleteResidency = async (residencyId, userId) => {
  const residency = await Residency.findOne({ _id: residencyId, userId });
  if (!residency) {
    throw new NotFoundError(
      "Residency not found or you do not have permission to delete it"
    );
  }

  await Residency.deleteOne({ _id: residencyId });
  return true;
};

/**
 * Search for residencies
 * @param {Object} filters - Search filters
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Paginated residencies
 */
exports.searchResidencies = async (filters = {}, page = 1, limit = 10) => {
  const query = {};

  // Add text search if provided
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Add specific wilaya filter if provided
  if (filters.wilaya) {
    query.wilaya = filters.wilaya;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const [residencies, total] = await Promise.all([
    Residency.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Residency.countDocuments(query),
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data: residencies,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
};
