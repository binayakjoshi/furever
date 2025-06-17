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
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  image:{
    type: String,
    required: [true, "Pet image is required"],
    trim: true,
  },
  images:[
    {
    type: String,
    trim:true,
    }
  ]
})


const Pet = mongoose.model("Pet", petSchema)

module.exports = Pet
