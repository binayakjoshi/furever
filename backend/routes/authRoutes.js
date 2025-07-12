const express = require("express")
const passport = require("../config/passport")
const { body } = require("express-validator")
const imageUpload = require("../middleware/imageUpload")
const { signup, login, logout, authenticate, getCurrentUser, sendTokenCookie } = require("../middleware/authentication")

const router = express.Router()


const signupValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("role").isIn(["pet-owner", "vet"]).withMessage("Role must be either pet-owner or vet"),
  body("phone").optional().isMobilePhone().withMessage("Please enter a valid phone number"),
  body("address").optional().trim(),
  body("dob").optional().isISO8601().withMessage("Please enter a valid date of birth"),
  
  // Vet-specific validations
  body("degree").if(body("role").equals("vet")).notEmpty().withMessage("Degree is required for veterinarians"),
  body("licenseNumber").if(body("role").equals("vet")).notEmpty().withMessage("License number is required for veterinarians"),
  body("contactInfo").if(body("role").equals("vet")).notEmpty().withMessage("Contact info is required for veterinarians"),
  body("experience").if(body("role").equals("vet")).optional().isNumeric().withMessage("Experience must be a number"),

]


const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
]


router.post("/signup", imageUpload.single("profileImage"), signupValidation, signup)
router.post("/login", loginValidation, login)
router.post("/logout", logout)

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
)

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/error`,
  }),
  (req, res) => {
    try {
      console.log("Google OAuth callback successful for user:", req.user.email)

      
      const payload = {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role || "pet-owner", //default pet-owner cause user ko lagi matra ho google login
      }
      sendTokenCookie(res, payload)

      
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/success?user=${encodeURIComponent(
          JSON.stringify({
            userId: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role || "pet-owner",
            profileImage: req.user.profileImage,
            isGoogleUser: true,
          }),
        )}`,
      )
    } catch (error) {
      console.error("Google OAuth callback error:", error)
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent("Authentication failed")}`)
    }
  },
)


router.get("/me", authenticate, getCurrentUser)


router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
    endpoints: {
      signup: "POST /auth/signup",
      login: "POST /auth/login",
      logout: "POST /auth/logout",
      me: "GET /auth/me",
      googleLogin: "GET /auth/google",
      googleCallback: "GET /auth/google/callback",
    },
  })
})

module.exports = router
