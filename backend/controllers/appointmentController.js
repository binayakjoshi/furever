const Appointment = require("../models/appointmentModel")
const Veterinarian = require("../models/vetModel")
const Pet = require("../models/petModel")
const HttpError = require("../models/http-error")
const { validationResult } = require("express-validator")

// Create appointment request
exports.createAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    // Authentication check
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const { veterinarianId, petId, reason, urgency } = req.body

    // Verify veterinarian exists and is available for appointments
    const veterinarian = await Veterinarian.findById(veterinarianId)
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

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, owner: req.userData.userId })
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found or you don't have permission to book appointment for this pet",
      })
    }

    // Check if user already has a pending appointment with this vet
    const existingAppointment = await Appointment.findOne({
      user: req.userData.userId,
      veterinarian: veterinarianId,
      status: "pending"
    })

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending appointment request with this veterinarian",
      })
    }

    const appointment = new Appointment({
      user: req.userData.userId,
      veterinarian: veterinarianId,
      pet: petId,
      reason,
      urgency: urgency || "medium",
      status: "pending", 
    })

    // Save appointment
    await appointment.save()

    await appointment.populate([
      { path: "user", select: "name email phone" },
      { path: "veterinarian", select: "name email" },
      { path: "pet", select: "name breed age petType" },
    ])

    res.status(201).json({
      success: true,
      message: "Appointment request sent successfully. The veterinarian will contact you using your phone number.",
      data: appointment,
    })
  } catch (error) {
    console.error("Create appointment error:", error)
    if (error instanceof HttpError) {
      return res.status(error.code).json({
        success: false,
        message: error.message,
      })
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create appointment request",
    })
  }
}

// Get all appointments (public)
exports.getAppointments = async (req, res) => {
  try {
    const { status = "pending", veterinarianId, userId, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const filter = {}
    if (status && status !== "all") {
      filter.status = status
    }
    if (veterinarianId) {
      filter.veterinarian = veterinarianId
    }
    if (userId) {
      filter.user = userId
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    const appointments = await Appointment.find(filter)
      .populate([
        { path: "user", select: "name email phone" },
        { path: "veterinarian", select: "name email" },
        { path: "pet", select: "name breed age petType" },
      ])
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    const totalCount = await Appointment.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
        totalCount,
        hasNext: skip + appointments.length < totalCount,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Get appointments error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointments",
    })
  }
}

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate([
      { path: "user", select: "name email phone" },
      { path: "veterinarian", select: "name email" },
      { path: "pet", select: "name breed age petType" },
    ])

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      })
    }

    res.status(200).json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error("Get appointment by ID error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointment",
    })
  }
}

// Get user's appointments
exports.getUserAppointments = async (req, res) => {
  try {
    // Authentication check 
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userId = req.params.userId || req.userData.userId
    const { status } = req.query

    const filter = { user: userId }
    if (status && status !== "all") {
      filter.status = status
    }

    const appointments = await Appointment.find(filter)
      .populate([
        { path: "veterinarian", select: "name email" },
        { path: "pet", select: "name breed age petType" },
      ])
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    })
  } catch (error) {
    console.error("Get user appointments error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user appointments",
    })
  }
}

// Get veterinarian's appointment requests (people who want appointments with them)
exports.getVeterinarianAppointments = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const veterinarianId = req.params.veterinarianId || req.userData.userId
    const { status } = req.query

    // Check if user is requesting their own appointments or has permission
    if (veterinarianId !== req.userData.userId && req.userData.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only view your own appointment requests",
      })
    }

    const filter = { veterinarian: veterinarianId }

    if (status && status !== "all") {
      filter.status = status
    }

    const appointments = await Appointment.find(filter)
      .populate([
        { path: "user", select: "name email phone" },
        { path: "pet", select: "name breed age petType" },
      ])
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
      message: "Contact users via their phone numbers to discuss appointment details, timing, and costs.",
    })
  } catch (error) {
    console.error("Get veterinarian appointments error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch appointment requests",
    })
  }
}

// Update appointment status (mainly for vets to confirm/reject)
exports.updateAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const appointmentId = req.params.id;
    const userId = req.userData.userId;
    const { reason, urgency, status } = req.body;

    // Find the appointment 
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check permissions - user can update their own appointment, vet can update appointments with them
    const isOwner = appointment.user.toString() === userId
    const isVet = appointment.veterinarian.toString() === userId
    
    if (!isOwner && !isVet) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this appointment",
      })
    }

    // Cannot update completed appointments
    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a completed appointment",
      });
    }

    const updateData = {};

    // Users can update reason and urgency (only if pending)
    if (isOwner && appointment.status === "pending") {
      if (reason !== undefined) updateData.reason = reason;
      if (urgency !== undefined) updateData.urgency = urgency;
    }

    // Vets can update status
    if (isVet) {
      if (status !== undefined) updateData.status = status;
    }

    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate([
      { path: "user", select: "name email phone" },
      { path: "veterinarian", select: "name email" },
      { path: "pet", select: "name breed age petType" },
    ]);

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });

  } catch (error) {
    console.error("Update appointment error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error instanceof HttpError) {
      return res.status(error.code).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update appointment",
    });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      })
    }

    if (appointment.user.toString() !== req.userData.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own appointment requests",
      })
    }

    await Appointment.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Appointment request deleted successfully",
    })
  } catch (error) {
    console.error("Delete appointment error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete appointment request",
    })
  }
}

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    if (!req.userData || !req.userData.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const appointmentId = req.params.id
    const userId = req.userData.userId

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      })
    }

    // Check permissions
    const isOwner = appointment.user.toString() === userId
    const isVet = appointment.veterinarian.toString() === userId
    
    if (!isOwner && !isVet) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to cancel this appointment",
      })
    }

    // Check if appointment can be cancelled
    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed or already cancelled appointment",
      })
    }

    appointment.status = "cancelled"
    await appointment.save()

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    })
  } catch (error) {
    console.error("Cancel appointment error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel appointment",
    })
  }
}
