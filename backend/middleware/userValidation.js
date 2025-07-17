const { body } = require("express-validator")

const signupValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("role").optional().isIn(["pet-owner", "vet"]).withMessage("Role must be either pet-owner or vet"),
  body("phone").optional().isMobilePhone().withMessage("Please enter a valid phone number"),
  body("address").optional().trim(),
  body("dob").optional().isISO8601().withMessage("Please enter a valid date of birth"),
  
  // Vet-specific validations
  body("degree").if(body("role").equals("vet")).notEmpty().withMessage("Degree is required for veterinarians"),
  body("licenseNumber").if(body("role").equals("vet")).notEmpty().withMessage("License number is required for veterinarians"),
  body("experience").if(body("role").equals("vet")).optional().isNumeric().withMessage("Experience must be a number"),
]

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
]

const createUserValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("email").isEmail().withMessage("Please provide a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["pet-owner", "vet"])
    .withMessage("Role must be either 'pet-owner' or 'vet'"),
  body("dob").optional().isISO8601().withMessage("Please provide a valid date of birth"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("address")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters")
    .trim(),
]

const updateUserValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .trim(),
  body("dob").optional().isISO8601().withMessage("Please provide a valid date of birth"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("address")
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters")
    .trim(),
]

const updatePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
]

module.exports = {
  signupValidation,
  loginValidation,
  createUserValidation,
  updateUserValidation,
  updatePasswordValidation,
}
