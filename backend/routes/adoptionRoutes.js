const express = require("express")
const { body } = require("express-validator")
const authenticate = require("../middleware/authentication")
const adoptionController = require("../controllers/adoptionController")

const router = express.Router()


router.use(authenticate)


const createAdoptionValidation = [
  body("petId").notEmpty().withMessage("Pet ID is required").isMongoId().withMessage("Invalid pet ID format"),
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("contactInfo.phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("contactInfo.email").optional().isEmail().withMessage("Please provide a valid email address"),
]


const updateAdoptionValidation = [
  body("title").optional().isLength({ min: 5, max: 100 }).withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .optional()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("location")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("status")
    .optional()
    .isIn(["active", "pending", "adopted", "cancelled"])
    .withMessage("Status must be active, pending, adopted, or cancelled"),
]

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
