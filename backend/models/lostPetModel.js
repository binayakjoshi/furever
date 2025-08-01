const mongoose = require("mongoose")

const lostPetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
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
      type: String,
      required:true
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


lostPetSchema.index({ status: 1, createdAt: -1 })
lostPetSchema.index({ owner: 1 })

module.exports = mongoose.model("LostPet", lostPetSchema)
