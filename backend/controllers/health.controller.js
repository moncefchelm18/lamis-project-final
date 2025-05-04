const startTime = Date.now();

// Configuration for max concurrent users
const maxConcurrentUsers = 1000; // This would typically come from a config file

// Available actor roles in the system
const actorRoles = ['admin', 'service', 'user'];

// GET /
exports.getRoot = (req, res) => {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
    res.json({
      application: "E‑Constantine Résidence",
      version: "1.0.0",
      uptime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/context
exports.getContext = (req, res) => {
  try {
    res.json({
      maxConcurrentUsers,
      actorRoles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};