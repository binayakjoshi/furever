const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
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
    minlength: [6, "Password must be at least 6 characters"],
    required: ()=> {
      return !this.googleId
    },
  },
   googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  pets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
  ],
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },

  // profileImage:{
  //   url:String,
  //   publicID:String,

  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
