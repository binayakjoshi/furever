const express = require("express")
const { body } = require("express-validator")
const { authenticate } = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const veterinarianController = require("../controllers/vetController")
const geocodingService = require("../services/geocodingService")

const {
  createVeterinarianValidation,
  updateVeterinarianValidation,
} = require("../middleware/veterinarianValidation")

const router = express.Router()

// Get nearby vets from external services (OpenStreetMap)
router.post("/nearby", geocodingService.getNearbyVets)
router.get("/", veterinarianController.getAllVeterinarians)

router.use(authenticate)

// Get authenticated vet's profile
router.get("/my-profile", veterinarianController.getMyVeterinarianProfile)

// Create vet profile
router.post(
  "/profile",
  imageUpload.single("profileImage"),
  createVeterinarianValidation,
  veterinarianController.createVeterinarianProfile,
)

// Update vet profile
router.put(
  "/profile",
  imageUpload.single("profileImage"),
  updateVeterinarianValidation,
  veterinarianController.updateVeterinarianProfile,
)

// Delete vet profile
router.delete("/profile", veterinarianController.deleteVeterinarianProfile)

// Toggle appointment availability
router.patch("/appointment-availability", veterinarianController.toggleAppointmentAvailability)

// Get vet by ID
router.get("/:id", veterinarianController.getVeterinarianById)

module.exports = router