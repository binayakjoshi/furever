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


router.post("/signup", imageUpload.single("profileImage"), signupValidation, signup)
router.post("/login", loginValidation, login)
router.post("/logout", logout)
router.get("/me", authenticate, getCurrentUser)


router.use(authenticate)

router.put("/me", imageUpload.single("profileImage"), updateUserValidation, userController.updateCurrentUser)


router.put("/me/password", updatePasswordValidation, userController.updatePassword)


router.get("/:id", userController.getUserById)

//wrapper frontend bata fetch garya syntax namilya vyaera added
router.get("/:id/pets", (req, res, next) => {
  req.params.userId = req.params.id;
  petController.getPetsByUserId(req, res, next);
})
router.put("/:id", imageUpload.single("profileImage"), updateUserValidation, userController.updateCurrentUser)
router.delete("/:id", userController.deleteUser)

module.exports = router
