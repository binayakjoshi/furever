const express = require("express")
const router = express.Router()
const lostPetController = require("../controllers/lostPetController")
const { authenticate } = require("../middleware/authentication")
const lostPetValidation = require("../middleware/lostPetValidation")

const imageUpload = require("../middleware/imageUpload")


router.get("/", lostPetController.getAllLostPets)
router.get("/:id", lostPetController.getLostPetById)

router.use(authenticate)

router.post(
  "/:id/found",
  imageUpload.array("images", 5),
  // lostPetValidation.reportFoundPetValidation,
  lostPetController.reportFoundPet,
)

router.post("/", imageUpload.single("image"), lostPetValidation.createLostPetValidation, lostPetController.createLostPet)
router.put(
  "/:id",
  imageUpload.single('image'),
  lostPetValidation.updateLostPetValidation,
  lostPetController.updateLostPet,
)
router.delete("/:id", lostPetController.deleteLostPet)
router.get("/user/my-posts", lostPetController.getUserLostPets)
router.patch("/:id/status", lostPetController.updateLostPetStatus)

module.exports = router
