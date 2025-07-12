const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const petController = require("../controllers/petController")
const { authenticate, getCurrentUser } = require("../middleware/authentication")
const imageUpload = require("../middleware/imageUpload")
const {
  updateUserValidation,
  updatePasswordValidation,
} = require("../middleware/userValidation")


router.use(authenticate)


router.get("/me", getCurrentUser)


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
