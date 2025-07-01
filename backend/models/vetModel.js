const mongoose = require("mongoose")

const veterinarianSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: [true, "Veterinarian name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true, 
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
  },
  degree: {
    type: String,
    required: [true, "Degree is required"],
    trim: true,
    maxlength: [200, "Degree cannot exceed 200 characters"],
  },
  yearsOfExperience: {
    type: Number,
    required: [true, "Years of experience is required"],
    min: [0, "Years of experience cannot be negative"],
    max: [60, "Years of experience cannot exceed 60 years"],
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [18, "Age must be at least 18"],
    max: [100, "Age cannot exceed 100"],
  },
  dob: {
    type: Date,
    required: [true, "Date of birth is required"],
    validate: {
      validator: (value) => value <= new Date(),
      message: "Date of birth cannot be in the future",
    },
  },
 specialization: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 10,
      message: "Cannot have more than 10 specializations",
    },
  },
  clinicName: {
    type: String,
    trim: true,
    maxlength: [200, "Clinic name cannot exceed 200 characters"],
  },
  clinicAddress: {
    type: String,
    trim: true,
    maxlength: [300, "Clinic address cannot exceed 300 characters"],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-()]+$/, "Please provide a valid phone number"],
  },
  licenseNumber: {
    type: String,
    required: [true, "License number is required"],
    trim: true,
    unique: true,
    maxlength: [50, "License number cannot exceed 50 characters"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, "Bio cannot exceed 1000 characters"],
  },
  profileImage: {
    url: String,
    publicId: String,
  },
  availability: {
    days: [
      {
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      },
    ],
    hours: {
      start: String, // example: "09:00"
      end: String, 
    },
  },
  consultationFee: {
    type: Number,
    min: [0, "Consultation fee cannot be negative"],
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

//query helpers
veterinarianSchema.index({ email: 1 })
veterinarianSchema.index({ licenseNumber: 1 })
veterinarianSchema.index({ specialization: 1 })
veterinarianSchema.index({ status: 1, isVerified: 1 })


veterinarianSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Validate age matches DOB
veterinarianSchema.pre("save", function (next) {
  if (this.dob && this.age) {
    const today = new Date()
    const birthDate = new Date(this.dob)
    const calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000))

    if (Math.abs(calculatedAge - this.age) > 1) {
      return next(new Error("Age does not match date of birth"))
    }
  }
  next()
})

const Veterinarian = mongoose.model("Veterinarian", veterinarianSchema)

module.exports = Veterinarian
