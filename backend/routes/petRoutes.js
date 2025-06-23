const express = require("express")
const router = express.Router()
const petController = require("../controllers/petController")
const imageUpload = require("../middleware/imageUpload")
const { body } = require("express-validator") 
const authenticate = require("../middleware/authentication") 

router.post(
  "/",
  authenticate, // Ensure user is authenticated
  imageUpload.single("image"), [
    body("name").not().isEmpty().withMessage("Pet name is required"),
    body("description").not().isEmpty().withMessage("Pet description is required"),
    body("dob").not().isEmpty().withMessage("Pet date of birth is required"),
    body("breed").not().isEmpty().withMessage("Pet breed is required"),
  ],
  petController.createPet,
)

router.get("/user/:userId", petController.getPetsByUserId)
router.get("/:id", petController.getPetById)
router.put("/:id", imageUpload.single("image"), petController.updatePet)
router.delete("/:id", petController.deletePet)

module.exports = router
