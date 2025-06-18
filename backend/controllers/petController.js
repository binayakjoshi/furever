const Pet = require("../models/petModel")
const User = require("../models/userModel")
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary")

// Create a new pet 
exports.createPet = async (req, res) => {
  try {
    const { image, ...petData } = req.body

    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Pet image is required. Cannot create pet without an image.",
      })
    }

    // Validate required fields
    if (!petData.name) {
      return res.status(400).json({
        success: false,
        message: "Pet name is required.",
      })
    }

    if (!petData.description || petData.description.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Pet description is required and must be at least 6 characters long.",
      })
    }

    if (!petData.breed) {
      return res.status(400).json({
        success: false,
        message: "Pet breed is required.",
      })
    }

    if (!petData.dob) {
      return res.status(400).json({
        success: false,
        message: "Pet date of birth is required.",
      })
    }

    if (!petData.user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      })
    }

    if (!petData.nextVaccination || !petData.nextVaccination.name) {
      return res.status(400).json({
        success: false,
        message: "Next vaccination name is required.",
      })
    }

    if (!petData.nextVaccination || !petData.nextVaccination.dueDate) {
      return res.status(400).json({
        success: false,
        message: "Next vaccination due date is required.",
      })
    }

    // Validate DOB is not in future
    const dobDate = new Date(petData.dob)
    if (dobDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Pet date of birth cannot be in the future.",
      })
    }

    // Validate base64 image format
    if (!image.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Please provide a valid base64 image.",
      })
    }

    // Upload image to Cloudinary
    let uploadResult
    try {
      uploadResult = await uploadToCloudinary(image, "furever/pets")
    } catch (imageError) {
      return res.status(400).json({
        success: false,
        message: `Image upload failed: ${imageError.message}`,
      })
    }

    // Prepare pet data with image
    const newPetData = {
      ...petData,
      image: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
    }

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
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Get all pets for a specific user OR all pets
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

// Get a single pet by ID
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

// Update a pet (with optional image update)
exports.updatePet = async (req, res) => {
  try {
    const { image, ...updateData } = req.body

    // Find the existing pet
    const existingPet = await Pet.findById(req.params.id)
    if (!existingPet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    // Validate DOB if being updated
    if (updateData.dob) {
      const dobDate = new Date(updateData.dob)
      if (dobDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Pet date of birth cannot be in the future.",
        })
      }
    }

    
    if (updateData.description && updateData.description.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 6 characters long.",
      })
    }

    // Handle image update if provided
    if (image) {
      // Validate base64 image format
      if (!image.startsWith("data:image/")) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format. Please provide a valid base64 image.",
        })
      }

      try {
        // Delete old image from Cloudinary
        if (existingPet.image && existingPet.image.publicId) {
          await deleteFromCloudinary(existingPet.image.publicId)
        }

        // Upload new image
        const uploadResult = await uploadToCloudinary(image, "furever/pets")
        updateData.image = {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        }
      } catch (imageError) {
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${imageError.message}`,
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

// Delete a pet (and its image)
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    // Delete image from Cloudinary
    if (pet.image && pet.image.publicId) {
      try {
        await deleteFromCloudinary(pet.image.publicId)
      } catch (error) {
        console.log("Warning: Could not delete image from Cloudinary:", error.message)
      }
    }

    // Delete pet from database
    await Pet.findByIdAndDelete(req.params.id)

    // Remove pet from user's pets array
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


