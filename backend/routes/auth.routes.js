// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator"); // Added validationResult
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/auth.middleware");

const INITIAL_ADMIN_EMAIL =
  process.env.INITIAL_ADMIN_EMAIL || "admin@gmail.com"; // For initial admin

// Register user
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Please include a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["student", "service", "admin"])
      .withMessage("Role must be either student, service or admin"),
    body("studentId").custom((value, { req }) => {
      if (req.body.role === "student" && !value) {
        throw new Error("Student ID is required for student role");
      }
      // Ensure studentId is unique if provided
      if (req.body.role === "student" && value) {
        return User.findOne({ studentId: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Student ID already in use");
          }
        });
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req); // Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, role, studentId } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // If role is student and studentId is provided, check its uniqueness again (belt and braces)
      if (role === "student" && studentId) {
        const studentExists = await User.findOne({ studentId });
        if (studentExists) {
          return res
            .status(400)
            .json({ success: false, message: "Student ID already exists" });
        }
      }

      const userFields = {
        name,
        email,
        password,
        role,
        status: "pending", // Default for new users
      };

      if (role === "student" && studentId) {
        userFields.studentId = studentId;
      }

      // Special case for the very first admin account
      const isInitialAdmin = email === INITIAL_ADMIN_EMAIL && role === "admin";
      const adminCount = await User.countDocuments({ role: "admin" });

      if (isInitialAdmin && adminCount === 0) {
        userFields.status = "approved"; // Auto-approve the first admin
      }

      user = await User.create(userFields);

      // For approved users, generate token immediately. For pending, they can't log in yet.
      let token = null;
      if (user.status === "approved") {
        token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRE,
          }
        );
      }

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        ...(user.role === "student" && { studentId: user.studentId }),
      };

      res.status(201).json({
        success: true,
        message:
          user.status === "pending"
            ? "Registration successful! Your account is pending approval."
            : "Registration successful!",
        token: token, // Will be null if pending
        user: userResponse,
      });
    } catch (err) {
      console.error("Registration error:", err);
      // Handle specific Mongoose duplicate key errors for email or studentId
      if (err.code === 11000) {
        let field = Object.keys(err.keyValue)[0];
        field = field === "email" ? "Email" : "Student ID";
        return res
          .status(400)
          .json({ success: false, message: `${field} already exists.` });
      }
      res
        .status(500)
        .json({ success: false, message: err.message || "Server Error" });
    }
  }
);

// Login user - Updated
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please include a valid email")
      .normalizeEmail(),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      // --- Check if user is approved ---
      if (user.status !== "approved") {
        // Since 'rejected' means deleted, the user wouldn't be found by findOne if rejected.
        // So, the only non-approved status here should be 'pending'.
        let message = "Your account is pending approval by an administrator.";
        return res
          .status(403)
          .json({
            success: false,
            message: message,
            accountStatus: user.status,
          });
      }
      // if (user.status !== "approved") {
      //   let message = "Your account is not yet approved.";
      //   if (user.status === "pending")
      //     message = "Your account is pending approval by an administrator.";
      //   if (user.status === "rejected")
      //     message = "Your account has been rejected.";
      //   if (user.status === "suspended")
      //     message = "Your account has been suspended.";
      //   return res
      //     .status(403)
      //     .json({
      //       success: false,
      //       message: message,
      //       accountStatus: user.status,
      //     });
      // }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status, // good to send status
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

// Get current logged in user - /me
router.get("/me", protect, async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Critical: Ensure only approved users can proceed if this endpoint is used for session validation
    if (user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Account not active.",
        accountStatus: user.status,
      });
    }

    res.json({
      success: true,
      user: {
        // Return a consistent user object
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        ...(user.role === "student" && { studentId: user.studentId }),
        // Add other fields you want to expose, e.g., universityInfo for students
      },
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
