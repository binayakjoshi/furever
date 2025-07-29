const express = require("express")
const router = express.Router()
const lostPetController = require("../controllers/lostPetController")
const { authenticate } = require("../middleware/authentication")
const lostPetValidation = require("../middleware/lostPetValidation")


const multer = require("multer")
const { createStorage } = require("../config/cloudinary")

const upload = multer({ storage: createStorage("lost-pets") })

router.get("/", lostPetController.getAllLostPets)
router.get("/:id", lostPetController.getLostPetById)
router.post(
  "/:id/found",
  upload.array("images", 3),
  lostPetValidation.reportFoundPetValidation,
  lostPetController.reportFoundPet,
)

router.use(authenticate)

router.post("/", upload.array("images", 5), lostPetValidation.createLostPetValidation, lostPetController.createLostPet)
router.put(
  "/:id",
  upload.array("images", 3),
  lostPetValidation.updateLostPetValidation,
  lostPetController.updateLostPet,
)
router.delete("/:id", lostPetController.deleteLostPet)
router.get("/user/my-posts", lostPetController.getUserLostPets)
router.patch("/:id/status", lostPetController.updateLostPetStatus)

module.exports = router
