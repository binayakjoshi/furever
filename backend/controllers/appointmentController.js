const Veterinarian = require("../models/vetModel")
const HttpError = require("../models/http-error")
const { validationResult } = require("express-validator")

exports.expressInterest = async (req, res, next) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { vetId} = req.params;
    
    const veterinarian = await Veterinarian.findById(vetId);
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian not found",
      })
    }

    if (!veterinarian.isAvailableForAppointments) {
      return res.status(400).json({
        success: false,
        message: "This veterinarian is currently not accepting appointments",
      })
    }

    
    const existingInterest = veterinarian.interestedUsers.find(
      interest => interest.user.toString() === req.userData.userId
    )

    if (existingInterest) {
      return res.status(409).json({
        success: false,
        message: "You have already expressed interest in this veterinarian",
      })
    }

    veterinarian.interestedUsers.push({
      user: req.userData.userId,
      status: "appointment_requested",
      dateExpressed: new Date(),
    })
    
    await veterinarian.save()

    await veterinarian.populate('interestedUsers.user', 'name email phone')
    const newInterest = veterinarian.interestedUsers[veterinarian.interestedUsers.length - 1]

    res.status(201).json({
      success: true,
      message: "Interest expressed successfully! The veterinarian will contact you using your phone number to discuss appointment details.",
      data: newInterest,
    })
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.code).json({
        success: false,
        message: error.message,
      })
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to express interest",
    })
  }
}


exports.removeInterest = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { veterinarianId } = req.params
    const userId = req.userData.userId

    const veterinarian = await Veterinarian.findById(veterinarianId)
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian not found",
      })
    }

    const interestIndex = veterinarian.interestedUsers.findIndex(
      interest => interest.user.toString() === userId
    )

    if (interestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No interest found to remove",
      })
    }

    veterinarian.interestedUsers.splice(interestIndex, 1)
    await veterinarian.save()

    res.status(200).json({
      success: true,
      message: "Interest removed successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove interest",
    })
  }
}


exports.updateInterestStatus = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { userId, status } = req.body
    const veterinarianId = req.userData.userId

    
    const validStatuses = ["appointment_requested", "appointment_confirmed", "appointment_completed"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: appointment_requested, appointment_confirmed, appointment_completed",
      })
    }

    const veterinarian = await Veterinarian.findById(veterinarianId)
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian not found",
      })
    }

    
    const interestedUser = veterinarian.interestedUsers.find(
      interest => interest.user.toString() === userId
    )

    if (!interestedUser) {
      return res.status(404).json({
        success: false,
        message: "Interested user not found",
      })
    }

    
    interestedUser.status = status
    await veterinarian.save()

    // Populate and return the updated interest in one operation
    await veterinarian.populate('interestedUsers.user', 'name email phone')
    const updatedInterest = veterinarian.interestedUsers.find(
      interest => interest.user._id.toString() === userId
    )

    res.status(200).json({
      success: true,
      message: `Interest status updated to ${status}`,
      data: updatedInterest,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update interest status",
    })
  }
}


exports.getUserAppointments = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const userId = req.userData.userId
    const { status, page = 1, limit = 10 } = req.query

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)) // Cap at 50 items per page

    
    const veterinarians = await Veterinarian.find({
      "interestedUsers.user": userId
    })
    .populate('interestedUsers.user', 'name email phone')
    .select('name email degree experience profileImage availability interestedUsers')

    
    let appointments = []
    veterinarians.forEach(vet => {
      const userInterest = vet.interestedUsers.find(
        interest => interest.user._id.toString() === userId
      )
      
      if (userInterest && (!status || status === "all" || userInterest.status === status)) {
        appointments.push({
          veterinarian: {
            _id: vet._id,
            name: vet.name,
            email: vet.email,
            degree: vet.degree,
            experience: vet.experience,
            profileImage: vet.profileImage,
            availability: vet.availability
          },
          appointment: {
            status: userInterest.status,
            dateExpressed: userInterest.dateExpressed,
            message: userInterest.message
          }
        })
      }
    })

    // Sort by date (newest first)
    appointments.sort((a, b) => new Date(b.appointment.dateExpressed) - new Date(a.appointment.dateExpressed))

    // Pagination
    const skip = (pageNum - 1) * limitNum
    const paginatedAppointments = appointments.slice(skip, skip + limitNum)

    res.status(200).json({
      success: true,
      data: paginatedAppointments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(appointments.length / limitNum),
        totalCount: appointments.length,
        hasNext: skip + paginatedAppointments.length < appointments.length,
        hasPrev: pageNum > 1,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user appointments",
    })
  }
}


exports.getInterestedUsers = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const veterinarianId = req.params.veterinarianId

    if (veterinarianId !== req.userData.userId && req.userData.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only view your own interested users",
      })
    }

    const veterinarian = await Veterinarian.findById(veterinarianId)
      .populate('interestedUsers.user', 'name email phone profileImage')

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian not found",
      })
    }

    res.status(200).json({
      success: true,
      data: veterinarian.interestedUsers,
      count: veterinarian.interestedUsers.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch interested users",
    })
  }
}

