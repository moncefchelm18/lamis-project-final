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
    // This is a custom student identifier, not the MongoDB _id
    studentId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have null for this field if unique constraint is on
      default: null,
    },
    universityInfo: {
      university: String,
      faculty: String,
      year: String,
      admissionId: String,
      admissionConfirmed: Boolean,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals are included in toJSON output
    toObject: { virtuals: true }, // Ensure virtuals are included in toObject output
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
