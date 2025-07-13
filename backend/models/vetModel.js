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
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  contactInfo:{
    type:String,
    required: [true, "Contact information for office is required"],
  },
  licenseNumber: {
    type: String,
    required: [true, "License number is required"],
    trim: true,
    unique: true,
    maxlength: [50, "License number cannot exceed 50 characters"],
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
veterinarianSchema.index({ status: 1, isVerified: 1 })
// Add geospatial index
veterinarianSchema.index({ location: "2dsphere" })

veterinarianSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Veterinarian = mongoose.model("Veterinarian", veterinarianSchema)

module.exports = Veterinarian
