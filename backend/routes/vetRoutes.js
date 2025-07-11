const express = require("express")
const { body } = require("express-validator")
const authenticate = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const veterinarianController = require("../controllers/vetController")
const geocodingService = require("../services/geocodingService")

const {
  createVeterinarianValidation,
  updateVeterinarianValidation,
} = require("../middleware/veterinarianValidation")

const router = express.Router()

router.post("/",geocodingService.getNearbyVets);
router.get("/", veterinarianController.getAllVeterinarians)


router.get("/:id", veterinarianController.getVeterinarianById)


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