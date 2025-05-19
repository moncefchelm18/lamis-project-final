// controllers/admin.controller.js
const { body, validationResult } = require("express-validator");
const adminService = require("../services/admin.service"); // Assuming you have this for settings
const User = require("../models/user.model"); // Import User model
const mongoose = require("mongoose");

// --- Settings Controller Functions (Keep yours) ---
exports.validateSettings = [
  /* ... your existing validation ... */
];
exports.updateSettings = async (req, res) => {
  /* ... */
};
exports.getSettings = async (req, res) => {
  /* ... */
};

// --- NEW User Management Controller Functions ---

// Get all system users with filtering and pagination (for Admin dashboard)
exports.getAllSystemUsers = async (req, res) => {
  try {
    const {
      status,
      role,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const query = {};

    if (status && status !== "all") query.status = status;
    if (role && role !== "all") query.role = role;
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex },
      ];
    }

    const users = await User.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select("-password"); // Exclude password

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / parseInt(limit)),
      totalUsers: totalUsers,
    });
  } catch (err) {
    console.error("Error fetching all system users:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Approve a user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.status === "approved") {
      return res
        .status(400)
        .json({ success: false, message: "User is already approved." });
    }

    user.status = "approved";
    user.verifiedBy = req.user.id; // The admin who approved
    await user.save();

    // TODO: Optionally send an email notification to the approved user
    // sendEmail(user.email, "Account Approved", "Your UniRoom account has been approved!");

    res.json({
      success: true,
      message: `User ${user.name} approved successfully.`,
      data: user,
    });
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reject a user
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Prevent deleting the initial/main admin account
    if (
      user.email === (process.env.INITIAL_ADMIN_EMAIL || "admin@gmail.com") &&
      user.role === "admin"
    ) {
      // A more robust check might be to see if it's the *only* approved admin
      const approvedAdminCount = await User.countDocuments({
        role: "admin",
        status: "approved",
      });
      if (approvedAdminCount <= 1 && user.status === "approved") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Cannot delete the only approved administrator.",
          });
      }
    }

    // If the user is already approved, you might want a different flow or stronger confirmation.
    // For now, we'll allow deletion of approved users (except potentially the main admin).
    // if (user.status === 'approved') {
    //   console.warn(`Attempting to delete an already approved user: ${user.email}`);
    // }

    await User.findByIdAndDelete(userId);

    // TODO: Optionally send an email notification to the user (if they provided a valid email for contact before deletion)
    // This is tricky as their account is now gone. Usually, for rejection, you'd inform them first.
    // sendEmail(user.email, "Account Registration Update", "Your UniRoom account registration was not approved and has been removed.");

    res.json({
      success: true,
      message: `User ${user.name} and their registration data have been deleted.`,
    });
  } catch (err) {
    console.error("Error deleting user (rejecting):", err);
    res
      .status(500)
      .json({ success: false, message: "Server Error while deleting user." });
  }
};
// exports.rejectUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid User ID." });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found." });
//     }

//     if (user.status === "rejected") {
//       return res
//         .status(400)
//         .json({ success: false, message: "User is already rejected." });
//     }
//     if (
//       user.status === "approved" &&
//       user.email === (process.env.INITIAL_ADMIN_EMAIL || "admin@gmail.com")
//     ) {
//       return res
//         .status(403)
//         .json({
//           success: false,
//           message: "The initial admin account cannot be rejected.",
//         });
//     }

//     user.status = "rejected";
//     user.verifiedBy = req.user.id; // The admin who rejected
//     await user.save();

//     // TODO: Optionally send an email notification to the rejected user
//     // sendEmail(user.email, "Account Update", "Your UniRoom account registration was not approved at this time.");

//     res.json({
//       success: true,
//       message: `User ${user.name} rejected successfully.`,
//       data: user,
//     });
//   } catch (err) {
//     console.error("Error rejecting user:", err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
