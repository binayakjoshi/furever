const mongoose = require("mongoose")

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Pet name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Pet description is required"],
    trim: true,
  },
  diseases: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  vaccination: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        required: true,
      },
      validUntil: Date,
    },
  ],
  nextVaccination: {
    name: {
      type: String,
      trim: true,
    },
    dueDate: Date,
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

// Update the updatedAt field before saving
petSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Pet = mongoose.model("Pet", petSchema)

module.exports = Pet
