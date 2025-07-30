const express = require("express")
const { body } = require("express-validator")
const { authenticate } = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const adoptionController = require("../controllers/adoptionController")
const { createAdoptionValidation, updateAdoptionValidation } = require("../middleware/adoptionValidation")

const router = express.Router()

// Public
router.get("/", adoptionController.getAdoptionPosts)


router.use(authenticate)

// fix routing 
router.get("/available", adoptionController.getAvailableAdoptionPosts)
router.get("/creator/:creatorId", adoptionController.getAdoptionPostsByCreator)


router.post("/", imageUpload.single("image"), createAdoptionValidation, adoptionController.createAdoptionPost)

// fix routing
router.post(
  "/:id/interest",
  [body("message").optional().isLength({ max: 300 }).withMessage("Interest message cannot exceed 300 characters")],
  adoptionController.showInterest,
)
router.delete("/:id/interest", adoptionController.removeInterest)
router.get("/:id/interested-users", adoptionController.getInterestedUsers)

// :/id at last
router.get("/:id",adoptionController.getAdoptionPostById)
router.put("/:id", imageUpload.single("image"), updateAdoptionValidation, adoptionController.updateAdoptionPost)
router.delete("/:id", adoptionController.deleteAdoptionPost)

module.exports = router
