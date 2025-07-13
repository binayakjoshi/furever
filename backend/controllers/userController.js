const User = require("../models/userModel")
const Pet = require("../models/petModel")
const Adoption = require("../models/adoptionModel")
const ForumPost = require("../models/forumPostModel")
const ForumReply = require("../models/forumReplyModel")
const Veterinarian = require("../models/vetModel")
const HttpError = require("../models/http-error")
const bcrypt = require("bcryptjs")
const GeocodingService = require("../services/geocodingService")

const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.userData
    
    let user
    if (role === "vet") {
      user = await Veterinarian.findById(id).select("-password")
    } else {
      user = await User.findById(id).select("-password")
    }

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
    
    // Check if user is trying to delete their own account or is authorized
    if (req.userData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own account",
      })
    }

    const { role } = req.userData
    let user

    if (role === "vet") {
      user = await Veterinarian.findById(userId)
    } else {
      user = await User.findById(userId)
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Start cascade delete process
    console.log(`Starting cascade delete for user: ${userId}`)

    // For pet-owners: delete pets and adoption-related data
    if (role === "pet-owner") {
      // 1. Delete all pets owned by the user
      const deletedPets = await Pet.deleteMany({ user: userId })
      console.log(`Deleted ${deletedPets.deletedCount} pets`)

      // 2. Delete all adoption posts created by the user
      const deletedAdoptions = await Adoption.deleteMany({ creator: userId })
      console.log(`Deleted ${deletedAdoptions.deletedCount} adoption posts`)

      // 3. Remove user from interested users in other adoption posts
      await Adoption.updateMany({ "interestedUsers.user": userId }, { $pull: { interestedUsers: { user: userId } } })
      console.log(`Removed user from interested users in adoption posts`)
    }

    // For both roles: delete forum-related data
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

    // 7. Finally, delete the user
    if (role === "vet") {
      await Veterinarian.findByIdAndDelete(userId)
    } else {
      await User.findByIdAndDelete(userId)
    }
    console.log(`Deleted user: ${userId}`)

    // Clear cookie since user is deleting their own account
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    res.status(200).json({
      success: true,
      message: "User and all associated data deleted successfully",
      deletedData: {
        pets: role === "pet-owner" ? deletedPets?.deletedCount || 0 : 0,
        adoptionPosts: role === "pet-owner" ? deletedAdoptions?.deletedCount || 0 : 0,
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
    // Ensure user is authenticated and userData is available
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userId = req.userData.userId
    const { role } = req.userData
    const { password, ...updateData } = req.body ?? {}

    let user
    if (role === "vet") {
      user = await Veterinarian.findById(userId)
    } else {
      user = await User.findById(userId)
    }

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

    // Update common fields
    if (updateData.name) user.name = updateData.name
    if (updateData.phone) user.phone = updateData.phone
    if (updateData.address) user.address = updateData.address
    if (updateData.dob) user.dob = new Date(updateData.dob)

    // Update vet-specific fields if user is a vet
    if (role === "vet") {
      if (updateData.degree) user.degree = updateData.degree
      if (updateData.experience !== undefined) user.experience = updateData.experience
      if (updateData.clinicName) user.clinicName = updateData.clinicName
      if (updateData.specialization) user.specialization = updateData.specialization
      if (updateData.bio) user.bio = updateData.bio
      if (updateData.contactInfo) user.contactInfo = updateData.contactInfo
      if (updateData.availability) user.availability = updateData.availability
    }

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
    // Ensure user is authenticated and userData is available
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userId = req.userData.userId
    const { role } = req.userData
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

    let user
    if (role === "vet") {
      user = await Veterinarian.findById(userId)
    } else {
      user = await User.findById(userId)
    }

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

// Google OAuth helper (updated to handle role-based creation)
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

    // Create new user (default to pet-owner for Google OAuth)
    const newUser = new User({
      googleId: googleProfile.id,
      name: googleProfile.displayName,
      email: googleProfile.emails[0].value,
      profileImage: {
        url: googleProfile.photos && googleProfile.photos[0] ? googleProfile.photos[0].value : "",
        publicId: "google_" + googleProfile.id,
      },
      role: "pet-owner", 
    })

    await newUser.save()
    return newUser
  } catch (error) {
    throw error
  }
}

module.exports = {
  getUserById,
  deleteUser,
  updateCurrentUser,
  updatePassword,
  createOrUpdateGoogleUser,
}
