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
   dob: {
      type: Date,
      required: [true, "Pet date of birth is required"],
      validate: {
        validator: (value) => {
          return value <= new Date() 
        },
        message: "invalid dob",
      },
    },
  diseases: [
    {
      type:String,
      required : true
    },
  ],
  vaccinations: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      vaccDate: {
        type: Date,
        required: true,
      },
      nextVaccDate:{
        type: Date,
        required :true,
      } 
    },
  ],
  breed: {
    type: String,
    required: [true, "Pet breed is required"],
    trim: true,
  },
  
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  image:{
    url:String,
    publicId:String,
  },
  
})


const Pet = mongoose.model("Pet", petSchema)

module.exports = Pet


