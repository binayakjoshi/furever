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


router.post("/nearby", geocodingService.getNearbyVets)
router.get("/", veterinarianController.getAllVeterinarians)

router.use(authenticate)


router.get("/my-profile", veterinarianController.getMyVeterinarianProfile)


router.post(
  "/profile",
  imageUpload.single("profileImage"),
  createVeterinarianValidation,
  veterinarianController.createVeterinarianProfile,
)


router.put(
  "/profile",
  imageUpload.single("profileImage"),
  updateVeterinarianValidation,
  veterinarianController.updateVeterinarianProfile,
)


router.delete("/profile", veterinarianController.deleteVeterinarianProfile)


router.patch("/appointment-availability", veterinarianController.toggleAppointmentAvailability)


router.get("/:id", veterinarianController.getVeterinarianById)

module.exports = router