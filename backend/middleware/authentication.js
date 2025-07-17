const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const User = require("../models/userModel")
const Veterinarian = require("../models/vetModel")
const HttpError = require("../models/http-error")

// Utility function to send JWT token as cookie
const sendTokenCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "6h" })
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 6 * 60 * 60 * 1000, // 6 hours in ms
  }
  res.cookie("token", token, cookieOptions)
  return token
}

// Role-based signup handler
const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new HttpError("Invalid data passed", 400))
    }

    const { name, email, password, address, phone, dob, role = "pet-owner", ...otherData } = req.body

    // Validate role
    if (!["pet-owner", "vet"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'pet-owner' or 'vet'",
      })
    }

    // Check if user already exists in either collection
    const existingUser = await User.findOne({ email })
    const existingVet = await Veterinarian.findOne({ email })

    if (existingUser || existingVet) {
      return res.status(422).json({
        success: false,
        message: "User exists already, please log in instead",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let newUser
    
    if (role === "vet") {
      // Validate required vet fields
      const { degree, licenseNumber } = otherData
      if (!degree || !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: "Degree and license number are required for veterinarians",
        })
      }

      // Check if license number already exists
      const existingLicense = await Veterinarian.findOne({ licenseNumber })
      if (existingLicense) {
        return res.status(422).json({
          success: false,
          message: "A veterinarian with this license number already exists",
        })
      }

      newUser = new Veterinarian({
        name,
        email,
        password: hashedPassword,
        role,
        degree,
        licenseNumber,
        experience: otherData.experience || 0,
        availability: otherData.availability || { days: [], hours: { start: "", end: "" } },
        profileImage: {
          url: req.file ? req.file.path : "",
          publicId: req.file ? req.file.filename : "",
        },
      })
    } else {
      
      newUser = new User({
        name,
        email,
        password: hashedPassword,
        dob,
        address,
        phone,
        role,
        profileImage: {
          url: req.file ? req.file.path : "",
          publicId: req.file ? req.file.filename : "",
        },
      })
    }

    await newUser.save()

    res.status(201).json({
      success: true,
      message: "Account created successfully! Please login to continue.",
      data: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        redirectTo: "/login",
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

// Role-based login handler
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(new HttpError("Invalid data passed", 400))
    }

    const { email, password } = req.body

    // Check both User and Veterinarian collections
    const existingPetOwner = await User.findOne({ email })
    const existingVet = await Veterinarian.findOne({ email })

    if (!existingPetOwner && !existingVet) {
      return res.status(401).json({
        success: false,
        message: "Couldn't find user with that email. Please signup instead",
      })
    }

    let existingUser = existingPetOwner || existingVet

    // Check if this is a Google OAuth user trying to login with password
    if (existingUser.googleId && !password) {
      return res.status(400).json({
        success: false,
        message: "This account is linked with Google. Please use 'Continue with Google' to login.",
      })
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, existingUser.password)
    if (!validPassword) {
      return res.status(403).json({
        success: false,
        message: "Invalid password, please recheck and try again.",
      })
    }

    // Create JWT and set cookie with role
    const payload = {
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    }
    sendTokenCookie(res, payload)

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        profileImage: existingUser.profileImage,
        isGoogleUser: !!existingUser.googleId,
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

// Logout handler
const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    res.status(200).json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Logout failed, please try again.",
    })
  }
}

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return next(new HttpError("Please login or create account to visit this route", 401))
    }
    
    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return next(new HttpError("Invalid or expired token, please login again", 401))
    }
    
    // Ensure all required userData fields are present
    if (!decodedToken.userId || !decodedToken.email || !decodedToken.role) {
      return next(new HttpError("Invalid token data, please login again", 401))
    }
    
    req.userData = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role,
    }
    next()
  } catch (error) {
    return next(new HttpError("Authentication failed", 401))
  }
}

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userData) {
      return next(new HttpError("Authentication required", 401))
    }

    if (!Array.isArray(allowedRoles)) {
      allowedRoles = [allowedRoles]
    }

    if (!allowedRoles.includes(req.userData.role)) {
      return next(new HttpError("Access denied. Insufficient permissions.", 403))
    }

    next()
  }
}

// Get current user based on role
const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const { userId, role } = req.userData
    let user

    if (role === "vet") {
      user = await Veterinarian.findById(userId).select("-password")
    } else {
      user = await User.findById(userId).select("-password")
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        isGoogleUser: !!user.googleId,
        // Include fields that exist in both models
        ...(user.dob && { dob: user.dob }),
        ...(user.phone && { phone: user.phone }),
        ...(user.address && { address: user.address }),
        ...(user.location && { location: user.location }),
        // Include vet-specific fields if applicable
        ...(role === "vet" && {
          degree: user.degree,
          experience: user.experience,
          licenseNumber: user.licenseNumber,
          availability: user.availability,
          isAvailableForAppointments: user.isAvailableForAppointments,
        }),
      },
    })
  } catch (error) {
    console.error("GetCurrentUser error:", error)
    res.status(500).json({
      success: false,
      message: "Fetching user failed, please try again.",
    })
  }
}

module.exports = {
  signup,
  login,
  logout,
  authenticate,
  requireRole,
  getCurrentUser,
  sendTokenCookie,
}
