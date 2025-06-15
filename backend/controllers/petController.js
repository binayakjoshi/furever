const Pet = require("../models/petModel")
const User = require("../models/userModel") // Make sure this line exists

// Create a new pet
exports.createPet = async (req, res) => {
  try {
    // Create the pet
    const newPet = await Pet.create(req.body)

    // Add pet to user's pets array
    await User.findByIdAndUpdate(req.body.user, { $push: { pets: newPet._id } }, { new: true })

    res.status(201).json({
      success: true,
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
    // Get userId from request query or params
    const userId = req.query.userId || req.params.userId

    let pets

    if (userId) {
      // Get pets for specific user
      pets = await Pet.find({ user: userId })
    } else {
      // Get all pets if no userId provided
      pets = await Pet.find()
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
    const pet = await Pet.findById(req.params.id)

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

// Update a pet
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

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
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Delete a pet
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id)

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      })
    }

    // Remove pet from user's pets array
    await User.findByIdAndUpdate(pet.user, { $pull: { pets: req.params.id } }, { new: true })

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
