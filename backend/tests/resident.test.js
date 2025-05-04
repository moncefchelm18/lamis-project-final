const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Resident = require('../models/resident.model');
const User = require('../models/user.model');

describe('Resident API', () => {
  let adminToken;
  let serviceToken;
  let userToken;
  let testResident;

  beforeAll(async () => {
    // Create test users with different roles
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    const serviceUser = await User.create({
      name: 'Service User',
      email: 'service@test.com',
      password: 'password123',
      role: 'service'
    });

    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    // Create tokens
    adminToken = adminUser.getSignedJwtToken();
    serviceToken = serviceUser.getSignedJwtToken();
    userToken = regularUser.getSignedJwtToken();

    // Create a test resident
    testResident = await Resident.create({
      studentId: regularUser._id,
      roomNumber: 'A101',
      enrollmentDate: new Date(),
      status: 'active'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Resident.deleteMany({});
    await mongoose.connection.close();
  });

  describe('DELETE /api/residents/:id', () => {
    it('should allow admin to remove a resident', async () => {
      const response = await request(app)
        .delete(`/api/residents/${testResident._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Resident removed');

      const updatedResident = await Resident.findById(testResident._id);
      expect(updatedResident.status).toBe('inactive');
    });

    it('should allow service role to remove a resident', async () => {
      const newResident = await Resident.create({
        studentId: mongoose.Types.ObjectId(),
        roomNumber: 'B202',
        enrollmentDate: new Date(),
        status: 'active'
      });

      const response = await request(app)
        .delete(`/api/residents/${newResident._id}`)
        .set('Authorization', `Bearer ${serviceToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Resident removed');
    });

    it('should return 404 for non-existent resident', async () => {
      const fakeId = mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/residents/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resident not found');
    });

    it('should return 403 for unauthorized user', async () => {
      const response = await request(app)
        .delete(`/api/residents/${testResident._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});