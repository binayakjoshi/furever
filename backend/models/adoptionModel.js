const mongoose = require("mongoose")

const adoptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Pet name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Creator reference is required"],
  },
 
  description: {
    type: String,
    required: [true, "Adoption post description is required"],
    trim: true,
    minlength: [20, "Description must be at least 20 characters"],
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
   breed: {
    type: String,
    required: [true, "Pet breed is required"],
    trim: true,
  },
 
  image: {
    url: {
      type: String,
      required: [true, "Pet image URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Pet image public ID is required"],
    },
  },
  
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    preferredContact: {
      type: String,
      enum: ["phone", "email", "both"],
      default: "both",
    },
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: [500, "Requirements cannot exceed 500 characters"],
  },
  interestedUsers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      interestedAt: {
        type: Date,
        default: Date.now,
      },
      message: {
        type: String,
        trim: true,
        maxlength: [300, "Interest message cannot exceed 300 characters"],
      },
    },
  ],
  status: {
    type: String,
    enum: ["active", "pending", "adopted", "cancelled"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for better query performance
adoptionSchema.index({ creator: 1, status: 1 })
adoptionSchema.index({ status: 1, createdAt: -1 })
adoptionSchema.index({ location: 1, status: 1 })

// Prevent duplicate interest from same user
adoptionSchema.pre("save", function (next) {
  if (this.interestedUsers && this.interestedUsers.length > 0) {
    const userIds = this.interestedUsers.map((interest) => interest.user.toString())
    const uniqueUserIds = [...new Set(userIds)]

    if (userIds.length !== uniqueUserIds.length) {
      return next(new Error("User cannot show interest multiple times"))
    }
  }
  next()
})

const Adoption = mongoose.model("Adoption", adoptionSchema)

module.exports = Adoption
