const express = require("express")
const { body } = require("express-validator")
const authenticate = require("../middleware/authentication")
const adoptionController = require("../controllers/adoptionController")
const { createAdoptionValidation, updateAdoptionValidation } = require("../middleware/adoptionValidation")

const router = express.Router()

router.use(authenticate)

// Routes

router.post("/", createAdoptionValidation, adoptionController.createAdoptionPost)

router.get("/", adoptionController.getAdoptionPosts)

router.get("/my-posts", adoptionController.getAdoptionPostsByCreator)
router.get("/creator/:creatorId", adoptionController.getAdoptionPostsByCreator)

router.get("/:id", adoptionController.getAdoptionPostById)


router.put("/:id", updateAdoptionValidation, adoptionController.updateAdoptionPost)


router.delete("/:id", adoptionController.deleteAdoptionPost)


router.post(
  "/:id/interest",
  [body("message").optional().isLength({ max: 300 }).withMessage("Interest message cannot exceed 300 characters")],
  adoptionController.showInterest,
)

router.delete("/:id/interest", adoptionController.removeInterest)

// Get interested users for adoption post (creator only)
router.get("/:id/interested-users", adoptionController.getInterestedUsers)

module.exports = router
