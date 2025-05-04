const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const SiteSettings = require('../models/site-settings.model');
const User = require('../models/user.model');

describe('Admin Settings API', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Create test admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    // Create test regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    // Generate tokens
    adminToken = adminUser.getSignedJwtToken();
    userToken = regularUser.getSignedJwtToken();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await SiteSettings.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await SiteSettings.deleteMany({});
  });

  describe('PUT /api/admin/settings', () => {
    const validSettings = {
      siteTitle: 'E‑Constantine Résidence',
      maxOccupancyPerRoom: 4,
      contactEmail: 'contact@e-constantine.dz',
      contactPhone: '+213 123 456 789',
      address: 'Constantine, Algeria'
    };

    it('should update settings successfully with valid admin token', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validSettings);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject(validSettings);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validSettings);

      expect(res.status).toBe(403);
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .put('/api/admin/settings')
        .send(validSettings);

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid settings data', async () => {
      const invalidSettings = {
        siteTitle: '',
        maxOccupancyPerRoom: 0,
        contactEmail: 'invalid-email',
        contactPhone: '',
        address: ''
      };

      const res = await request(app)
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidSettings);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/admin/settings', () => {
    it('should get settings successfully with valid admin token', async () => {
      const settings = await SiteSettings.create({
        siteTitle: 'Test Site',
        maxOccupancyPerRoom: 4,
        contactEmail: 'test@example.com',
        contactPhone: '+213 123 456 789',
        address: 'Test Address'
      });

      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.siteTitle).toBe(settings.siteTitle);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 for unauthorized access', async () => {
      const res = await request(app)
        .get('/api/admin/settings');

      expect(res.status).toBe(401);
    });
  });
});