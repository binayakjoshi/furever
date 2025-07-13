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
  body("licenseNumber")
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("License number must be between 1 and 50 characters"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),

]

const updateVeterinarianValidation = [
  body("name").optional().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").optional().isEmail().withMessage("Please provide a valid email address"),
  body("degree").optional().isLength({ min: 2, max: 200 }).withMessage("Degree must be between 2 and 200 characters"),
  body("yearsOfExperience")
    .optional()
    .isNumeric()
    .withMessage("Years of experience must be a number")
    .custom((value) => value >= 0 && value <= 60),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),

]

module.exports = {
  createVeterinarianValidation,
  updateVeterinarianValidation,
}
