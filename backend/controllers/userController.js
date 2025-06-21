const User = require("../models/userModel")
const Pet = require("../models/petModel")
const jwt = require("jsonwebtoken")
const HttpError = require("../models/http-error")
const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")

const signup = async (req, res, next) => {
  try {
   
    const errors = validationResult(req)
   
    const { name, email, password, role = "user" } = req.body

    const existingUser = await User.findOne({ email })
  
    if (existingUser) {
      return res.status(422).json({
        success: false,
        message: "User exists already, please login instead",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("Password hashed successfully")

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    })

    await newUser.save()
    console.log("User saved to database:", newUser._id)

    
   

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET , { expiresIn: "6h" })
    console.log("JWT token created successfully")

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        token: token,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      success: false,
      message: "Creating user failed, please try again.",
      
    })
  }
}

const login = async (req, res, next) => {
  try {
 

    const { email, password } = req.body

    const existingUser = await User.findOne({ email: email })
   

    if (!existingUser) {
      return res.status(403).json({
        success: false,
        message: "Invalid credentials, could not log you in.",
      })
    }

    const validPassword = await bcrypt.compare(password, existingUser.password)
    console.log("Password valid:", validPassword)

    if (!validPassword) {
      return res.status(403).json({
        success: false,
        message: "Invalid credentials, could not log you in.",
      })
    }

  

    const token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET , {
      expiresIn: "6h",
    })
    console.log("JWT token created successfully")

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        token: token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Logging in failed, please try again later.",
     
    })
  }
}

// CRUD Methods
exports.createUser = async (req, res) => {
  try {
    console.log("Creating user with data:", req.body)
    const newUser = await User.create(req.body)

    console.log("User created successfully:", newUser._id)

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
      userId: newUser._id.toString(),
    })
  } catch (error) {
    console.error("User creation error:", error)
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    await Pet.deleteMany({ user: req.params.id })

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.signup = signup
exports.login = login
