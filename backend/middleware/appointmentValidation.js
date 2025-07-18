const { body } = require("express-validator")

const createAppointmentValidation = [
  body("veterinarianId")
    .notEmpty()
    .withMessage("Veterinarian ID is required")
    .isMongoId()
    .withMessage("Invalid veterinarian ID format"),
  body("petId")
    .notEmpty()
    .withMessage("Pet ID is required")
    .isMongoId()
    .withMessage("Invalid pet ID format"),
  body("reason")
    .notEmpty()
    .withMessage("Reason for appointment is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Reason must be between 5 and 200 characters")
    .trim(),
  body("urgency")
    .optional()
    .isIn(["low", "medium", "high", "emergency"])
    .withMessage("Urgency must be one of: low, medium, high, emergency"),
]

const updateAppointmentValidation = [
  body("reason")
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage("Reason must be between 5 and 200 characters")
    .trim(),
  body("urgency")
    .optional()
    .isIn(["low", "medium", "high", "emergency"])
    .withMessage("Urgency must be one of: low, medium, high, emergency"),
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage("Status must be one of: pending, confirmed, cancelled, completed"),
]

const cancelAppointmentValidation = [
  body("cancellationReason")
    .optional()
    .isLength({ min: 5, max: 300 })
    .withMessage("Cancellation reason must be between 5 and 300 characters")
    .trim(),
]

module.exports = {
  createAppointmentValidation,
  updateAppointmentValidation,
  cancelAppointmentValidation,
}
