const { body } = require("express-validator")

const createVeterinarianValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("degree")
    .notEmpty()
    .withMessage("Degree is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Degree must be between 2 and 200 characters"),
  body("yearsOfExperience")
    .isNumeric()
    .withMessage("Years of experience must be a number")
    .custom((value) => value >= 0 && value <= 60)
    .withMessage("Years of experience must be between 0 and 60"),
  body("age")
    .isNumeric()
    .withMessage("Age must be a number")
    .custom((value) => value >= 18 && value <= 100)
    .withMessage("Age must be between 18 and 100"),
  body("dob").isISO8601().withMessage("Please provide a valid date of birth"),
  body("licenseNumber")
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("License number must be between 1 and 50 characters"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("consultationFee")
    .optional()
    .isNumeric()
    .withMessage("Consultation fee must be a number")
    .custom((value) => value >= 0)
    .withMessage("Consultation fee cannot be negative"),
]

const updateVeterinarianValidation = [
  body("name").optional().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").optional().isEmail().withMessage("Please provide a valid email address"),
  body("degree").optional().isLength({ min: 2, max: 200 }).withMessage("Degree must be between 2 and 200 characters"),
  body("yearsOfExperience")
    .optional()
    .isNumeric()
    .withMessage("Years of experience must be a number")
    .custom((value) => value >= 0 && value <= 60)
    .withMessage("Years of experience must be between 0 and 60"),
  body("age")
    .optional()
    .isNumeric()
    .withMessage("Age must be a number")
    .custom((value) => value >= 18 && value <= 100)
    .withMessage("Age must be between 18 and 100"),
  body("dob").optional().isISO8601().withMessage("Please provide a valid date of birth"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("consultationFee")
    .optional()
    .isNumeric()
    .withMessage("Consultation fee must be a number")
    .custom((value) => value >= 0)
    .withMessage("Consultation fee cannot be negative"),
]

module.exports = {
  createVeterinarianValidation,
  updateVeterinarianValidation,
}
