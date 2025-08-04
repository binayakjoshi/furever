const { body } = require("express-validator")


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
  updateInterestStatusValidation,
}
