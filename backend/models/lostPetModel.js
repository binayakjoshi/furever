const mongoose = require("mongoose")

const lostPetSchema = new mongoose.Schema(
  {
    name:{  
      type:String,
      required:true
    },
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
    image: 
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
  
    status: {
      type: String,
      enum: ["active", "cancelled", "found"],
      default: "active",
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    foundAlerts: [
      {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
           
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
