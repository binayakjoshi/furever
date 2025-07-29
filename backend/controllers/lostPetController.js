const LostPet = require("../models/lostPetModel")
const Pet = require("../models/petModel")
const User = require("../models/userModel")
const emailService = require("../services/emailService")
const { validationResult } = require("express-validator")


exports.createLostPet = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { petId, breed, description, petType, contactInfo } = req.body

  
    const pet = await Pet.findOne({ _id: petId, user: req.userData.userId })
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found or you don't have permission",
      })
    }

  
    const images = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: file.path,
          publicId: file.filename,
        })
      })
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      })
    }

    const lostPet = new LostPet({
      owner: req.userData.userId,
      pet: petId,
      breed,
      description,
      petType: petType || "Dog",
      contactInfo,
      images,
      status: "active",
      alertSent: false,
    })

    await lostPet.save()
    await lostPet.populate([
      { path: "owner", select: "name email" },
      { path: "pet", select: "name" },
    ])

    // Send lost pet alert email to owner
    try {
      await emailService.sendLostPetAlert({
        ownerEmail: lostPet.owner.email,
        ownerName: lostPet.owner.name,
        petName: lostPet.pet.name,
        petDescription: description,
        contactInfo: contactInfo,
        location: "Please check your post for location details",
      })
      console.log("Lost pet alert email sent successfully")
    } catch (emailError) {
      console.error("Failed to send lost pet alert:", emailError)
     
    }

    res.status(201).json({
      success: true,
      message: "Lost pet post created successfully",
      data: lostPet,
    })
  } catch (error) {
    console.error("Create lost pet error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create lost pet post",
    })
  }
}

exports.getAllLostPets = async (req, res) => {
  try {
    const { status = "active", petType, page = 1, limit = 10 } = req.query

    const filter = {}
    if (status && status !== "all") {
      filter.status = status
    }
    if (petType && petType !== "all") {
      filter.petType = petType
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const lostPets = await LostPet.find(filter)
      .populate("owner", "name email phone")
      .populate("pet", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await LostPet.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: lostPets,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + lostPets.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get lost pets error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lost pets",
    })
  }
}


exports.getLostPetById = async (req, res) => {
  try {
    const lostPet = await LostPet.findById(req.params.id).populate("owner", "name email phone").populate("pet", "name")

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: "Lost pet post not found",
      })
    }

    res.status(200).json({
      success: true,
      data: lostPet,
    })
  } catch (error) {
    console.error("Get lost pet by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lost pet",
    })
  }
}

exports.updateLostPet = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const lostPet = await LostPet.findById(req.params.id)
    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: "Lost pet post not found",
      })
    }

    
    if (lostPet.owner.toString() !== req.userData.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own lost pet posts",
      })
    }

    const { breed, description, petType, contactInfo, status } = req.body

    
    if (breed) lostPet.breed = breed
    if (description) lostPet.description = description
    if (petType) lostPet.petType = petType
    if (contactInfo) lostPet.contactInfo = contactInfo
    if (status) lostPet.status = status

    
    if (req.files && req.files.length > 0) {
      const newImages = []
      req.files.forEach((file) => {
        newImages.push({
          url: file.path,
          publicId: file.filename,
        })
      })
      lostPet.images = [...lostPet.images, ...newImages]
    }

    await lostPet.save()
    await lostPet.populate([
      { path: "owner", select: "name email" },
      { path: "pet", select: "name" },
    ])

    res.status(200).json({
      success: true,
      message: "Lost pet post updated successfully",
      data: lostPet,
    })
  } catch (error) {
    console.error("Update lost pet error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update lost pet post",
    })
  }
}


exports.deleteLostPet = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const lostPet = await LostPet.findById(req.params.id)
    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: "Lost pet post not found",
      })
    }

    
    if (lostPet.owner.toString() !== req.userData.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own lost pet posts",
      })
    }

    await LostPet.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Lost pet post deleted successfully",
    })
  } catch (error) {
    console.error("Delete lost pet error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete lost pet post",
    })
  }
}


exports.reportFoundPet = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { reporterName, reporterContact, message, location } = req.body
    const lostPetId = req.params.id

    const lostPet = await LostPet.findById(lostPetId).populate("owner", "name email").populate("pet", "name")

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: "Lost pet post not found",
      })
    }

    if (lostPet.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This lost pet post is no longer active",
      })
    }

   
    const images = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: file.path,
          publicId: file.filename,
        })
      })
    }

    const foundReport = {
      reporterName,
      reporterContact,
      message: message || "",
      location,
      images,
      reportedAt: new Date(),
    }

    lostPet.foundReports.push(foundReport)

    // Mark alert as sent
    lostPet.alertSent = true

    await lostPet.save()

    // Send email notification to pet owner
    try {
      await emailService.sendFoundPetNotification({
        ownerEmail: lostPet.owner.email,
        ownerName: lostPet.owner.name,
        petName: lostPet.pet.name,
        finderName: reporterName,
        finderContact: reporterContact,
        message: message,
        location: location,
      })
      console.log("Found pet notification email sent successfully")
    } catch (emailError) {
      console.error("Failed to send found pet notification:", emailError)
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Found pet report submitted successfully! Owner has been notified via email.",
      data: foundReport,
    })
  } catch (error) {
    console.error("Report found pet error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit found pet report",
    })
  }
}


exports.getUserLostPets = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { status } = req.query
    const filter = { owner: req.userData.userId }

    if (status && status !== "all") {
      filter.status = status
    }

    const lostPets = await LostPet.find(filter).populate("pet", "name").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: lostPets.length,
      data: lostPets,
    })
  } catch (error) {
    console.error("Get user lost pets error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user lost pets",
    })
  }
}


exports.updateLostPetStatus = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { status } = req.body
    const lostPetId = req.params.id

    if (!["active", "cancelled", "found"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: active, cancelled, or found",
      })
    }

    const lostPet = await LostPet.findById(lostPetId)
    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: "Lost pet post not found",
      })
    }

    
    if (lostPet.owner.toString() !== req.userData.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own lost pet posts",
      })
    }

    lostPet.status = status
    await lostPet.save()

    res.status(200).json({
      success: true,
      message: `Lost pet post status updated to ${status}`,
      data: lostPet,
    })
  } catch (error) {
    console.error("Update lost pet status error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update lost pet status",
    })
  }
}
