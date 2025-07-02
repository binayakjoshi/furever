// ...existing code...
const { body } = require("express-validator")

const createAdoptionValidation = [
  body("pet").notEmpty().withMessage("Pet reference is required").isMongoId().withMessage("Invalid pet ID format"),
  body("title")
    .notEmpty()
    .withMessage("Adoption post title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .notEmpty()
    .withMessage("Adoption post description is required")
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("breed")
    .notEmpty()
    .withMessage("Pet breed is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Breed must be between 1 and 100 characters"),
  body("petAge")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Pet age cannot be negative"),
  body("image.url")
    .notEmpty()
    .withMessage("Pet image URL is required")
    .isURL()
    .withMessage("Invalid image URL"),
  body("image.publicId")
    .notEmpty()
    .withMessage("Pet image public ID is required"),
  body("dob")
    .notEmpty()
    .withMessage("Pet date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format for date of birth"),
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("contactInfo.phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("contactInfo.email").optional().isEmail().withMessage("Please provide a valid email address"),
  body("contactInfo.preferredContact")
    .optional()
    .isIn(["phone", "email", "both"])
    .withMessage("Preferred contact must be phone, email, or both"),
  body("requirements")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Requirements cannot exceed 500 characters"),
]

const updateAdoptionValidation = [
  body("title").optional().isLength({ min: 5, max: 100 }).withMessage("Title must be between 5 and 100 characters"),
  body("description")
    .optional()
    .isLength({ min: 20, max: 1000 })
    .withMessage("Description must be between 20 and 1000 characters"),
  body("breed")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Breed must be between 1 and 100 characters"),
  body("petAge")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Pet age cannot be negative"),
  body("image.url")
    .optional()
    .isURL()
    .withMessage("Invalid image URL"),
  body("image.publicId")
    .optional()
    .isString()
    .withMessage("Image public ID must be a string"),
  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for date of birth"),
  body("location")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
  body("contactInfo.phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("contactInfo.email").optional().isEmail().withMessage("Please provide a valid email address"),
  body("contactInfo.preferredContact")
    .optional()
    .isIn(["phone", "email", "both"])
    .withMessage("Preferred contact must be phone, email, or both"),
  body("requirements")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Requirements cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["active", "pending", "adopted", "cancelled"])
    .withMessage("Status must be active, pending, adopted, or cancelled"),
]


module.exports = {
  createAdoptionValidation,
  updateAdoptionValidation,
}
