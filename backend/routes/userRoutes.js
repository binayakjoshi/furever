const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const authenticate = require("../middleware/authentication")
const { body } = require("express-validator")
const imageUpload = require("../middleware/imageUpload")
const {
  createUserValidation,
  updateUserValidation,
  updatePasswordValidation,
  loginValidation,
} = require("../middleware/userValidation")

// Enhanced login validation with role
const enhancedLoginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  ]

// Public routes
router.post("/signup", imageUpload.single("profileImage"), createUserValidation, userController.signup)
router.post("/login", enhancedLoginValidation, userController.login)

// Protected routes
router.use(authenticate)

router.post("/logout", userController.logout)
router.get("/me", userController.getCurrentUser)

// Update current user's profile
router.put("/me", imageUpload.single("profileImage"), updateUserValidation, userController.updateCurrentUser)

// Update password
router.put("/me/password", updatePasswordValidation, userController.updatePassword)

// Location routes
router.put(
  "/location",
  [
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
    body("address").optional().isString().withMessage("Address must be a string"),
  ],
  userController.updateUserLocation,
)

router.put(
  "/location/address",
  [body("address").notEmpty().withMessage("Address is required")],
  userController.updateUserLocationByAddress,
)

router.get("/nearby-vets", userController.findNearbyVets)

// Admin routes for managing users
router.get("/:id", userController.getUserById)
router.put("/:id", imageUpload.single("profileImage"), updateUserValidation, userController.updateCurrentUser)
router.delete("/:id", userController.deleteUser)

module.exports = router
