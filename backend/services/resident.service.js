const Resident = require('../models/resident.model');
const User = require('../models/user.model');

class ResidentService {
  constructor() {
    this.ROOM_CAPACITY = 4; // Maximum number of residents per room
  }

  async getRoomCurrentCapacity(roomNumber) {
    const activeResidents = await Resident.countDocuments({
      roomNumber,
      status: 'active'
    });
    return activeResidents;
  }

  async addResident(residentData) {
    // Check room capacity
    const currentCapacity = await this.getRoomCurrentCapacity(residentData.roomNumber);
    
    if (currentCapacity >= this.ROOM_CAPACITY) {
      const error = new Error('Room is at full capacity');
      error.statusCode = 409;
      throw error;
    }

    // Create new resident
    const resident = await Resident.create(residentData);
    return resident;
  }

  async deleteResident(id) {
    const resident = await Resident.findById(id);
    
    if (!resident) {
      const error = new Error('Resident not found');
      error.statusCode = 404;
      throw error;
    }

    resident.status = 'inactive';
    await resident.save();
    return resident;
  }

  async updateResident(id, updateData) {
    const resident = await Resident.findById(id);
    
    if (!resident) {
      const error = new Error('Resident not found');
      error.statusCode = 404;
      throw error;
    }

    // If room number is being updated, check capacity
    if (updateData.roomNumber && updateData.roomNumber !== resident.roomNumber) {
      const currentCapacity = await this.getRoomCurrentCapacity(updateData.roomNumber);
      if (currentCapacity >= this.ROOM_CAPACITY) {
        const error = new Error('Target room is at full capacity');
        error.statusCode = 409;
        throw error;
      }
    }

    // Update allowed fields
    if (updateData.roomNumber) resident.roomNumber = updateData.roomNumber;
    if (updateData.enrollmentDate) resident.enrollmentDate = new Date(updateData.enrollmentDate);
    if (updateData.fullName) resident.fullName = updateData.fullName;

    await resident.save();
    return resident;
  }

  async searchResidents(query, page = 1, limit = 10) {
    if (!query) {
      const error = new Error('Search query is required');
      error.statusCode = 400;
      throw error;
    }

    const skip = (page - 1) * limit;

    // Find users matching the query
    const matchingUsers = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('_id');

    const userIds = matchingUsers.map(user => user._id);

    // Find residents with matching student IDs or directly by ID
    const filter = {
      $or: [
        { studentId: { $in: userIds } },
        { _id: mongoose.Types.ObjectId.isValid(query) ? query : null }
      ]
    };

    const [residents, total] = await Promise.all([
      Resident.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName username')
        .exec(),
      Resident.countDocuments(filter)
    ]);

    return {
      results: residents,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  }
}

module.exports = new ResidentService();