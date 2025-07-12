const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const petController = require("../controllers/petController")
const { authenticate, signup, login, logout, getCurrentUser } = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const {
  signupValidation,
  loginValidation,
  updateUserValidation,
  updatePasswordValidation,
} = require("../middleware/userValidation")

// Authentication routes (no middleware needed)
router.post("/signup", imageUpload.single("profileImage"), signupValidation, signup)
router.post("/login", loginValidation, login)
router.post("/logout", logout)
router.get("/me", authenticate, getCurrentUser)

// Apply authentication middleware to remaining routes
router.use(authenticate)

// User profile management routes
router.put("/me", imageUpload.single("profileImage"), updateUserValidation, userController.updateCurrentUser)

// Update password
router.put("/me/password", updatePasswordValidation, userController.updatePassword)

// Admin routes for managing users
router.get("/:id", userController.getUserById)

//wrapper frontend bata fetch garya syntax namilya vyaera added
router.get("/:id/pets", (req, res, next) => {
  req.params.userId = req.params.id;
  petController.getPetsByUserId(req, res, next);
})
router.put("/:id", imageUpload.single("profileImage"), updateUserValidation, userController.updateCurrentUser)
router.delete("/:id", userController.deleteUser)

module.exports = router
