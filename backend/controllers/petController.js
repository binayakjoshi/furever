const Pet = require("../models/petModel")

// Create a new pet
exports.createPet = async (req, res) => {
  try {
    const newPet = await Pet.create(req.body)
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

//get pets for a user (a user can have multiple pets)
exports.getAllPets = async (req, res) => {
  try {
    
    const userId = req.query.userId || req.params.userId

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch pets",
      })
    }

    const pets = await Pet.find({ user: userId })

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
