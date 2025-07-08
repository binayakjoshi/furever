const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authentication"); // adjust path if needed
const { body } = require("express-validator");
const imageUpload = require("../middleware/imageUpload");
const { 
  createUserValidation, 
  updateUserValidation, 
  updatePasswordValidation, 
  loginValidation 
} = require("../middleware/userValidation");
router.post(
  "/signup",
  imageUpload.single("profileImage"),
  createUserValidation,
  userController.signup,
);

router.post(
  "/login",
  loginValidation,
  userController.login,
);

router.post("/logout", authenticate, userController.logout);
router.get("/me", authenticate, userController.getCurrentUser);

// Update current user's profile
router.put(
  "/me", 
  authenticate, 
  // imageUpload.single("profileImage"),
  updateUserValidation,
  userController.updateCurrentUser
);

// update the password if needed
router.put(
  "/me/password", 
  authenticate, 
  updatePasswordValidation,
  userController.updatePassword
);

//routes for managing users by admin
router.get("/:id", userController.getUserById);
router.put(
  "/:id", 
  authenticate,
  imageUpload.single("profileImage"),
  updateUserValidation,
  userController.updateCurrentUser
);
router.delete("/:id", authenticate, userController.deleteUser);


module.exports = router
