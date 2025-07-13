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


router.post("/", geocodingService.getNearbyVets)
router.get("/", veterinarianController.getAllVeterinarians)


router.use(authenticate)

// route fix gare yeta ni
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

// last ma lage
router.get("/:id", veterinarianController.getVeterinarianById)

module.exports = router