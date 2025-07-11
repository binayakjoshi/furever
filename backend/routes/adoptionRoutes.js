const express = require("express")
const { body } = require("express-validator")
const authenticate = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const adoptionController = require("../controllers/adoptionController")
const { createAdoptionValidation, updateAdoptionValidation } = require("../middleware/adoptionValidation")

const router = express.Router()

// Public routes (no authentication required for browsing)
router.get("/", adoptionController.getAdoptionPosts)
router.get("/:id", adoptionController.getAdoptionPostById)

// Protected routes (authentication required)
router.use(authenticate)

// Create adoption post
router.post("/", imageUpload.single("image"), createAdoptionValidation, adoptionController.createAdoptionPost)

// Get available adoption posts (excluding user's own posts)
router.get("/available", adoptionController.getAvailableAdoptionPosts)

// Get user's own adoption posts
router.get("/my-posts", adoptionController.getAdoptionPostsByCreator)

// Get adoption posts by specific creator
router.get("/creator/:creatorId", adoptionController.getAdoptionPostsByCreator)

// Update adoption post
router.put("/:id", imageUpload.single("image"), updateAdoptionValidation, adoptionController.updateAdoptionPost)

// Delete adoption post
router.delete("/:id", adoptionController.deleteAdoptionPost)

// Show interest in adoption post
router.post(
  "/:id/interest",
  [body("message").optional().isLength({ max: 300 }).withMessage("Interest message cannot exceed 300 characters")],
  adoptionController.showInterest,
)

// Remove interest from adoption post
router.delete("/:id/interest", adoptionController.removeInterest)

// Get interested users for adoption post (creator only)
router.get("/:id/interested-users", adoptionController.getInterestedUsers)

module.exports = router
