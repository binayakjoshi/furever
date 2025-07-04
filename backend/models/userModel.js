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
    required: [true, "Password is required"],
    minlength: 6,
  },
  //added roles for login signup function
  role: {
    type: String,
    enum: ["user", "vet"],
    default: "user",
    required: true,
  },
  pets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
  ],
  dob:{
    type: Date,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  profileImage: {
    url: String,
    publicId: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
