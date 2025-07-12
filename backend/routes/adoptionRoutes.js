const express = require("express")
const { body } = require("express-validator")
const authenticate = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const adoptionController = require("../controllers/adoptionController")
const { createAdoptionValidation, updateAdoptionValidation } = require("../middleware/adoptionValidation")

const router = express.Router()


router.get("/", adoptionController.getAdoptionPosts)


router.use(authenticate)

//problem yeta thyo /id paila thyo
router.get("/available", adoptionController.getAvailableAdoptionPosts)


router.post("/", imageUpload.single("image"), createAdoptionValidation, adoptionController.createAdoptionPost)


router.get("/:id", adoptionController.getAdoptionPostById)


router.get("/my-posts", adoptionController.getAdoptionPostsByCreator)


router.get("/creator/:creatorId", adoptionController.getAdoptionPostsByCreator)


router.put("/:id", imageUpload.single("image"), updateAdoptionValidation, adoptionController.updateAdoptionPost)


router.delete("/:id", adoptionController.deleteAdoptionPost)


router.post(
  "/:id/interest",
  [body("message").optional().isLength({ max: 300 }).withMessage("Interest message cannot exceed 300 characters")],
  adoptionController.showInterest,
)


router.delete("/:id/interest", adoptionController.removeInterest)


router.get("/:id/interested-users", adoptionController.getInterestedUsers)

module.exports = router
