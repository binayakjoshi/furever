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
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google OAuth user
    },
    minlength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    default: "vet",
    enum: ["vet"],
  },
  userId: {
    type: String,
    unique: true,
  },

  degree: {
    type: String,
    required: [true, "Degree is required"],
    trim: true,
    maxlength: [200, "Degree cannot exceed 200 characters"],
  },
  experience: {
    type: Number,
    default: 0,
    min: [0, "Experience cannot be negative"],
    max: [60, "Experience cannot exceed 60 years"],
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
  // availability: {
  //   days: [
  //     {
  //       type: String,
  //       enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  //     },
  //   ],
  //   hours: {
  //     start: String, // example: "09:00"
  //     end: String,
  //   },
  // },
  availability:{
    type:String,
    required:true
  },
  isAvailableForAppointments: {
    type: Boolean,
    default: true,
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

veterinarianSchema.pre("save", function (next) {
  // Set userId to be the same as _id if not already set
  if (!this.userId) {
    this.userId = this._id.toString()
  }
  
  this.updatedAt = Date.now()
  next()
})

const Veterinarian = mongoose.model("Veterinarian", veterinarianSchema)

module.exports = Veterinarian
