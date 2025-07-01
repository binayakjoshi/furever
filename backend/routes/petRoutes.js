const express = require("express")
const { body } = require("express-validator") 

const authenticate = require("../middleware/authentication"); // adjust path if needed

const petController = require("../controllers/petController")
const imageUpload = require("../middleware/imageUpload")

const router = express.Router()

router.use(authenticate);
router.post(
  "/",
  authenticate, // Ensure user is authenticated
  imageUpload.single("image"), [
    body("name").not().isEmpty().withMessage("Pet name is required"),
    body("description").not().isEmpty().withMessage("Pet description is required"),
    body("petType").not().isEmpty().withMessage("Pet type is required"),
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
