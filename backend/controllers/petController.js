const Pet = require("../models/petModel")
const User = require("../models/userModel")
const { deleteFromCloudinary } = require("../config/cloudinary")
const { validationResult } = require("express-validator")

// Create a new pet with multer-cloudinary upload
exports.createPet = async (req, res, next) => {
  try {
    console.log("=== DETAILED DEBUG INFO ===")
    console.log("req.body:", req.body)
    console.log("req.file:", req.file)
    console.log("diseases type:", typeof req.body.diseases)
    console.log("vaccination type:", typeof req.body.vaccination)
    console.log("============================")

    // ✅ Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array())
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    // ✅ Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Pet image is required",
      })
    }

    // ✅ Get image URL from multer-cloudinary
    const imageUrl = req.file.path
    const imagePublicId = req.file.filename

    // ✅ Get pet data from form
    const petData = req.body

    // ✅ FIXED: Handle diseases - check if already array or needs parsing
    let diseases = []
    if (Array.isArray(petData.diseases)) {
      // Already an array (from JSON or proper form parsing)
      diseases = petData.diseases.filter((d) => d && d.name)
      console.log("Diseases already array:", diseases)
    } else {
      // Parse from form fields (fallback)
      console.log("Parsing diseases from form fields...")
      Object.keys(petData).forEach((key) => {
        if (key.startsWith("diseases[") && key.includes("][name]")) {
          const indexMatch = key.match(/diseases\[(\d+)\]/)
          if (indexMatch) {
            const index = Number.parseInt(indexMatch[1])
            if (!diseases[index]) diseases[index] = {}
            diseases[index].name = petData[key]
          }
        }
      })
      diseases = diseases.filter((d) => d && d.name)
    }

    // ✅ FIXED: Handle vaccination - check if already array or needs parsing
    let vaccination = []
    if (Array.isArray(petData.vaccination)) {
      // Already an array (from JSON or proper form parsing)
      vaccination = petData.vaccination.filter((v) => v && v.name)
      console.log("Vaccination already array:", vaccination)
    } else {
      // Parse from form fields (fallback)
      console.log("Parsing vaccination from form fields...")
      Object.keys(petData).forEach((key) => {
        if (key.startsWith("vaccination[")) {
          const match = key.match(/vaccination\[(\d+)\]\[(\w+)\]/)
          if (match) {
            const index = Number.parseInt(match[1])
            const field = match[2]
            if (!vaccination[index]) vaccination[index] = {}
            vaccination[index][field] = petData[key]
          }
        }
      })
      vaccination = vaccination.filter((v) => v && v.name)
    }

    // ✅ Validate DOB is not in future
    const dobDate = new Date(petData.dob)
    if (dobDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Pet date of birth cannot be in the future.",
      })
    }

    // ✅ Prepare clean pet data
    const newPetData = {
      name: petData.name,
      description: petData.description,
      breed: petData.breed,
      dob: petData.dob,
      user: petData.user,
      diseases: diseases, // ✅ Now properly populated
      vaccination: vaccination, // ✅ Now properly populated
      image: {
        url: imageUrl,
        publicId: imagePublicId,
      },
    }

    console.log("Final pet data being saved:", JSON.stringify(newPetData, null, 2))

    // Create the pet
    const newPet = await Pet.create(newPetData)

    // Add pet to user's pets array
    await User.findByIdAndUpdate(petData.user, { $push: { pets: newPet._id } }, { new: true })

    res.status(201).json({
      success: true,
      message: "Pet created successfully with image",
      data: newPet,
    })
  } catch (error) {
    console.error("Create pet error:", error)
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// ... rest of the methods remain the same
exports.getAllPets = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId
    let pets

    if (userId) {
      pets = await Pet.find({ user: userId }).populate("user", "name email")
    } else {
      pets = await Pet.find().populate("user", "name email")
    }

    res.status(200).json({
      success: true,
      count: pets.length,
      data: pets,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate("user", "name email phone")

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    res.status(200).json({
      success: true,
      data: pet,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updatePet = async (req, res) => {
  try {
    const petData = req.body
    const existingPet = await Pet.findById(req.params.id)

    if (!existingPet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    // ✅ FIXED: Handle arrays properly in update too
    let diseases = []
    let vaccination = []

    if (Array.isArray(petData.diseases)) {
      diseases = petData.diseases.filter((d) => d && d.name)
    } else {
      Object.keys(petData).forEach((key) => {
        if (key.startsWith("diseases[") && key.includes("][name]")) {
          const indexMatch = key.match(/diseases\[(\d+)\]/)
          if (indexMatch) {
            const index = Number.parseInt(indexMatch[1])
            if (!diseases[index]) diseases[index] = {}
            diseases[index].name = petData[key]
          }
        }
      })
      diseases = diseases.filter((d) => d && d.name)
    }

    if (Array.isArray(petData.vaccination)) {
      vaccination = petData.vaccination.filter((v) => v && v.name)
    } else {
      Object.keys(petData).forEach((key) => {
        if (key.startsWith("vaccination[")) {
          const match = key.match(/vaccination\[(\d+)\]\[(\w+)\]/)
          if (match) {
            const index = Number.parseInt(match[1])
            const field = match[2]
            if (!vaccination[index]) vaccination[index] = {}
            vaccination[index][field] = petData[key]
          }
        }
      })
      vaccination = vaccination.filter((v) => v && v.name)
    }

    const updateData = {
      name: petData.name || existingPet.name,
      description: petData.description || existingPet.description,
      breed: petData.breed || existingPet.breed,
      dob: petData.dob || existingPet.dob,
      user: petData.user || existingPet.user,
    }

    if (diseases.length > 0) {
      updateData.diseases = diseases
    }
    if (vaccination.length > 0) {
      updateData.vaccination = vaccination
    }

    if (req.file) {
      if (existingPet.image && existingPet.image.publicId) {
        try {
          await deleteFromCloudinary(existingPet.image.publicId)
        } catch (error) {
          console.log("Warning: Could not delete old image:", error.message)
        }
      }

      updateData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      }
    }

    if (updateData.dob) {
      const dobDate = new Date(updateData.dob)
      if (dobDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Pet date of birth cannot be in the future.",
        })
      }
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "name email")

    res.status(200).json({
      success: true,
      message: "Pet updated successfully",
      data: updatedPet,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    if (pet.image && pet.image.publicId) {
      try {
        await deleteFromCloudinary(pet.image.publicId)
      } catch (error) {
        console.log("Warning: Could not delete image from Cloudinary:", error.message)
      }
    }

    await Pet.findByIdAndDelete(req.params.id)
    await User.findByIdAndUpdate(pet.user, { $pull: { pets: req.params.id } }, { new: true })

    res.status(200).json({
      success: true,
      message: "Pet and associated image deleted successfully",
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
