const mongoose = require("mongoose")

const lostPetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    petType: {
      type: String,
      enum: ["Dog", "Cat"],
      default: "Dog",
      required: true,
    },
    contactInfo: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      alternateContact: {
        type: String,
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "cancelled", "found"],
      default: "active",
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    foundReports: [
      {
        reporterName: {
          type: String,
          required: true,
        },
        reporterContact: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          maxlength: 500,
        },
        location: {
          type: String,
          required: true,
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        images: [
          {
            url: String,
            publicId: String,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
lostPetSchema.index({ status: 1, createdAt: -1 })
lostPetSchema.index({ owner: 1 })

module.exports = mongoose.model("LostPet", lostPetSchema)
