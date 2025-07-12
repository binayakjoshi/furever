const Veterinarian = require("../models/vetModel")
const { validationResult } = require("express-validator")
const GeocodingService = require("../services/geocodingService")

// Create a new veterinarian profile
exports.createVeterinarianProfile = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      yearsOfExperience,
      education,
      licenseNumber,
      about,
      availability,
    } = req.body

    // Check if veterinarian already exists
    let veterinarian = await Veterinarian.findOne({ email })
    if (veterinarian) {
      return res.status(400).json({ message: "Veterinarian already exists" })
    }

    const vetData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      yearsOfExperience,
      education,
      licenseNumber,
      about,
      availability,
    }

    // Add geocoding for clinic address
    if (clinicAddress) {
      const coordinates = await GeocodingService.getCoordinatesFromAddress(clinicAddress)
      if (coordinates) {
        vetData.location = {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
          address: coordinates.displayName,
        }
      }
    }

    veterinarian = new Veterinarian(vetData)

    await veterinarian.save()

    res.status(201).json({ message: "Veterinarian profile created successfully", veterinarian })
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
}

// Get all veterinarians
exports.getAllVeterinarians = async (req, res) => {
  try {
    const veterinarians = await Veterinarian.find().select("-licenseNumber") // Exclude licenseNumber for privacy
    res.json(veterinarians)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

// Get veterinarian by ID
exports.getVeterinarianById = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findById(req.params.id).select("-licenseNumber") // Exclude licenseNumber for privacy
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
      firstName,
      lastName,
      phoneNumber,
      yearsOfExperience,
      education,
      about,
      availability,
      status,
    } = req.body

    // Build veterinarian object
    const vetFields = {}
    if (firstName) vetFields.firstName = firstName
    if (lastName) vetFields.lastName = lastName
    if (phoneNumber) vetFields.phoneNumber = phoneNumber
    if (yearsOfExperience) vetFields.yearsOfExperience = yearsOfExperience
    if (education) vetFields.education = education
    if (about) vetFields.about = about
    if (availability) vetFields.availability = availability
    if (status) vetFields.status = status


    let veterinarian = await Veterinarian.findById(req.params.id)

    if (!veterinarian) {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }

    veterinarian = await Veterinarian.findByIdAndUpdate(req.params.id, { $set: vetFields }, { new: true })

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

    await veterinarian.remove()

    res.json({ msg: "Veterinarian deleted" })
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Veterinarian not found" })
    }
    res.status(500).send("Server Error")
  }
}

// // Find nearby veterinarians by coordinates
// exports.findNearbyVeterinarians = async (req, res) => {
//   try {
//     const { latitude, longitude, radius = 25, limit = 6, specialization } = req.query

//     if (!latitude || !longitude) {
//       return res.status(400).json({
//         success: false,
//         message: "Latitude and longitude are required",
//       })
//     }

//     const lat = Number.parseFloat(latitude)
//     const lng = Number.parseFloat(longitude)

//     if (isNaN(lat) || isNaN(lng)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid latitude or longitude",
//       })
//     }

//     // Build query
//     const query = {
//       status: "active",
//       location: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [lng, lat],
//           },
//           $maxDistance: radius * 1000, // Convert km to meters
//         },
//       },
//     }

//     if (specialization) {
//       query.specialization = { $in: [specialization] }
//     }

//     const veterinarians = await Veterinarian.find(query).select("-licenseNumber").limit(Number.parseInt(limit))

//     // Calculate distances and add to response
//     const vetsWithDistance = veterinarians.map((vet) => {
//       const vetObj = vet.toObject()
//       if (vet.location && vet.location.coordinates) {
//         const distance = GeocodingService.calculateDistance(
//           lat,
//           lng,
//           vet.location.coordinates[1], // latitude
//           vet.location.coordinates[0], // longitude
//         )
//         vetObj.distance = Math.round(distance * 100) / 100 // Round to 2 decimal places
//       }
//       return vetObj
//     })

//     res.status(200).json({
//       success: true,
//       message: "Nearby veterinarians found",
//       data: vetsWithDistance,
//       searchLocation: {
//         latitude: lat,
//         longitude: lng,
//       },
//       searchRadius: radius,
//     })
//   } catch (error) {
//     console.error("Find nearby veterinarians error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Failed to find nearby veterinarians",
//     })
//   }
// }

// Update veterinarian location
exports.updateVeterinarianLocation = async (req, res) => {
  try {
    // Ensure user is authenticated and userData is available
    if (!req.userData || !req.userData.email) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }
    
    const userEmail = req.userData.email
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

    const veterinarian = await Veterinarian.findOneAndUpdate(
      { email: userEmail },
      {
        location: {
          type: "Point",
          coordinates: [lng, lat], // MongoDB expects [longitude, latitude]
          address: locationAddress,
        },
      },
      { new: true, runValidators: true },
    )

    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian profile not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        location: veterinarian.location,
      },
    })
  } catch (error) {
    console.error("Update veterinarian location error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update location",
    })
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
    const veterinarian = await Veterinarian.findOne({ email: userEmail })
    
    if (!veterinarian) {
      return res.status(404).json({ msg: "Veterinarian profile not found" })
    }
    
    res.json(veterinarian)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
}

