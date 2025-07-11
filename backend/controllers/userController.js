const User = require("../models/userModel")
const Pet = require("../models/petModel")
const Adoption = require("../models/adoptionModel")
const ForumPost = require("../models/forumPostModel")
const ForumReply = require("../models/forumReplyModel")
const Veterinarian = require("../models/vetModel")
const jwt = require("jsonwebtoken")
const HttpError = require("../models/http-error")
const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const GeocodingService = require("../services/geocodingService")

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

// Enhanced signup with role selection
const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
  
      return next(new HttpError("Invalid data passed", 400))
    }
    const { name, email, password, address, phone, dob, role = "pet-owner" } = req.body

    // Validate role
    if (!["pet-owner", "vet"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'pet-owner' or 'vet'",
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(422).json({
        success: false,
        message: "User exists already, please log in instead",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = new User({
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
    await newUser.save()

    // Don't auto-login, redirect to login page with role selection
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
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log(errors.array())
      return next(new HttpError("Invalid data passed", 400))
    }
    const { email, password } = req.body

    let existingUser;


    const existingPetOwner = await User.findOne({ email: email })
    const existingVet = await Veterinarian.findOne({email:email})
    
    
    if (!existingPetOwner && !existingVet) {
      return res.status(401).json({
        success: false,
        message: "Coudln't find User with that email. Please signup instead",
      })
    }
    if (existingPetOwner.googleId && !password) {
      return res.status(400).json({
        success: false,
        message: "This account is linked with Google. Please use 'Continue with Google' to login.",
      })
    }
    if(existingPetOwner)
      existingUser = existingPetOwner;
    else
      existingUser = existingVet
   

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

const getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = req.userData
    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        dob: user.dob,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        isGoogleUser: !!user.googleId,
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

const getUserById = async (req, res) => {
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

// Enhanced delete user with cascade delete
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Start cascade delete process
    console.log(`Starting cascade delete for user: ${userId}`)

    // 1. Delete all pets owned by the user
    const deletedPets = await Pet.deleteMany({ user: userId })
    console.log(`Deleted ${deletedPets.deletedCount} pets`)

    // 2. Delete all adoption posts created by the user
    const deletedAdoptions = await Adoption.deleteMany({ creator: userId })
    console.log(`Deleted ${deletedAdoptions.deletedCount} adoption posts`)

    // 3. Remove user from interested users in other adoption posts
    await Adoption.updateMany({ "interestedUsers.user": userId }, { $pull: { interestedUsers: { user: userId } } })
    console.log(`Removed user from interested users in adoption posts`)

    // 4. Delete all forum posts created by the user
    const userForumPosts = await ForumPost.find({ author: userId })
    const forumPostIds = userForumPosts.map((post) => post._id)

    // Delete all replies to user's forum posts
    await ForumReply.deleteMany({ post: { $in: forumPostIds } })
    console.log(`Deleted replies to user's forum posts`)

    // Delete user's forum posts
    const deletedForumPosts = await ForumPost.deleteMany({ author: userId })
    console.log(`Deleted ${deletedForumPosts.deletedCount} forum posts`)

    // 5. Delete all forum replies created by the user
    const deletedForumReplies = await ForumReply.deleteMany({ author: userId })
    console.log(`Deleted ${deletedForumReplies.deletedCount} forum replies`)

    // 6. Remove user's likes from forum posts and replies
    await ForumPost.updateMany({ "likes.user": userId }, { $pull: { likes: { user: userId } } })
    await ForumReply.updateMany({ "likes.user": userId }, { $pull: { likes: { user: userId } } })
    console.log(`Removed user's likes from forum posts and replies`)

    // 7. If user is a vet, delete their veterinarian profile
    if (user.role === "vet") {
      const deletedVetProfile = await Veterinarian.deleteMany({ email: user.email })
      console.log(`Deleted ${deletedVetProfile.deletedCount} veterinarian profiles`)
    }

    // 8. Finally, delete the user
    await User.findByIdAndDelete(userId)
    console.log(`Deleted user: ${userId}`)

    // Clear cookie if user is deleting their own account
    if (req.userData && req.userData.userId === userId) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
    }

    res.status(200).json({
      success: true,
      message: "User and all associated data deleted successfully",
      deletedData: {
        pets: deletedPets.deletedCount,
        adoptionPosts: deletedAdoptions.deletedCount,
        forumPosts: deletedForumPosts.deletedCount,
        forumReplies: deletedForumReplies.deletedCount,
      },
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Update current user's profile
const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.userData.userId
    const { password, ...updateData } = req.body ?? {}

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Handle profile image update if file is uploaded
    if (req.file) {
      user.profileImage = {
        url: req.file.path,
        publicId: req.file.filename,
      }
    }

    // Update user fields
    if (updateData.name) user.name = updateData.name
    if (updateData.phone) user.phone = updateData.phone
    if (updateData.address) user.address = updateData.address
    if (updateData.dob) user.dob = new Date(updateData.dob)

    await user.save()

    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse,
    })
  } catch (error) {
    console.error("Update current user error:", error)
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    })
  }
}

// Update user password
const updatePassword = async (req, res) => {
  try {
    const userId = req.userData.userId
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (user.googleId) {
      return res.status(400).json({
        success: false,
        message: "Cannot change password for Google OAuth accounts",
      })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedNewPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Update password error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update password",
    })
  }
}

// Location-related functions
const updateUserLocation = async (req, res) => {
  try {
    const userId = req.userData.userId
    const { latitude, longitude, address } = req.body

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      })
    }

    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      })
    }

    // Get address from coordinates if not provided
    let locationAddress = address
    if (!locationAddress) {
      const addressData = await GeocodingService.getAddressFromCoordinates(lat, lng)
      locationAddress = addressData ? addressData.address : ""
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: "Point",
          coordinates: [lng, lat], // MongoDB expects [longitude, latitude]
          address: locationAddress,
        },
      },
      { new: true, runValidators: true },
    ).select("-password")

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        location: user.location,
      },
    })
  } catch (error) {
    console.error("Update user location error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update location",
    })
  }
}

const updateUserLocationByAddress = async (req, res) => {
  try {
    const userId = req.userData.userId
    const { address } = req.body

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      })
    }

    // Geocode the address
    const coordinates = await GeocodingService.getCoordinatesFromAddress(address)

    if (!coordinates) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
          address: coordinates.displayName,
        },
      },
      { new: true, runValidators: true },
    ).select("-password")

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        location: user.location,
        coordinates: coordinates,
      },
    })
  } catch (error) {
    console.error("Update user location by address error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update location",
    })
  }
}

// Enhanced nearby vets with better distance sorting
const findNearbyVets = async (req, res) => {
  try {
    const userId = req.userData.userId
    const { radius = 25, limit = 10 } = req.query

    // Get user's location
    const user = await User.findById(userId).select("location")

    if (!user || !user.location || !user.location.coordinates) {
      return res.status(400).json({
        success: false,
        message: "User location not set. Please update your location first.",
      })
    }

    const [userLng, userLat] = user.location.coordinates

    // Find nearby registered veterinarians with enhanced sorting
    const nearbyVets = await Veterinarian.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          distanceField: "distance",
          maxDistance: radius * 1000, // Convert km to meters
          spherical: true,
          query: { status: "active" },
        },
      },
      {
        $addFields: {
          distanceKm: { $divide: ["$distance", 1000] },
          isEmergency: {
            $or: [
              { $regexMatch: { input: "$clinicName", regex: /emergency|24|urgent/i } },
              { $regexMatch: { input: "$bio", regex: /emergency|24.*hour|urgent/i } },
            ],
          },
          isVerifiedVet: "$isVerified",
        },
      },
      {
        $sort: {
          isEmergency: -1, // Emergency services first
          isVerifiedVet: -1, // Verified vets next
          distance: 1, // Then by distance
        },
      },
      {
        $limit: Number.parseInt(limit),
      },
      {
        $project: {
          licenseNumber: 0, // Hide sensitive info
        },
      },
    ])

    // Also find nearby vet clinics from OpenStreetMap
    const osmVets = await GeocodingService.findNearbyVets(userLat, userLng, radius)

    // Combine and sort all results
    const allVets = [
      ...nearbyVets.map((vet) => ({
        ...vet,
        type: "registered",
        source: "database",
      })),
      ...osmVets.slice(0, Number.parseInt(limit)).map((clinic) => ({
        ...clinic,
        type: "clinic",
        source: "openstreetmap",
        distanceKm: clinic.distance,
      })),
    ]

    // Final sort by emergency, then distance
    allVets.sort((a, b) => {
      // Emergency services first
      if (a.isEmergency && !b.isEmergency) return -1
      if (!a.isEmergency && b.isEmergency) return 1

      // Then by distance
      const distanceA = a.distanceKm || a.distance || 0
      const distanceB = b.distanceKm || b.distance || 0
      return distanceA - distanceB
    })

    res.status(200).json({
      success: true,
      message: "Nearby veterinarians found",
      data: {
        registeredVets: nearbyVets,
        nearbyVetClinics: osmVets.slice(0, Number.parseInt(limit)),
        allVets: allVets.slice(0, Number.parseInt(limit) * 2), // Return more combined results
        userLocation: {
          latitude: userLat,
          longitude: userLng,
          address: user.location.address,
        },
        searchRadius: radius,
        stats: {
          totalFound: allVets.length,
          registeredVets: nearbyVets.length,
          osmClinics: osmVets.length,
          emergencyServices: allVets.filter((v) => v.isEmergency).length,
        },
      },
    })
  } catch (error) {
    console.error("Find nearby vets error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to find nearby veterinarians",
    })
  }
}

// Google OAuth helper
const createOrUpdateGoogleUser = async (googleProfile) => {
  try {
    let existingUser = await User.findOne({ googleId: googleProfile.id })

    if (existingUser) {
      if (googleProfile.photos && googleProfile.photos[0]) {
        existingUser.profileImage = {
          url: googleProfile.photos[0].value,
          publicId: "google_" + googleProfile.id,
        }
        await existingUser.save()
      }
      return existingUser
    }

    existingUser = await User.findOne({ email: googleProfile.emails[0].value })

    if (existingUser) {
      existingUser.googleId = googleProfile.id
      if (googleProfile.photos && googleProfile.photos[0]) {
        existingUser.profileImage = {
          url: googleProfile.photos[0].value,
          publicId: "google_" + googleProfile.id,
        }
      }
      await existingUser.save()
      return existingUser
    }

    const newUser = new User({
      googleId: googleProfile.id,
      name: googleProfile.displayName,
      email: googleProfile.emails[0].value,
      profileImage: {
        url: googleProfile.photos && googleProfile.photos[0] ? googleProfile.photos[0].value : "",
        publicId: "google_" + googleProfile.id,
      },
      role: "pet-owner", // Default role for Google users
    })

    await newUser.save()
    return newUser
  } catch (error) {
    throw error
  }
}

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  getUserById,
  deleteUser,
  updateCurrentUser,
  updatePassword,
  updateUserLocation,
  updateUserLocationByAddress,
  findNearbyVets,
  createOrUpdateGoogleUser,
}
