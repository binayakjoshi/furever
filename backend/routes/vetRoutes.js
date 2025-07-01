const express = require("express")
const { body } = require("express-validator")
const authenticate = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const veterinarianController = require("../controllers/veterinarianController")

const {
  createVeterinarianValidation,
  updateVeterinarianValidation,
} = require("../middleware/veterinarianValidation")

const router = express.Router()


router.get("/", veterinarianController.getAllVeterinarians)

/
router.get("/:id", veterinarianController.getVeterinarianById)

// Get veterinarians by specialization
router.get("/specialization/:specialization", veterinarianController.getVeterinariansBySpecialization)

// Search veterinarians by location
router.get("/search/location", veterinarianController.searchVeterinariansByLocation)

//for logged in users only
router.use(authenticate)


router.post(
  "/profile",
  imageUpload.single("profileImage"),
  createVeterinarianValidation,
  veterinarianController.createVeterinarianProfile,
)

router.get("/my-profile", veterinarianController.getMyVeterinarianProfile)


router.put(
  "/profile",
  imageUpload.single("profileImage"),
  updateVeterinarianValidation,
  veterinarianController.updateVeterinarianProfile,
)


router.delete("/profile", veterinarianController.deleteVeterinarianProfile)



module.exports = router
