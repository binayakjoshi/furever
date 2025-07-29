const { body } = require("express-validator")

const createLostPetValidation = [
  body("petId").notEmpty().withMessage("Pet ID is required").isMongoId().withMessage("Invalid pet ID format"),
  body("breed")
    .notEmpty()
    .withMessage("Breed is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Breed must be between 2 and 50 characters")
    .trim(),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .trim(),
  body("petType").optional().isIn(["Dog", "Cat"]).withMessage("Pet type must be either Dog or Cat"),
  body("contactInfo.phone").notEmpty().withMessage("Phone number is required").trim(),
  body("contactInfo.email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
  body("contactInfo.alternateContact").optional().trim(),
]

const updateLostPetValidation = [
  body("breed")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Breed must be between 2 and 50 characters")
    .trim(),
  body("description")
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .trim(),
  body("petType").optional().isIn(["Dog", "Cat"]).withMessage("Pet type must be either Dog or Cat"),
  body("contactInfo.phone").optional().trim(),
  body("contactInfo.email").optional().isEmail().withMessage("Invalid email format"),
  body("status")
    .optional()
    .isIn(["active", "cancelled", "found"])
    .withMessage("Status must be: active, cancelled, or found"),
]

const reportFoundPetValidation = [
  body("reporterName")
    .notEmpty()
    .withMessage("Reporter name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),
  body("reporterContact")
    .notEmpty()
    .withMessage("Contact information is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Contact must be between 5 and 100 characters")
    .trim(),
  body("message").optional().isLength({ max: 500 }).withMessage("Message must not exceed 500 characters").trim(),
  body("location")
    .notEmpty()
    .withMessage("Location where pet was found is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Location must be between 5 and 200 characters")
    .trim(),
]

module.exports = {
  createLostPetValidation,
  updateLostPetValidation,
  reportFoundPetValidation,
}
