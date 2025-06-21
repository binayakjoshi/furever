const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authentication"); // adjust path if needed
const { body } = require("express-validator");

router.post(
  "/signup",
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["user", "vet"]).withMessage("Role must be either user or vet"),
  ],
  userController.signup,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").not().isEmpty().withMessage("Password is required"),
  ],
  userController.login,
);
router.post("/logout", authenticate, userController.logout);
router.get("/me", authenticate, userController.getCurrentUser);

<<<<<<< HEAD
module.exports = router;
=======
router.get("/:id", userController.getUserById)
router.put("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)


module.exports = router
>>>>>>> db9e84567c3230b989223497b1aca12ab61df3fd
