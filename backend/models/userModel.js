const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: function () {
      // Password is required only if googleId is not present (regular signup)
      return !this.googleId
    },
    minlength: 6,
  },
  // Added Google OAuth field
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values but ensures uniqueness when present
    unique: true,
  },
  // Enhanced roles for login signup function
  role: {
    type: String,
    enum: ["pet-owner", "vet"],
    default: "pet-owner",
    required: true,
  },
  pets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
  ],
  dob: {
    type: Date,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  
  location:{
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere", // For geospatial queries
    },
  },
  profileImage: {
    url: String,
    publicId: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})



// Pre-save middleware to handle OAuth users and location
userSchema.pre("save", function (next) {
  console.log("Pre-save middleware - User role:", this.role)

  // If this is a Google OAuth user and no password is set, generate a random one
  if (this.googleId && !this.password) {
    const bcrypt = require("bcryptjs")
    this.password = bcrypt.hashSync(Math.random().toString(36) + Date.now().toString(), 12)
  }

  // Ensure role is set to a valid value
  if (!this.role || !["pet-owner", "vet"].includes(this.role)) {
    console.log("Invalid or missing role, setting to pet-owner")
    this.role = "pet-owner"
  }

  next()
})

const User = mongoose.model("User", userSchema)
module.exports = User
