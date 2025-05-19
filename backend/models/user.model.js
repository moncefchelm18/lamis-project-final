// models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false, // Hide password by default
    },
    role: {
      type: String,
      enum: ["student", "service", "admin"],
      default: "student",
    },
    studentId: {
      // This is a custom student identifier, not the MongoDB _id
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have null for this field if unique
      // Removed default: Date.now() as it's not appropriate for studentId
    },
    status: {
      // NEW: User status for approval process
      type: String,
      enum: ["pending", "approved"],
      default: "pending", // New users will be pending by default
    },
    verifiedBy: {
      // NEW: ID of the admin who verified this user
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    universityInfo: {
      // This seems specific to students, consider moving or conditional
      university: String,
      faculty: String,
      year: String,
      admissionId: String,
      admissionConfirmed: Boolean,
    },
    // createdAt is handled by timestamps: true
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Mongoose virtual for 'id' (maps to '_id')
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("User", userSchema);
