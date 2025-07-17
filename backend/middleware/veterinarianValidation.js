const { body } = require("express-validator")

const createVeterinarianValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("degree")
    .notEmpty()
    .withMessage("Degree is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Degree must be between 2 and 200 characters"),
  body("experience")
    .isNumeric()
    .withMessage("Experience must be a number")
    .custom((value) => value >= 0 && value <= 60)
    .withMessage("Experience must be between 0 and 60 years"),
  body("licenseNumber")
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("License number must be between 1 and 50 characters"),
  body("availability.days")
    .optional()
    .isArray()
    .withMessage("Availability days must be an array"),
  body("availability.hours.start")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("availability.hours.end")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
]

const updateVeterinarianValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("degree")
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage("Degree must be between 2 and 200 characters"),
  body("experience")
    .optional()
    .isNumeric()
    .withMessage("Experience must be a number")
    .custom((value) => value >= 0 && value <= 60)
    .withMessage("Experience must be between 0 and 60 years"),
  body("availability.days")
    .optional()
    .isArray()
    .withMessage("Availability days must be an array"),
  body("availability.hours.start")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format"),
  body("availability.hours.end")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format"),
]

module.exports = {
  createVeterinarianValidation,
  updateVeterinarianValidation,
}
