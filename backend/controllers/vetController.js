const Veterinarian = require("../models/vetModel")
const { validationResult } = require("express-validator")

// Create a new veterinarian profile
exports.createVeterinarianProfile = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const {
      name,
      email,
      password,
      degree,
      experience,
      licenseNumber,
      availability,
    } = req.body

    // Check if veterinarian already exists
    let veterinarian = await Veterinarian.findOne({ email })
    if (veterinarian) {
      return res.status(400).json({ message: "Veterinarian already exists" })
    }

    const vetData = {
      name,
      email,
      password,
      degree,
      experience,
      licenseNumber,
      availability,
    }

    // Handle profile image upload
    if (req.file) {
      vetData.profileImage = {
        url: req.file.path,
        publicId: req.file.filename
      }
    }

    veterinarian = new Veterinarian(vetData)

    await veterinarian.save()

    // Exclude password from response
    const veterinarianResponse = await Veterinarian.findById(veterinarian._id).select("-password")
    res.status(201).json({ message: "Veterinarian profile created successfully", veterinarian: veterinarianResponse })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
}

// Get all veterinarians
exports.getAllVeterinarians = async (req, res) => {
  try {
    const veterinarians = await Veterinarian.find().select("-licenseNumber","-password") // Exclude licenseNumber and password for privacy
    res.json(veterinarians)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

// Get veterinarian by ID
exports.getVeterinarianById = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findById(req.params.id).select("-licenseNumber","-password") // Exclude licenseNumber and password for privacy
    if (!veterinarian) {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }
    res.json(veterinarian)
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }
    res.status(500).send("Server Error")
  }
}

// Update veterinarian profile
exports.updateVeterinarianProfile = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const {
      name,
      degree,
      experience,
      availability,
    } = req.body

    // Build veterinarian object
    const vetFields = {}
    if (name) vetFields.name = name
    if (degree) vetFields.degree = degree
    if (experience) vetFields.experience = experience
    if (availability) vetFields.availability = availability

    // Handle profile image upload
    if (req.file) {
      vetFields.profileImage = {
        url: req.file.path,
        publicId: req.file.filename
      }
    }

    let veterinarian = await Veterinarian.findById(req.params.id)

    if (!veterinarian) {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }

    veterinarian = await Veterinarian.findByIdAndUpdate(req.params.id, { $set: vetFields }, { new: true }).select("-password")

    res.json(veterinarian)
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }
    res.status(500).send("Server Error")
  }
}

// Delete veterinarian
exports.deleteVeterinarianProfile = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findById(req.params.id)

    if (!veterinarian) {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }

    await Veterinarian.findByIdAndDelete(req.params.id)

    res.json({ msg: "Veterinarian deleted" })
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }
    res.status(500).send("Server Error")
  }
}

exports.getMyVeterinarianProfile = async (req, res) => {
  try {
    // Ensure user is authenticated and userData is available
    if (!req.userData || !req.userData.email) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userEmail = req.userData.email
    const veterinarian = await Veterinarian.findOne({ email: userEmail }).select("-password")
    
    if (!veterinarian) {
      return res.status(404).json({ msg: "Veterinarian profile not found" })
    }
    
    res.json(veterinarian)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

// Toggle veterinarian availability for appointments
exports.toggleAppointmentAvailability = async (req, res) => {
  try {
    if (!req.userData || !req.userData.email) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userEmail = req.userData.email
    const { isAvailable } = req.body

    const veterinarian = await Veterinarian.findOne({ email: userEmail })
    
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian profile not found"
      })
    }

    // Toggle availability
    if (isAvailable !== undefined) {
      veterinarian.isAvailableForAppointments = isAvailable
    } else {
      veterinarian.isAvailableForAppointments = !veterinarian.isAvailableForAppointments
    }

    await veterinarian.save()

    res.status(200).json({
      success: true,
      message: `Appointment availability ${veterinarian.isAvailableForAppointments ? 'enabled' : 'disabled'} successfully`,
      data: {
        isAvailableForAppointments: veterinarian.isAvailableForAppointments
      }
    })
  } catch (error) {
    console.error("Toggle appointment availability error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update appointment availability",
    })
  }
}

