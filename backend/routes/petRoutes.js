const express = require("express")
const router = express.Router()
const petController = require("../controllers/petController")
const imageUpload = require("../middleware/imageUpload")
const { body } = require("express-validator") // ✅ Use body instead of check

// ✅ Fixed validation - specify body location explicitly
router.post(
  "/",
  imageUpload.single("image"), // ✅ Multer middleware FIRST
  [
    body("name").not().isEmpty().withMessage("Pet name is required"),
    body("description").not().isEmpty().withMessage("Pet description is required"),
    body("dob").not().isEmpty().withMessage("Pet date of birth is required"),
    body("breed").not().isEmpty().withMessage("Pet breed is required"),
    body("user").not().isEmpty().withMessage("User ID is required"),
  ],
  petController.createPet,
)

router.get("/", petController.getAllPets)
router.get("/user/:userId", petController.getAllPets)
router.get("/:id", petController.getPetById)
router.put("/:id", imageUpload.single("image"), petController.updatePet)
router.delete("/:id", petController.deletePet)

module.exports = router
