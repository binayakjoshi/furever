const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  veterinarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Veterinarian",
    required: [true, "Veterinarian reference is required"],
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
    required: [true, "Pet reference is required"],
  },
  reason: {
    type: String,
    required: [true, "Reason for appointment is required"],
    trim: true,
    minlength: [5, "Reason must be at least 5 characters"],
    maxlength: [200, "Reason cannot exceed 200 characters"],
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "high", "emergency"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
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

// Indexes for better query performance
appointmentSchema.index({ user: 1, status: 1 })
appointmentSchema.index({ veterinarian: 1, status: 1 })
appointmentSchema.index({ status: 1, createdAt: -1 })

// Pre-save middleware to update timestamps
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Appointment = mongoose.model("Appointment", appointmentSchema)

module.exports = Appointment
