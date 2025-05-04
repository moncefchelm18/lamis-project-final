const SiteSettings = require('../models/site-settings.model');

class AdminService {
  async getSettings() {
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Initialize default settings if none exist
      settings = await SiteSettings.create({
        siteTitle: 'E‑Constantine Résidence',
        maxOccupancyPerRoom: 4,
        contactEmail: 'contact@e-constantine.dz',
        contactPhone: '+213 XXX XXX XXX',
        address: 'Constantine, Algeria'
      });
    }
    
    return settings;
  }

  async updateSettings(data) {
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
    }

    // Update fields
    Object.keys(data).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = data[key];
      }
    });

    settings.updatedAt = new Date();
    await settings.save();
    
    return settings;
  }
}

module.exports = new AdminService();