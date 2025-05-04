const Accommodation = require('../models/accommodation.model');

class AccommodationService {
  async createAccommodation(accommodationData) {
    try {
      const accommodation = await Accommodation.create({
        ...accommodationData,
        status: 'PENDING'
      });

      return {
        success: true,
        accommodationId: accommodation._id
      };
    } catch (error) {
      throw error;
    }
  }

  async listAccommodations(page = 1, limit = 10, onlyApproved = true) {
    try {
      const query = onlyApproved ? { status: 'APPROVED' } : {};
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        Accommodation.find(query)
          .select('name mainImage description location price')
          .skip(skip)
          .limit(limit)
          .lean(),
        Accommodation.countDocuments(query)
      ]);

      return {
        results,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      throw error;
    }
  }

  async getAccommodationById(id, userRole) {
    try {
      const query = userRole === 'admin' ? { _id: id } : { _id: id, status: 'APPROVED' };
      const accommodation = await Accommodation.findOne(query).lean();

      if (!accommodation) {
        const error = new Error('Accommodation not found');
        error.statusCode = 404;
        throw error;
      }

      return accommodation;
    } catch (error) {
      throw error;
    }
  }

  async updateAccommodationStatus(id, status) {
    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      const error = new Error('Accommodation not found');
      error.statusCode = 404;
      throw error;
    }

    if (accommodation.status !== 'PENDING') {
      const error = new Error('Accommodation is not in pending status');
      error.statusCode = 409;
      throw error;
    }

    accommodation.status = status;
    await accommodation.save();
    return accommodation;
  }

  async approveAccommodation(id) {
    return this.updateAccommodationStatus(id, 'APPROVED');
  }

  async rejectAccommodation(id) {
    return this.updateAccommodationStatus(id, 'REJECTED');
  }
}

module.exports = new AccommodationService();