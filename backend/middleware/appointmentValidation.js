const { body } = require("express-validator")


const expressInterestValidation = [
  body("veterinarianId")
    .notEmpty()
    .withMessage("Veterinarian ID is required")
    .isMongoId()
    .withMessage("Invalid veterinarian ID format"),
  body("message")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Message cannot exceed 300 characters")
    .trim(),
]


const updateInterestStatusValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["appointment_requested", "appointment_confirmed", "appointment_completed"])
    .withMessage("Status must be one of: appointment_requested, appointment_confirmed, appointment_completed"),
]

module.exports = {
  expressInterestValidation,
  updateInterestStatusValidation,
}
